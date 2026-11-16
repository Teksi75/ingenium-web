-- Engine integration tests. Run ONLY as postgres in an authorized disposable
-- nonproduction Supabase database AFTER the migration. All fixtures are synthetic.
-- This file is executable SQL, not evidence that it has run in this repository.
begin;

create function pg_temp.assert_ok(p_ok boolean, p_label text) returns void
language plpgsql as $$ begin
  if p_ok is distinct from true then raise exception 'assertion failed: %', p_label; end if;
end; $$;
create function pg_temp.fixture() returns jsonb language sql as $$
  select '{"studentName":"Estudiante Ficticio","birthDate":"2014-02-28","primarySchool":"Escuela ficticia","targetSchool":"uncuyo","otherSchool":"","guardianName":"Responsable Ficticio","relationship":"tutor","whatsapp":"5492615550101","email":"synthetic@example.test","locality":"","groups":["grupo-1","grupo-2"],"firstPreference":"grupo-1","scheduleNotes":"","difficultSubjects":"","pedagogicalNotes":"","referralSource":"","acceptedProgram":true,"acceptedPrivacy":true,"website":""}'::jsonb;
$$;
create function pg_temp.send(p_n integer, p_key uuid, p_data jsonb default pg_temp.fixture(), p_rate text default null)
returns jsonb language sql as $$
  select public.submit_preinscripcion(p_key, repeat(md5('request:' || p_n), 2), repeat(md5('student:' || p_n), 2),
    coalesce(p_rate, repeat(md5('contact:' || p_n), 2)), 2027, 2028, '1', '1', p_data);
$$;

-- Privileges, schema isolation, RLS and callable function boundaries.
do $$
declare t text; r text;
begin
  foreach r in array array['anon', 'authenticated', 'service_role'] loop
    perform pg_temp.assert_ok(not has_schema_privilege(r, 'prereg_private', 'USAGE'), r || ' private schema denied');
    foreach t in array array['registrations', 'cycle_groups', 'rate_windows'] loop
      perform pg_temp.assert_ok(not has_table_privilege(r, 'prereg_private.' || t, 'SELECT,INSERT,UPDATE,DELETE'), r || ' table denied: ' || t);
      perform pg_temp.assert_ok((select relrowsecurity from pg_class where oid = ('prereg_private.' || t)::regclass), 'relrowsecurity: ' || t);
    end loop;
    perform pg_temp.assert_ok(not has_function_privilege(r, 'prereg_private.set_registration_status(uuid,text,text)', 'EXECUTE'), r || ' admin function denied');
    perform pg_temp.assert_ok(has_function_privilege(r, 'public.submit_preinscripcion(uuid,text,text,text,integer,integer,text,text,jsonb)', 'EXECUTE') = (r = 'service_role'), r || ' RPC permission');
  end loop;
  perform pg_temp.assert_ok(not exists (select 1 from pg_policies where schemaname = 'prereg_private'), 'no public RLS policies');
  perform pg_temp.assert_ok((select prosecdef and proconfig @> array['search_path=""'] from pg_proc
    where oid = 'public.submit_preinscripcion(uuid,text,text,text,integer,integer,text,text,jsonb)'::regprocedure), 'definer with empty search path');
end;
$$;

-- Idempotency, dedup and atomic counters. No assertions read production fixtures.
do $$
declare
  k uuid := gen_random_uuid(); receipt jsonb; replay jsonb; count_before bigint;
  limited_hash text := repeat(md5('limited-synthetic-contact'), 2);
  n integer;
