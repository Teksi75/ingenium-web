-- Runnable PostgreSQL tests, NOT EXECUTED by structural Node checks.
-- postgres ONLY in an authorized empty disposable Supabase-compatible database,
-- after all three migrations. Use psql -X -v ON_ERROR_STOP=1; disconnect on error
-- rolls back the transaction. Fixtures/helpers/extra failure trigger all roll back.
begin;

create or replace function pg_temp.assert_ok(p_ok boolean, p_label text) returns void
language plpgsql as $$ begin
  if p_ok is distinct from true then raise exception 'assertion failed: %', p_label; end if;
end; $$;
create function pg_temp.observed_state() returns jsonb language sql as $$
  select jsonb_build_object(
    'registrations', (select coalesce(jsonb_agg(to_jsonb(r) order by id), '[]'::jsonb) from prereg_private.registrations r),
    'rates', (select coalesce(jsonb_agg(to_jsonb(w) order by rate_hash, window_day), '[]'::jsonb) from prereg_private.rate_windows w),
    'groups', (select jsonb_agg(to_jsonb(c) order by course_year, group_id) from prereg_private.cycle_groups c),
    'audit', (select coalesce(jsonb_agg(to_jsonb(a) order by id), '[]'::jsonb) from prereg_private.admin_audit_events a)
  );
$$;
-- INVOKER helpers deliberately exercise actual API roles, never bypass them.
create function pg_temp.as_role(p_role text, p_sql text) returns jsonb
language plpgsql as $$
declare v_result jsonb;
begin
  execute format('set local role %I', p_role);
  execute p_sql into v_result;
  reset role;
  return v_result;
exception when others then
  reset role;
  raise;
end; $$;
create function pg_temp.expect_error(p_role text, p_sql text, p_state text, p_label text)
returns void language plpgsql as $$
declare v_before jsonb := pg_temp.observed_state(); v_state text;
begin
  begin
    perform pg_temp.as_role(p_role, p_sql);
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate;
  end;
  perform pg_temp.assert_ok(v_state = p_state, p_label || ': SQLSTATE ' || coalesce(v_state, 'NO ERROR'));
  perform pg_temp.assert_ok(pg_temp.observed_state() = v_before, p_label || ': all rows, counters and audit unchanged');
end; $$;
create function pg_temp.expected_event(
  p_action text, p_role text, p_id uuid default null,
  p_from text default null, p_to text default null, p_from_group text default null, p_to_group text default null
) returns jsonb language sql as $$
  select jsonb_build_object('actor_id', '00000000-0000-0000-0000-000000000001',
    'actor_email', p_role || '@example.invalid', 'actor_role', p_role,
    'action', p_action, 'registration_id', p_id, 'from_status', p_from, 'to_status', p_to,
    'from_group', p_from_group, 'to_group', p_to_group);
$$;
create function pg_temp.assert_event(p_before bigint, p_expected jsonb) returns void
language plpgsql as $$
begin
  perform pg_temp.assert_ok((select count(*) = p_before + 1 from prereg_private.admin_audit_events), 'exactly one audit event');
  perform pg_temp.assert_ok((select count(*) = 1 from prereg_private.admin_audit_events a
    where to_jsonb(a) - array['id','occurred_at','request_id'] = p_expected
      and id is not null and request_id is not null and occurred_at >= transaction_timestamp()), 'exact audit fields and generated metadata');
  perform pg_temp.assert_ok((select count(distinct id) = count(*) and count(distinct request_id) = count(*)
    from prereg_private.admin_audit_events), 'unique generated audit metadata');
end; $$;
create function pg_temp.keys(p_value jsonb) returns text[] language sql as $$
  select array_agg(k order by k) from jsonb_object_keys(p_value) k;
$$;

