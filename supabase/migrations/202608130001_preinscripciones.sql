-- Apply only with explicit authorization to a nonproduction Supabase project first.
-- Run as postgres. prereg_private MUST NOT be in Data API exposed schemas.
begin;

create schema prereg_private;
revoke all on schema prereg_private from public, anon, authenticated, service_role;
alter default privileges in schema prereg_private revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema prereg_private revoke execute on functions from public, anon, authenticated, service_role;

create table prereg_private.cycle_groups (
  course_year integer not null check (course_year between 2000 and 2200),
  group_id varchar(16) not null check (group_id in ('grupo-1', 'grupo-2', 'grupo-3', 'grupo-4')),
  capacity smallint not null check (capacity between 1 and 8),
  primary key (course_year, group_id)
);
insert into prereg_private.cycle_groups (course_year, group_id, capacity)
select 2027, 'grupo-' || n, 8 from pg_catalog.generate_series(1, 4) n;

create table prereg_private.registrations (
  id uuid primary key default gen_random_uuid(),
  public_code uuid not null default gen_random_uuid() unique,
  idempotency_key uuid not null unique,
  request_hash varchar(64) not null check (request_hash ~ '^[a-f0-9]{64}$'),
  student_hash varchar(64) not null check (student_hash ~ '^[a-f0-9]{64}$'),
  course_year integer not null check (course_year between 2000 and 2200),
  entry_year integer not null check (entry_year = course_year + 1),
  student_name varchar(160) not null check (length(btrim(student_name)) > 0),
  birth_date date not null check (birth_date < current_date and birth_date >= date '0001-01-01'),
  primary_school varchar(160) not null check (length(btrim(primary_school)) > 0),
  grade varchar(20) not null default 'séptimo grado' check (grade = 'séptimo grado'),
  target_school varchar(8) not null check (target_school in ('uncuyo', 'etec', 'ambos')),
  other_school varchar(160) not null default '',
  guardian_name varchar(160) not null check (length(btrim(guardian_name)) > 0),
  relationship varchar(8) not null check (relationship in ('madre', 'padre', 'tutor', 'otro')),
  whatsapp varchar(15) not null check (whatsapp ~ '^[0-9]{10,15}$'),
  email varchar(254) not null check (email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@.]+([.][^[:space:]@.]+)+$'),
  locality varchar(160) not null default '',
  groups varchar(16)[] not null check (cardinality(groups) between 1 and 4),
  first_preference varchar(16),
  schedule_notes varchar(1000) not null default '',
  difficult_subjects varchar(1000) not null default '',
  pedagogical_notes varchar(1000) not null default '',
  referral_source varchar(160) not null default '',
  status varchar(20) not null default 'recibida'
    check (status in ('recibida', 'contactada', 'horario_propuesto', 'convenio_enviado', 'confirmada', 'lista_espera', 'cancelada')),
  confirmed_group varchar(16),
  confirmed_slot smallint check (confirmed_slot between 1 and 8),
  program_version varchar(40) not null check (length(program_version) > 0),
  privacy_version varchar(40) not null check (length(privacy_version) > 0),
  program_accepted_at timestamptz not null default transaction_timestamp(),
  privacy_accepted_at timestamptz not null default transaction_timestamp(),
  created_at timestamptz not null default transaction_timestamp(),
  updated_at timestamptz not null default transaction_timestamp(),
  unique (course_year, student_hash),
  unique (course_year, confirmed_group, confirmed_slot),
  foreign key (course_year, confirmed_group) references prereg_private.cycle_groups (course_year, group_id),
  check (first_preference is null or first_preference = any(groups)),
  check ((status = 'confirmada' and confirmed_group is not null and confirmed_slot is not null)
    or (status <> 'confirmada' and confirmed_group is null and confirmed_slot is null))
);
create index registrations_cycle on prereg_private.registrations (course_year);
create index registrations_target_school on prereg_private.registrations (course_year, target_school);
create index registrations_status on prereg_private.registrations (course_year, status);
create index registrations_created_at on prereg_private.registrations (created_at);
create index registrations_groups on prereg_private.registrations using gin (groups);

-- No IP addresses or raw contact information. One keyed hash per contact/day.
create table prereg_private.rate_windows (
  rate_hash varchar(64) not null check (rate_hash ~ '^[a-f0-9]{64}$'),
  window_day date not null,
  submissions smallint not null check (submissions between 1 and 5),
  primary key (rate_hash, window_day)
);
create index rate_windows_expiry on prereg_private.rate_windows (window_day);

