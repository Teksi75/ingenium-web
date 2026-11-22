-- Forward migration; postgres in an explicitly authorized isolated DB first.
-- service_role is trusted backend authority, NOT an end-user identity.
-- The backend must derive actors from verified identity + ADMIN_ALLOWLIST.
begin;

revoke all on schema prereg_private from public, anon, authenticated, service_role;
alter default privileges in schema prereg_private revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema prereg_private revoke execute on functions from public, anon, authenticated, service_role;

-- No FK: audit history must survive any separately authorized phase-2 deletion.
create table prereg_private.admin_audit_events (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  occurred_at timestamptz not null default pg_catalog.clock_timestamp(),
  actor_id uuid not null,
  actor_email text not null,
  actor_role text not null check (actor_role in ('reader', 'admin')),
  action text not null check (action in ('list', 'detail', 'status_change', 'cancel', 'login', 'logout', 'access_denied')),
  registration_id uuid,
  from_status text,
  to_status text,
  from_group text,
  to_group text,
  request_id uuid not null default pg_catalog.gen_random_uuid()
);
alter table prereg_private.admin_audit_events enable row level security;

create function prereg_private.protect_admin_audit() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'audit is append-only' using errcode = '23514';
end;
$$;
create trigger protect_admin_audit before update or delete on prereg_private.admin_audit_events
for each row execute function prereg_private.protect_admin_audit();
create trigger protect_admin_audit_truncate before truncate on prereg_private.admin_audit_events
for each statement execute function prereg_private.protect_admin_audit();

create function prereg_private.validate_admin_actor(p_actor_id uuid, p_actor_email text, p_actor_role text)
returns void language plpgsql set search_path = '' as $$
begin
  -- Shape validation is not authentication. Only the trusted server supplies these.
  if p_actor_id is null or p_actor_email is null or length(p_actor_email) > 254
    or p_actor_email <> lower(btrim(p_actor_email))
    or p_actor_email !~ '^[^[:space:]@]+@[^[:space:]@.]+([.][^[:space:]@.]+)+$'
    or p_actor_role is null or p_actor_role not in ('reader', 'admin') then
    raise exception 'invalid admin actor' using errcode = '42501';
  end if;
end;
$$;

-- Single insertion path for every audit event. No payload/filter/contact fields.
create function prereg_private.record_admin_event(
  p_actor_id uuid, p_actor_email text, p_actor_role text, p_action text,
  p_registration_id uuid default null, p_from_status text default null,
  p_to_status text default null, p_from_group text default null, p_to_group text default null
) returns void language plpgsql set search_path = '' as $$
begin
  perform prereg_private.validate_admin_actor(p_actor_id, p_actor_email, p_actor_role);
  insert into prereg_private.admin_audit_events (
    actor_id, actor_email, actor_role, action, registration_id, from_status, to_status, from_group, to_group
  ) values (
    p_actor_id, p_actor_email, p_actor_role, p_action, p_registration_id,
    p_from_status, p_to_status, p_from_group, p_to_group
  );
end;
$$;

create function public.admin_list_registrations(
  p_actor_id uuid, p_actor_email text, p_actor_role text,
  p_school text default null, p_status text default null, p_group text default null,
  p_limit integer default 50, p_offset integer default 0
) returns jsonb language plpgsql security definer
set search_path = '' as $$
declare
  v_items jsonb;
  v_total bigint;
begin
  perform prereg_private.validate_admin_actor(p_actor_id, p_actor_email, p_actor_role);
  if (p_school is not null and p_school not in ('uncuyo', 'etec', 'ambos'))
    or (p_status is not null and p_status not in ('recibida', 'contactada', 'horario_propuesto', 'convenio_enviado', 'confirmada', 'lista_espera', 'cancelada'))
    or (p_group is not null and p_group not in ('grupo-1', 'grupo-2', 'grupo-3', 'grupo-4'))
    or p_limit is null or p_limit not between 1 and 100
    or p_offset is null or p_offset not between 0 and 10000 then
    raise exception 'invalid admin list filters or pagination' using errcode = '22023';
  end if;
  -- Both count and page share one statement snapshot. Group means requested group,
  -- not confirmed_group. Aggregation explicitly retains the stable page order.
  with filtered as materialized (
    select r.id, r.public_code, r.student_name, r.target_school, r.status, r.groups,
      r.confirmed_group, r.created_at, r.course_year, r.first_preference
    from prereg_private.registrations r
    where (p_school is null or r.target_school = p_school)
      and (p_status is null or r.status = p_status)
      and (p_group is null or p_group = any(r.groups))
  ), page as (
    select r.id, r.public_code, r.student_name, r.target_school, r.status, r.groups,
      r.confirmed_group, r.created_at, r.course_year, r.first_preference
    from filtered r order by r.created_at desc, r.id desc
    limit p_limit offset p_offset
  )
  select (select count(*) from filtered), coalesce((
    select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'id', r.id, 'public_code', r.public_code, 'student_name', r.student_name,
      'target_school', r.target_school, 'status', r.status, 'groups', r.groups,
      'confirmed_group', r.confirmed_group, 'created_at', r.created_at,
      'course_year', r.course_year, 'first_preference', r.first_preference
    ) order by r.created_at desc, r.id desc) from page r
  ), '[]'::jsonb) into v_total, v_items;
  perform prereg_private.record_admin_event(p_actor_id, p_actor_email, p_actor_role, 'list');
  return pg_catalog.jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

