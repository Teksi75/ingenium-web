-- Forward migration only; run as postgres in an authorized isolated DB first.
-- The original unnamed UNIQUE (course_year, student_hash) in
-- 202608130001_preinscripciones.sql has this PostgreSQL-generated name.
-- Do not reapply the initial migration or change historical registrations.
begin;

alter table prereg_private.registrations
  drop constraint registrations_course_year_student_hash_key;
create unique index registrations_active_student
  on prereg_private.registrations (course_year, student_hash)
  where status <> 'cancelada';

-- Keep the public contract unchanged, including replay of cancelled receipts.
-- Only the student duplicate gate below excludes cancelled rows.
create or replace function public.submit_preinscripcion(
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
  if exists (select 1 from prereg_private.registrations where course_year = p_course_year and student_hash = p_student_hash and status <> 'cancelada') then
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