-- Each fixture uses the real submit RPC, so original submission triggers run.
do $$
declare n integer; response jsonb;
begin
  perform pg_temp.assert_ok(not exists(select 1 from prereg_private.registrations)
    and not exists(select 1 from prereg_private.rate_windows)
    and not exists(select 1 from prereg_private.admin_audit_events), 'requires empty isolated DB');
  for n in 1..11 loop
    response := public.submit_preinscripcion(gen_random_uuid(), repeat(md5('admin-request:' || n),2),
      repeat(md5('admin-student:' || n),2), repeat(md5('admin-rate:' || n),2), 2027, 2028, '1', '1',
      jsonb_build_object('studentName', 'Estudiante Sintetico ' || n, 'birthDate', '2014-02-28',
        'primarySchool', 'Escuela ficticia', 'targetSchool', case when n = 2 then 'etec' else 'uncuyo' end,
        'guardianName', 'Responsable Sintetico', 'relationship', 'tutor', 'whatsapp', '5492615550101',
        'email', 'fixture@example.invalid', 'groups', jsonb_build_array('grupo-1','grupo-2'),
        'firstPreference', 'grupo-1', 'scheduleNotes', 'Horario ficticio', 'acceptedProgram', true,
        'acceptedPrivacy', true, 'website', ''));
    perform pg_temp.assert_ok(response->>'outcome' = 'created', 'synthetic fixture created');
  end loop;
end; $$;