alter table prereg_private.cycle_groups enable row level security;
alter table prereg_private.registrations enable row level security;
alter table prereg_private.rate_windows enable row level security;
revoke all on all tables in schema prereg_private from public, anon, authenticated, service_role;
-- No RLS policies: no client can read/write; owner-only administrative access.

create function prereg_private.protect_cycle_group() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- Existing capacities and identities cannot change underneath allocations.
  -- Future cycles get NEW rows. A separate reviewed migration may change capacity.
  if new is distinct from old then
    raise exception 'cycle group configuration is immutable' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger protect_cycle_group before update on prereg_private.cycle_groups
for each row execute function prereg_private.protect_cycle_group();

create function prereg_private.guard_registration() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_capacity integer;
  v_slot smallint;
begin
  if tg_op = 'INSERT' then
    new.created_at := pg_catalog.transaction_timestamp();
    new.program_accepted_at := new.created_at;
    new.privacy_accepted_at := new.created_at;
  else
    -- The administrative status operation cannot silently rewrite submitted
    -- identity, consent, cycle, dedupe hash or idempotent receipt.
    if (pg_catalog.to_jsonb(new) - array['status', 'confirmed_group', 'confirmed_slot', 'updated_at'])
      is distinct from (pg_catalog.to_jsonb(old) - array['status', 'confirmed_group', 'confirmed_slot', 'updated_at']) then
      raise exception 'submitted data is immutable' using errcode = '23514';
    end if;
  end if;
  new.updated_at := pg_catalog.clock_timestamp();
  if pg_catalog.array_ndims(new.groups) is distinct from 1
    or pg_catalog.array_position(new.groups, null) is not null
    or (select count(distinct g) from pg_catalog.unnest(new.groups) g) <> pg_catalog.cardinality(new.groups)
    or exists (select 1 from pg_catalog.unnest(new.groups) g where not exists (
      select 1 from prereg_private.cycle_groups c where c.course_year = new.course_year and c.group_id = g
    )) then
    raise exception 'invalid compatible groups for cycle' using errcode = '23514';
  end if;
  if new.status = 'confirmada' then
    if new.confirmed_group is null or not (new.confirmed_group = any(new.groups)) then
      raise exception 'confirmation requires compatible group' using errcode = '23514';
    end if;
    -- Serializes every confirmation/transfer for this cycle/group. UNIQUE slot
    -- plus CHECK 1..8 is a second, persisted proof, including direct SQL writes.
    select c.capacity into v_capacity from prereg_private.cycle_groups c
      where c.course_year = new.course_year and c.group_id = new.confirmed_group for update;
    if not found then
      raise exception 'group not configured for cycle' using errcode = '23514';
    end if;
    select s::smallint into v_slot from pg_catalog.generate_series(1, v_capacity) s
      where not exists (select 1 from prereg_private.registrations r
        where r.course_year = new.course_year and r.confirmed_group = new.confirmed_group
          and r.confirmed_slot = s and r.id <> new.id)
      order by s limit 1;
    if v_slot is null then
      raise exception 'group capacity reached' using errcode = '23514';
    end if;
    -- Never trust a manually supplied slot. A state change leaving confirmation
    -- releases its slot; a mere preregistration never holds one.
    new.confirmed_slot := v_slot;
  else
    new.confirmed_group := null;
    new.confirmed_slot := null;
  end if;
  return new;
end;
$$;
create trigger guard_registration before insert or update on prereg_private.registrations
for each row execute function prereg_private.guard_registration();

-- Only postgres / explicitly authorized owner SQL sessions may call this.
-- No HTTP admin endpoint and no grant to service_role, anon or authenticated.
create function prereg_private.set_registration_status(p_id uuid, p_status text, p_group text default null)
returns void language plpgsql set search_path = '' as $$
begin
  update prereg_private.registrations set status = p_status, confirmed_group = p_group where id = p_id;
  if not found then raise exception 'registration not found'; end if;
end;
$$;