begin
  receipt := pg_temp.send(100, k);
  perform pg_temp.assert_ok(receipt->>'outcome' = 'created' and receipt->>'public_code' is not null, 'created receipt');
  replay := pg_temp.send(100, k);
  perform pg_temp.assert_ok(replay->>'outcome' = 'replayed' and replay->>'public_code' = receipt->>'public_code', 'same-key replay');
  perform pg_temp.assert_ok((select status = 'recibida' and confirmed_slot is null and confirmed_group is null
    and course_year = 2027 and entry_year = 2028 and program_version = '1' and privacy_version = '1'
    and program_accepted_at = transaction_timestamp() and privacy_accepted_at = transaction_timestamp()
    from prereg_private.registrations where idempotency_key = k), 'initial state, versions and server dates');
  select sum(submissions) into count_before from prereg_private.rate_windows;
  perform pg_temp.assert_ok(pg_temp.send(101, k)->>'outcome' = 'conflict', 'changed key payload');
  perform pg_temp.assert_ok(pg_temp.send(100, gen_random_uuid()) = '{"outcome":"duplicate"}'::jsonb, 'different-key dedup has NO receipt');
  perform pg_temp.assert_ok((select sum(submissions) from prereg_private.rate_windows) = count_before, 'rate counter unchanged after replay/conflict/dedup');
  for n in 200..204 loop
    perform pg_temp.assert_ok(pg_temp.send(n, gen_random_uuid(), pg_temp.fixture(), limited_hash)->>'outcome' = 'created', 'five per contact/day allowed');
  end loop;
  perform pg_temp.assert_ok(pg_temp.send(205, gen_random_uuid(), pg_temp.fixture(), limited_hash) = '{"outcome":"limited"}'::jsonb, 'sixth contact/day denied');
  perform pg_temp.assert_ok((select submissions = 5 from prereg_private.rate_windows where rate_hash = limited_hash), 'rate counter unchanged on rejection');
  select sum(submissions) into count_before from prereg_private.rate_windows;
  begin
    perform pg_temp.send(206, gen_random_uuid(), pg_temp.fixture() || jsonb_build_object('pedagogicalNotes', repeat('x',1001)));
    raise exception 'long note accepted';
  exception when string_data_right_truncation then null;
  end;
  begin
    perform pg_temp.send(207, gen_random_uuid(), pg_temp.fixture() || '{"acceptedPrivacy":false}'::jsonb);
    raise exception 'false consent accepted';
  exception when check_violation then null;
  end;
  perform pg_temp.assert_ok((select sum(submissions) from prereg_private.rate_windows) = count_before, 'rate counter unchanged after invalid input');
  perform pg_temp.assert_ok(not exists(select 1 from prereg_private.registrations where student_hash = repeat(md5('student:206'),2)), 'no partially inserted record');

  insert into prereg_private.rate_windows values (repeat('f',64), current_date - 10, 1);
  perform pg_temp.send(208, gen_random_uuid());
  perform pg_temp.assert_ok(not exists(select 1 from prereg_private.rate_windows where rate_hash = repeat('f',64)), 'expired cleanup');
end;
$$;

-- Capacity under administrative calls AND direct privileged INSERT/UPDATE.
-- All rows remain unconfirmed until explicit status operation.
do $$
declare
  n integer; k uuid; rid uuid; overflow_id uuid; first_id uuid; second_id uuid;
  old_time timestamptz; before_count bigint;