create function public.admin_registration_detail(
  p_actor_id uuid, p_actor_email text, p_actor_role text, p_id uuid
) returns jsonb language plpgsql security definer
set search_path = '' as $$
declare
  v_detail jsonb;
begin
  perform prereg_private.validate_admin_actor(p_actor_id, p_actor_email, p_actor_role);
  select pg_catalog.jsonb_build_object(
    'id', r.id, 'public_code', r.public_code, 'course_year', r.course_year, 'entry_year', r.entry_year,
    'student_name', r.student_name, 'birth_date', r.birth_date, 'primary_school', r.primary_school,
    'grade', r.grade, 'target_school', r.target_school, 'other_school', r.other_school,
    'guardian_name', r.guardian_name, 'relationship', r.relationship, 'whatsapp', r.whatsapp,
    'email', r.email, 'locality', r.locality, 'groups', r.groups, 'first_preference', r.first_preference,
    'schedule_notes', r.schedule_notes, 'difficult_subjects', r.difficult_subjects,
    'pedagogical_notes', r.pedagogical_notes, 'referral_source', r.referral_source,
    'status', r.status, 'confirmed_group', r.confirmed_group, 'confirmed_slot', r.confirmed_slot,
    'program_version', r.program_version, 'privacy_version', r.privacy_version,
    'program_accepted_at', r.program_accepted_at, 'privacy_accepted_at', r.privacy_accepted_at,
    'created_at', r.created_at, 'updated_at', r.updated_at
  ) into v_detail from prereg_private.registrations r where r.id = p_id;
  if v_detail is not null then
    perform prereg_private.record_admin_event(p_actor_id, p_actor_email, p_actor_role, 'detail', p_id);
  end if;
  return v_detail;
end;
$$;

create function public.admin_set_registration_status(
  p_actor_id uuid, p_actor_email text, p_actor_role text,
  p_id uuid, p_status text, p_group text default null
) returns jsonb language plpgsql security definer
set search_path = '' as $$
declare
  v_from_status text;
  v_from_group text;
  v_result jsonb;
begin
  perform prereg_private.validate_admin_actor(p_actor_id, p_actor_email, p_actor_role);
  if p_actor_role <> 'admin' then
    raise exception 'admin role required' using errcode = '42501';
  end if;
  if p_status is null or p_status not in ('recibida', 'contactada', 'horario_propuesto', 'convenio_enviado', 'confirmada', 'lista_espera', 'cancelada')
    or (p_group is not null and p_group not in ('grupo-1', 'grupo-2', 'grupo-3', 'grupo-4'))
    or (p_status = 'confirmada' and p_group is null)
    or (p_status <> 'confirmada' and p_group is not null) then
    raise exception 'invalid admin status or group' using errcode = '22023';
  end if;
  -- Lock and capture together: concurrent changes cannot forge the old state.
  select r.status, r.confirmed_group into v_from_status, v_from_group
    from prereg_private.registrations r where r.id = p_id for update;
  if not found then
    raise exception 'registration not found' using errcode = 'P0002';
  end if;
  -- Existing immutable-data, compatible-group, capacity and slot triggers own invariants.
  perform prereg_private.set_registration_status(p_id, p_status, p_group);
  select pg_catalog.jsonb_build_object(
    'id', r.id, 'status', r.status, 'confirmed_group', r.confirmed_group, 'confirmed_slot', r.confirmed_slot
  ) into v_result from prereg_private.registrations r where r.id = p_id;
  perform prereg_private.record_admin_event(p_actor_id, p_actor_email, p_actor_role,
    case when p_status = 'cancelada' then 'cancel' else 'status_change' end, p_id,
    v_from_status, v_result->>'status', v_from_group, v_result->>'confirmed_group');
  return v_result;
end;
$$;

create function public.admin_log_event(
  p_actor_id uuid, p_actor_email text, p_actor_role text, p_action text
) returns void language plpgsql security definer
set search_path = '' as $$
begin
  perform prereg_private.validate_admin_actor(p_actor_id, p_actor_email, p_actor_role);
  if p_action is null or p_action not in ('login', 'logout', 'access_denied') then
    raise exception 'invalid admin event' using errcode = '22023';
  end if;
  perform prereg_private.record_admin_event(p_actor_id, p_actor_email, p_actor_role, p_action);
end;
$$;

revoke all on function public.admin_list_registrations(uuid, text, text, text, text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.admin_list_registrations(uuid, text, text, text, text, text, integer, integer) to service_role;
revoke all on function public.admin_registration_detail(uuid, text, text, uuid) from public, anon, authenticated;
grant execute on function public.admin_registration_detail(uuid, text, text, uuid) to service_role;
revoke all on function public.admin_set_registration_status(uuid, text, text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.admin_set_registration_status(uuid, text, text, uuid, text, text) to service_role;
revoke all on function public.admin_log_event(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_log_event(uuid, text, text, text) to service_role;
revoke all on all tables in schema prereg_private from public, anon, authenticated, service_role;
revoke all on all functions in schema prereg_private from public, anon, authenticated, service_role;

commit;