-- The only exposed entry point. JSON is transient transport, NOT stored as a blob.
-- The trusted server validates/normalizes, owns cycle/versions and hashes; column
-- bounds, constraints, triggers and transaction rules also apply inside PostgreSQL.
create function public.submit_preinscripcion(
  p_key uuid, p_request_hash text, p_student_hash text, p_rate_hash text,
  p_course_year integer, p_entry_year integer, p_program_version text,
  p_privacy_version text, p_data jsonb
) returns jsonb language plpgsql security definer
set search_path = '' as $$
declare
  v_existing prereg_private.registrations%rowtype;
  v_public_code uuid;
  v_counter smallint;
  v_day date := (pg_catalog.transaction_timestamp() at time zone 'UTC')::date;
begin
  if p_key is null or p_request_hash is null or p_request_hash !~ '^[a-f0-9]{64}$'
    or p_student_hash is null or p_student_hash !~ '^[a-f0-9]{64}$'
    or p_rate_hash is null or p_rate_hash !~ '^[a-f0-9]{64}$'
    or p_data is null or pg_catalog.jsonb_typeof(p_data) <> 'object'
    or p_data->'acceptedProgram' is distinct from 'true'::jsonb
    or p_data->'acceptedPrivacy' is distinct from 'true'::jsonb
    or p_data->>'website' is distinct from '' then
    raise exception 'invalid submission' using errcode = '23514';
  end if;
  -- Advisory hash collisions only serialize unrelated callers, never merge keys.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('prereg:key:' || p_key::text, 0));
  select * into v_existing from prereg_private.registrations where idempotency_key = p_key;
  if found then
    if v_existing.request_hash = p_request_hash then
      return pg_catalog.jsonb_build_object('outcome', 'replayed', 'public_code', v_existing.public_code);
    end if;
    return pg_catalog.jsonb_build_object('outcome', 'conflict');
  end if;
  if exists (select 1 from prereg_private.registrations where course_year = p_course_year and student_hash = p_student_hash) then
    return pg_catalog.jsonb_build_object('outcome', 'duplicate');
  end if;
  -- Subtransaction: constraints or unique races roll back ALL counter/cleanup work.
  begin
    insert into prereg_private.rate_windows (rate_hash, window_day, submissions) values (p_rate_hash, v_day, 1)
      on conflict (rate_hash, window_day) do update set submissions = prereg_private.rate_windows.submissions + 1
      where prereg_private.rate_windows.submissions < 5 returning submissions into v_counter;
    if not found then return pg_catalog.jsonb_build_object('outcome', 'limited'); end if;
    insert into prereg_private.registrations (
      idempotency_key, request_hash, student_hash, course_year, entry_year,
      student_name, birth_date, primary_school, target_school, other_school,
      guardian_name, relationship, whatsapp, email, locality, groups, first_preference,
      schedule_notes, difficult_subjects, pedagogical_notes, referral_source,
      program_version, privacy_version, status
    ) values (
      p_key, p_request_hash, p_student_hash, p_course_year, p_entry_year,
      p_data->>'studentName', (p_data->>'birthDate')::date, p_data->>'primarySchool', p_data->>'targetSchool', coalesce(p_data->>'otherSchool', ''),
      p_data->>'guardianName', p_data->>'relationship', p_data->>'whatsapp', p_data->>'email', coalesce(p_data->>'locality', ''),
      array(select pg_catalog.jsonb_array_elements_text(p_data->'groups'))::varchar(16)[], p_data->>'firstPreference',
      coalesce(p_data->>'scheduleNotes', ''), coalesce(p_data->>'difficultSubjects', ''), coalesce(p_data->>'pedagogicalNotes', ''), coalesce(p_data->>'referralSource', ''),
      p_program_version, p_privacy_version, 'recibida'
    ) returning public_code into v_public_code;
    -- Indexed bounded expiry cleanup; never an unbounded log or whole-table purge.
    delete from prereg_private.rate_windows w using (
      select rate_hash, window_day from prereg_private.rate_windows where window_day < v_day - 2
        order by window_day for update skip locked limit 100
    ) expired where w.rate_hash = expired.rate_hash and w.window_day = expired.window_day;
    return pg_catalog.jsonb_build_object('outcome', 'created', 'public_code', v_public_code);
  exception when unique_violation then
    -- A different key NEVER gets the existing receipt (including racing inserts).
    return pg_catalog.jsonb_build_object('outcome', 'duplicate');
  end;
end;
$$;
revoke all on function public.submit_preinscripcion(uuid, text, text, text, integer, integer, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.submit_preinscripcion(uuid, text, text, text, integer, integer, text, text, jsonb) to service_role;
revoke all on all functions in schema prereg_private from public, anon, authenticated, service_role;

commit;