begin
  for n in 300..308 loop
    k := gen_random_uuid(); perform pg_temp.send(n, k);
    select id into rid from prereg_private.registrations where idempotency_key = k;
    if n = 300 then first_id := rid; end if;
    if n = 301 then second_id := rid; end if;
    if n = 308 then overflow_id := rid;
    else perform prereg_private.set_registration_status(rid, 'confirmada', 'grupo-1'); end if;
  end loop;
  perform pg_temp.assert_ok((select count(*) = 8 and count(distinct confirmed_slot) = 8 from prereg_private.registrations where course_year = 2027 and confirmed_group = 'grupo-1'), 'eight real allocated slots');
  begin
    perform prereg_private.set_registration_status(overflow_id, 'confirmada', 'grupo-1');
    raise exception 'ninth confirmation accepted';
  exception when check_violation or unique_violation then null;
  end;
  perform pg_temp.assert_ok((select status = 'recibida' and confirmed_slot is null from prereg_private.registrations where id = overflow_id), 'ninth confirmation unchanged');
  begin
    update prereg_private.registrations set status = 'confirmada', confirmed_group = 'grupo-1', confirmed_slot = 1 where id = overflow_id;
    raise exception 'direct update overbooked';
  exception when check_violation or unique_violation then null;
  end;
  -- Direct insert cannot bypass the trigger by selecting a fabricated ninth slot.
  select count(*) into before_count from prereg_private.registrations;
  begin
    insert into prereg_private.registrations (
      idempotency_key,request_hash,student_hash,course_year,entry_year,student_name,birth_date,primary_school,target_school,
      guardian_name,relationship,whatsapp,email,groups,program_version,privacy_version,status,confirmed_group,confirmed_slot
    ) values (gen_random_uuid(),repeat('a',64),repeat('b',64),2027,2028,'Directo Ficticio','2014-01-01','Ficticia','etec',
      'Responsable Ficticio','tutor','5492615550101','direct@example.test',array['grupo-1'],'1','1','confirmada','grupo-1',9);
    raise exception 'direct insert overbooked';
  exception when check_violation or unique_violation then null;
  end;
  perform pg_temp.assert_ok((select count(*) from prereg_private.registrations) = before_count, 'direct insert rejected atomically');
  begin
    perform prereg_private.set_registration_status(overflow_id, 'confirmada', 'grupo-4');
    raise exception 'incompatible group accepted';
  exception when check_violation then null;
  end;
  begin
    update prereg_private.registrations set course_year = 2028, entry_year = 2029 where id = overflow_id;
    raise exception 'cross-cycle move accepted';
  exception when check_violation then null;
  end;
  select updated_at into old_time from prereg_private.registrations where id = first_id;
  perform prereg_private.set_registration_status(first_id, 'cancelada');
  perform pg_temp.assert_ok((select confirmed_slot is null and updated_at >= old_time from prereg_private.registrations where id = first_id), 'cancel releases and timestamp updates');
  perform prereg_private.set_registration_status(overflow_id, 'confirmada', 'grupo-1');
  perform pg_temp.assert_ok((select count(*) = 8 from prereg_private.registrations where confirmed_group = 'grupo-1'), 'cancel permits exactly one replacement');
  perform prereg_private.set_registration_status(second_id, 'confirmada', 'grupo-2');
  perform pg_temp.assert_ok((select count(*) = 7 from prereg_private.registrations where confirmed_group = 'grupo-1'), 'transfer releases source');
  perform pg_temp.assert_ok((select count(*) = 1 from prereg_private.registrations where confirmed_group = 'grupo-2'), 'transfer consumes destination');
  perform prereg_private.set_registration_status(second_id, 'lista_espera');
  perform pg_temp.assert_ok((select confirmed_group is null and confirmed_slot is null from prereg_private.registrations where id = second_id), 'waiting releases destination');
  begin
    update prereg_private.cycle_groups set capacity = 7 where course_year = 2027 and group_id = 'grupo-1';
    raise exception 'capacity mutation accepted';
  exception when check_violation then null;
  end;
end;
$$;

-- Future cycle seed preserves old registrations and cannot use an old-cycle group.
insert into prereg_private.cycle_groups values (2028, 'grupo-3', 8);
do $$
begin
  begin
    perform public.submit_preinscripcion(gen_random_uuid(), repeat('c',64), repeat('d',64), repeat('e',64), 2028, 2029, '2','2',pg_temp.fixture());
    raise exception 'cross-cycle groups accepted';
  exception when check_violation then null;
  end;
  perform pg_temp.assert_ok(exists(select 1 from prereg_private.registrations where course_year = 2027), 'old cycle preserved');
end;
$$;

rollback;