-- Catalog observations complement (not replace) actual denied calls below.
do $$
declare r text; t text; f text; rid uuid; actor text := '''00000000-0000-0000-0000-000000000001''';
begin
  select id into strict rid from prereg_private.registrations where student_name = 'Estudiante Sintetico 1';
  foreach r in array array['anon','authenticated','service_role'] loop
    perform pg_temp.assert_ok(not has_schema_privilege(r, 'prereg_private', 'USAGE'), r || ' schema denied');
    foreach t in array array['registrations','cycle_groups','rate_windows','admin_audit_events'] loop
      perform pg_temp.assert_ok(not has_table_privilege(r, 'prereg_private.' || t, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE'), r || ' table denied');
      perform pg_temp.assert_ok((select relrowsecurity from pg_class where oid = ('prereg_private.' || t)::regclass), 'RLS enabled');
      perform pg_temp.expect_error(r, 'select to_jsonb(t) from prereg_private.' || t || ' t limit 1', '42501', r || ' actual table read denied');
    end loop;
    perform pg_temp.expect_error(r, format('with x as (update prereg_private.registrations set status = ''cancelada'' where id = %L returning id) select to_jsonb(count(*)) from x', rid), '42501', 'actual registration update denied');
    perform pg_temp.expect_error(r, format('with x as (delete from prereg_private.registrations where id = %L returning id) select to_jsonb(count(*)) from x', rid), '42501', 'actual registration delete denied');
    perform pg_temp.expect_error(r, 'with x as (insert into prereg_private.admin_audit_events(actor_id,actor_email,actor_role,action) values (gen_random_uuid(),''reader@example.invalid'',''reader'',''login'') returning id) select to_jsonb(count(*)) from x', '42501', 'direct audit append denied');
    perform pg_temp.assert_ok(not has_function_privilege(r, 'prereg_private.set_registration_status(uuid,text,text)', 'EXECUTE'), 'private setter denied');
    perform pg_temp.expect_error(r, format('select to_jsonb(prereg_private.set_registration_status(%L,''contactada'',null))', rid), '42501', 'actual private setter denied');
    foreach f in array array[
      'public.admin_list_registrations(uuid,text,text,text,text,text,integer,integer)',
      'public.admin_registration_detail(uuid,text,text,uuid)',
      'public.admin_set_registration_status(uuid,text,text,uuid,text,text)',
      'public.admin_log_event(uuid,text,text,text)'
    ] loop
      perform pg_temp.assert_ok(has_function_privilege(r, f, 'EXECUTE') = (r = 'service_role'), 'service-only RPC grant');
      perform pg_temp.assert_ok((select prosecdef and proconfig @> array['search_path=""'] from pg_proc where oid = f::regprocedure), 'definer empty search path');
    end loop;
    if r <> 'service_role' then
      perform pg_temp.expect_error(r, 'select public.admin_list_registrations(' || actor || ',''reader@example.invalid'',''reader'')', '42501', 'browser list denied');
      perform pg_temp.expect_error(r, format('select public.admin_registration_detail(%s,''reader@example.invalid'',''reader'',%L)', actor, rid), '42501', 'browser detail denied');
      perform pg_temp.expect_error(r, format('select public.admin_set_registration_status(%s,''admin@example.invalid'',''admin'',%L,''cancelada'')', actor, rid), '42501', 'browser status denied');
      perform pg_temp.expect_error(r, 'select to_jsonb(public.admin_log_event(' || actor || ',''reader@example.invalid'',''reader'',''login''))', '42501', 'browser event denied');
    end if;
  end loop;
  perform pg_temp.assert_ok(not exists(select 1 from pg_policies where schemaname = 'prereg_private'), 'no API policies');
end; $$;

-- Reader/admin reads: exact public JSON contracts, filters, paging and read audit.
do $$
declare
  rid uuid; unknown_id uuid := gen_random_uuid(); result jsonb; detail jsonb; row_data jsonb;
  before_data jsonb; before_state jsonb; n bigint; role_name text; school text; state text; grp text;
  actor text := '''00000000-0000-0000-0000-000000000001'''; expected_ids jsonb;
  list_keys text[] := array['confirmed_group','course_year','created_at','first_preference','groups','id','public_code','status','student_name','target_school'];
begin
  select id, to_jsonb(r) into strict rid, row_data from prereg_private.registrations r where student_name = 'Estudiante Sintetico 1';
  before_data := pg_temp.observed_state() - 'audit';
  foreach role_name in array array['reader','admin'] loop
    select count(*) into n from prereg_private.admin_audit_events;
    result := pg_temp.as_role('service_role', format('select public.admin_list_registrations(%s,%L,%L)', actor, role_name || '@example.invalid', role_name));
    perform pg_temp.assert_ok(pg_temp.keys(result) = array['items','total'] and result->'total' = '11'::jsonb
      and jsonb_array_length(result->'items') = 11, 'default list contract');
    perform pg_temp.assert_ok(not exists(select 1 from jsonb_array_elements(result->'items') item
      where pg_temp.keys(item) <> list_keys), 'exact list projection');
    select jsonb_agg(id order by created_at desc, id desc) into expected_ids from prereg_private.registrations;
    perform pg_temp.assert_ok((select jsonb_agg(item->'id' order by ord) from jsonb_array_elements(result->'items') with ordinality x(item,ord)) = expected_ids, 'stable list order with timestamp ties');
    perform pg_temp.assert_event(n, pg_temp.expected_event('list', role_name));
    select count(*) into n from prereg_private.admin_audit_events;
    detail := pg_temp.as_role('service_role', format('select public.admin_registration_detail(%s,%L,%L,%L)', actor, role_name || '@example.invalid', role_name, rid));
    perform pg_temp.assert_ok(detail = row_data - array['idempotency_key','request_hash','student_hash'], 'exact detail projection: every business field, no hashes/key');
    perform pg_temp.assert_event(n, pg_temp.expected_event('detail', role_name, rid));
    before_state := pg_temp.observed_state();
    result := pg_temp.as_role('service_role', format('select public.admin_registration_detail(%s,%L,%L,%L)', actor, role_name || '@example.invalid', role_name, unknown_id));
    perform pg_temp.assert_ok(result is null and pg_temp.observed_state() = before_state, 'unknown id detail null, no audit');
  end loop;
  result := pg_temp.as_role('service_role', 'select public.admin_list_registrations(' || actor || ',''reader@example.invalid'',''reader'',''uncuyo'',''recibida'',''grupo-2'',1,1)');
  select jsonb_agg(id) into expected_ids from (select id from prereg_private.registrations
    where target_school = 'uncuyo' order by created_at desc, id desc limit 1 offset 1) page;
  perform pg_temp.assert_ok(result->'total' = '10'::jsonb and jsonb_array_length(result->'items') = 1
    and result->'items'->0->'id' = expected_ids->0, 'requested group, combined school/status filters and offset');
  -- Every known school/status/group enum is accepted, including empty matches.
  foreach school in array array['uncuyo','etec','ambos'] loop
    result := pg_temp.as_role('service_role', format('select public.admin_list_registrations(%s,''reader@example.invalid'',''reader'',%L)', actor, school));
    perform pg_temp.assert_ok((result->>'total')::bigint = (select count(*) from prereg_private.registrations where target_school = school), 'school targets exact school');
  end loop;
  foreach state in array array['recibida','contactada','horario_propuesto','convenio_enviado','confirmada','lista_espera','cancelada'] loop
    result := pg_temp.as_role('service_role', format('select public.admin_list_registrations(%s,''reader@example.invalid'',''reader'',null,%L)', actor, state));
    perform pg_temp.assert_ok((result->>'total')::bigint = (select count(*) from prereg_private.registrations where status = state), 'known status filter');
  end loop;
  foreach grp in array array['grupo-1','grupo-2','grupo-3','grupo-4'] loop
    result := pg_temp.as_role('service_role', format('select public.admin_list_registrations(%s,''reader@example.invalid'',''reader'',null,null,%L,100,10000)', actor, grp));
    perform pg_temp.assert_ok(result->'items' = '[]'::jsonb and (result->>'total')::bigint =
      (select count(*) from prereg_private.registrations where grp = any(groups)), 'valid bounds, group totals even past end');
  end loop;
  perform pg_temp.assert_ok(pg_temp.observed_state() - 'audit' = before_data, 'reads leave registrations/counters/capacity unchanged');
end; $$;

-- Invalid actor shapes are denied on EVERY RPC. No trusted identity is inferred.
do $$
declare actor_args text; query text; rid uuid; args text;
begin
  select id into strict rid from prereg_private.registrations where student_name = 'Estudiante Sintetico 1';
  foreach actor_args in array array[
    'null,''reader@example.invalid'',''reader''',
    '''00000000-0000-0000-0000-000000000001'',null,''reader''',
    '''00000000-0000-0000-0000-000000000001'','''',''reader''',
    '''00000000-0000-0000-0000-000000000001'',''invalid'',''reader''',
    '''00000000-0000-0000-0000-000000000001'','' Reader@example.invalid'',''reader''',
    '''00000000-0000-0000-0000-000000000001'',repeat(''x'',254)||''@example.invalid'',''reader''',
    '''00000000-0000-0000-0000-000000000001'',''reader@example.invalid'',null',
    '''00000000-0000-0000-0000-000000000001'',''reader@example.invalid'',''owner'''
  ] loop
    foreach query in array array[
      'select public.admin_list_registrations(' || actor_args || ')',
      format('select public.admin_registration_detail(%s,%L)', actor_args, rid),
      format('select public.admin_set_registration_status(%s,%L,''contactada'')', actor_args, rid),
      'select to_jsonb(public.admin_log_event(' || actor_args || ',''login''))'
    ] loop
      perform pg_temp.expect_error('service_role', query, '42501', 'invalid actor');
    end loop;
  end loop;
  args := '''00000000-0000-0000-0000-000000000001'',''reader@example.invalid'',''reader''';
  perform pg_temp.expect_error('service_role', format('select public.admin_set_registration_status(%s,%L,''cancelada'')', args, rid), '42501', 'reader cannot mutate');
  foreach query in array array[
    '''unknown'',null,null,50,0', 'null,''unknown'',null,50,0', 'null,null,''grupo-5'',50,0',
    'null,null,null,0,0', 'null,null,null,101,0', 'null,null,null,null,0',
    'null,null,null,50,-1', 'null,null,null,50,10001', 'null,null,null,50,null'
  ] loop
    perform pg_temp.expect_error('service_role', 'select public.admin_list_registrations(' || args || ',' || query || ')', '22023', 'invalid filters/pagination');
  end loop;
end; $$;

-- Admin mutations retain all submitted/consent data. Exact before/after audit.
do $$
declare
  rid uuid; other_id uuid; row_data jsonb; before_state jsonb; result jsonb; n bigint; state text; grp text;
  actor text := '''00000000-0000-0000-0000-000000000001'',''admin@example.invalid'',''admin''';
  previous_status text := 'recibida'; previous_group text := null;
begin
  select id, to_jsonb(r) into strict rid, row_data from prereg_private.registrations r where student_name = 'Estudiante Sintetico 1';
  before_state := pg_temp.observed_state();
  foreach state in array array['contactada','horario_propuesto','convenio_enviado','lista_espera','recibida','confirmada','confirmada','cancelada','recibida'] loop
    grp := case when state = 'confirmada' then
      case when previous_group = 'grupo-1' then 'grupo-2' else 'grupo-1' end else null end;
    select count(*) into n from prereg_private.admin_audit_events;
    result := pg_temp.as_role('service_role', format('select public.admin_set_registration_status(%s,%L,%L,%L)', actor, rid, state, grp));
    perform pg_temp.assert_ok(result = jsonb_build_object('id', rid, 'status', state, 'confirmed_group', grp,
      'confirmed_slot', case when state = 'confirmada' then 1 else null end), 'exact status result, cancel releases slot');
    perform pg_temp.assert_event(n, pg_temp.expected_event(case when state = 'cancelada' then 'cancel' else 'status_change' end,
      'admin', rid, previous_status, state, previous_group, grp)); -- exact mutation audit
    perform pg_temp.assert_ok((select to_jsonb(r) - array['status','confirmed_group','confirmed_slot','updated_at'] =
      row_data - array['status','confirmed_group','confirmed_slot','updated_at'] from prereg_private.registrations r where id = rid), 'immutable submitted data and consent');
    previous_status := state; previous_group := grp;
  end loop;
  perform pg_temp.assert_ok(pg_temp.observed_state()->'rates' = before_state->'rates'
    and pg_temp.observed_state()->'groups' = before_state->'groups', 'admin never alters quotas or capacities');
  foreach state in array array['unknown',null] loop
    perform pg_temp.expect_error('service_role', format('select public.admin_set_registration_status(%s,%L,%L)', actor, rid, state), '22023', 'invalid status');
  end loop;
  foreach grp in array array['grupo-5',null] loop
    perform pg_temp.expect_error('service_role', format('select public.admin_set_registration_status(%s,%L,''confirmada'',%L)', actor, rid, grp), '22023', 'invalid group for confirmation');
  end loop;
  perform pg_temp.expect_error('service_role', format('select public.admin_set_registration_status(%s,%L,''cancelada'',''grupo-1'')', actor, rid), '22023', 'invalid group on nonconfirmation');
  perform pg_temp.expect_error('service_role', format('select public.admin_set_registration_status(%s,%L,''contactada'')', actor, gen_random_uuid()), 'P0002', 'unknown id status');
  perform pg_temp.expect_error('service_role', 'select public.admin_set_registration_status(' || actor || ',null,''contactada'')', 'P0002', 'unknown id null');
  -- Valid enum but incompatible requested group is still trigger-owned.
  perform pg_temp.expect_error('service_role', format('select public.admin_set_registration_status(%s,%L,''confirmada'',''grupo-4'')', actor, rid), '23514', 'incompatible group');
  -- Fill eight actual slots via the gateway, then reject the ninth atomically.
  for other_id in select id from prereg_private.registrations where id <> rid order by id limit 8 loop
    perform pg_temp.as_role('service_role', format('select public.admin_set_registration_status(%s,%L,''confirmada'',''grupo-2'')', actor, other_id));
  end loop;
  perform pg_temp.assert_ok((select count(*) = 8 and count(distinct confirmed_slot) = 8 from prereg_private.registrations where confirmed_group = 'grupo-2'), 'capacity eight real slots');
  perform pg_temp.expect_error('service_role', format('select public.admin_set_registration_status(%s,%L,''confirmada'',''grupo-2'')', actor, rid), '23514', 'capacity ninth rejected');
  perform pg_temp.as_role('service_role', format('select public.admin_set_registration_status(%s,%L,''cancelada'')', actor, rid));
  -- T1's active-only uniqueness still applies through the new gateway. Submit
  -- the same synthetic student through the existing real RPC with a fresh key.
  result := public.submit_preinscripcion(gen_random_uuid(), repeat(md5('admin-successor'),2),
    repeat(md5('admin-student:1'),2), repeat(md5('admin-successor-rate'),2), 2027, 2028, '1', '1',
    jsonb_build_object('studentName','Sucesor Sintetico','birthDate','2014-02-28','primarySchool','Escuela ficticia',
      'targetSchool','uncuyo','guardianName','Responsable Sintetico','relationship','tutor','whatsapp','5492615550101',
      'email','successor@example.invalid','groups',jsonb_build_array('grupo-1'),
      'acceptedProgram',true,'acceptedPrivacy',true,'website',''));
  perform pg_temp.assert_ok(result->>'outcome' = 'created', 'cancelled student can resubmit');
  perform pg_temp.expect_error('service_role', format('select public.admin_set_registration_status(%s,%L,''contactada'')', actor, rid), '23505', 'active successor conflict unchanged');
end; $$;

-- Auth events cannot forge mutations. Every accepted event has no target/state.
do $$
declare action_name text; role_name text; n bigint; result jsonb;
  actor text := '''00000000-0000-0000-0000-000000000001''';
begin
  foreach role_name in array array['reader','admin'] loop
    foreach action_name in array array['login','logout','access_denied'] loop
      select count(*) into n from prereg_private.admin_audit_events;
      result := pg_temp.as_role('service_role', format('select to_jsonb(public.admin_log_event(%s,%L,%L,%L))', actor, role_name || '@example.invalid', role_name, action_name));
      perform pg_temp.assert_event(n, pg_temp.expected_event(action_name, role_name));
    end loop;
  end loop;
  foreach action_name in array array['status_change','cancel','list','detail','unknown',null] loop
    perform pg_temp.expect_error('service_role', format('select to_jsonb(public.admin_log_event(%s,''admin@example.invalid'',''admin'',%L))', actor, action_name), '22023', 'no forged mutation event');
  end loop;
  -- Ownership does not silently bypass append-only row/statement triggers.
  perform pg_temp.expect_error('postgres', 'with x as (update prereg_private.admin_audit_events set action = ''logout'' returning id) select to_jsonb(count(*)) from x', '23514', 'audit tampering update');
  perform pg_temp.expect_error('postgres', 'with x as (delete from prereg_private.admin_audit_events returning id) select to_jsonb(count(*)) from x', '23514', 'audit tampering delete');
  perform pg_temp.expect_error('postgres', 'truncate prereg_private.admin_audit_events', '23514', 'audit tampering truncate');
end; $$;

-- Inject audit failure ONLY in this rollback transaction, without replacing the
-- production writer. Reads fail closed and mutations roll back their row update.
create function pg_temp.reject_test_audit() returns trigger language plpgsql as $$
begin
  if new.actor_email = 'audit-fail@example.invalid' then
    raise exception 'synthetic audit failure' using errcode = '23514';
  end if;
  return new;
end; $$;
create trigger reject_test_audit before insert on prereg_private.admin_audit_events
for each row execute function pg_temp.reject_test_audit();
do $$
declare rid uuid; query text;
  actor text := '''00000000-0000-0000-0000-000000000001'',''audit-fail@example.invalid'',''admin''';
begin
  -- Use a different student from the cancelled row with an active successor:
  -- the mutation must reach the injected audit failure, not uniqueness rejection.
  select id into strict rid from prereg_private.registrations where student_name = 'Estudiante Sintetico 2';
  foreach query in array array[
    'select public.admin_list_registrations(' || actor || ')',
    format('select public.admin_registration_detail(%s,%L)', actor, rid),
    format('select public.admin_set_registration_status(%s,%L,''contactada'')', actor, rid),
    'select to_jsonb(public.admin_log_event(' || actor || ',''login''))'
  ] loop
    perform pg_temp.expect_error('service_role', query, '23514', 'audit failure rolls back / reads fail closed');
  end loop;
end; $$;

rollback;
