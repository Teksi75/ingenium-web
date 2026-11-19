-- Executable PostgreSQL regression; NOT EXECUTED in the implementation environment.
-- Run as postgres ONLY in an authorized empty isolated Supabase-compatible DB,
-- after BOTH migrations. Existing tests must also run after both migrations.
-- No credentials or real contact data. All fixtures roll back, even on failure
-- when invoked with psql -X -v ON_ERROR_STOP=1 (connection close rolls back).
begin;

create or replace function pg_temp.assert_ok(p_ok boolean, p_label text) returns void
language plpgsql as $$ begin
  if p_ok is distinct from true then raise exception 'assertion failed: %', p_label; end if;
end; $$;
create or replace function pg_temp.fixture() returns jsonb language sql as $$
  select '{"studentName":"Estudiante Sintetico","birthDate":"2014-02-28","primarySchool":"Escuela ficticia","targetSchool":"ambos","otherSchool":"Otra ficticia","guardianName":"Responsable Sintetico","relationship":"tutor","whatsapp":"5492615550101","email":"cancelacion@example.invalid","locality":"Localidad ficticia","groups":["grupo-1","grupo-2"],"firstPreference":"grupo-1","scheduleNotes":"Horario original","difficultSubjects":"Materia ficticia","pedagogicalNotes":"Nota ficticia","referralSource":"Referencia ficticia","acceptedProgram":true,"acceptedPrivacy":true,"website":""}'::jsonb;
$$;
create or replace function pg_temp.send(
  p_key uuid, p_request text default repeat('a',64), p_student text default repeat('b',64),
  p_rate text default repeat('c',64), p_data jsonb default pg_temp.fixture()
) returns jsonb language sql as $$
  select public.submit_preinscripcion(p_key, p_request, p_student, p_rate, 2027, 2028, '1', '1', p_data);
$$;
-- Owner-only observations of complete stored rows, quotas and capacity config.
-- Fixtures/mutations use the actual public RPC and existing status setter.
create function pg_temp.observed_state() returns jsonb language sql as $$
  select jsonb_build_object(
    'registrations', (select coalesce(jsonb_agg(to_jsonb(r) order by id), '[]'::jsonb) from prereg_private.registrations r),
    'rates', (select coalesce(jsonb_agg(to_jsonb(w) order by rate_hash, window_day), '[]'::jsonb) from prereg_private.rate_windows w),
    'groups', (select jsonb_agg(to_jsonb(c) order by course_year, group_id) from prereg_private.cycle_groups c)
  );
$$;
create function pg_temp.submitted(p_row jsonb) returns jsonb language sql as $$
  select p_row - array['status','confirmed_group','confirmed_slot','updated_at'];
$$;

do $$
declare
  old_key uuid := gen_random_uuid(); new_key uuid := gen_random_uuid();
  old_receipt jsonb; new_receipt jsonb; response jsonb;
  old_id uuid; new_id uuid; replacement_id uuid; replacement_key uuid := gen_random_uuid();
  old_row jsonb; cancelled_row jsonb; new_row jsonb; before_state jsonb;
  old_slot smallint; new_slot smallint; state text; n integer;
begin
  perform pg_temp.assert_ok(not exists(select 1 from prereg_private.registrations)
    and not exists(select 1 from prereg_private.rate_windows), 'requires empty isolated DB');

  old_receipt := pg_temp.send(old_key);
  perform pg_temp.assert_ok(old_receipt->>'outcome' = 'created'
    and (old_receipt->>'public_code')::uuid is not null
    and old_receipt = jsonb_build_object('outcome','created','public_code',old_receipt->>'public_code'), 'original exact receipt');
  select id, to_jsonb(r) into strict old_id, old_row from prereg_private.registrations r where idempotency_key = old_key;
  perform pg_temp.assert_ok(old_row->>'status' = 'recibida'
    and old_row->>'confirmed_slot' is null and old_row->>'confirmed_group' is null
    and old_row->>'program_version' = '1' and old_row->>'privacy_version' = '1'
    and (old_row->>'program_accepted_at')::timestamptz = transaction_timestamp()
    and (old_row->>'privacy_accepted_at')::timestamptz = transaction_timestamp(), 'original consent and no allocation');

  -- Every unconfirmed active state remains a duplicate. A distinct rate hash
  -- proves rejection cannot even create a fresh quota window or leak a receipt.
  foreach state in array array['recibida','contactada','horario_propuesto','convenio_enviado','lista_espera'] loop
    perform prereg_private.set_registration_status(old_id, state);
    before_state := pg_temp.observed_state();
    response := pg_temp.send(gen_random_uuid(), p_rate => repeat('d',64));
    perform pg_temp.assert_ok(response = '{"outcome":"duplicate"}'::jsonb, 'active duplicate exact response: ' || state);
    perform pg_temp.assert_ok(pg_temp.observed_state() = before_state, 'active duplicate leaves all data and quotas unchanged: ' || state);
  end loop;

  perform prereg_private.set_registration_status(old_id, 'confirmada', 'grupo-1');
  select confirmed_slot into strict old_slot from prereg_private.registrations where id = old_id;
  perform pg_temp.assert_ok(old_slot = 1, 'original confirmation allocated first slot');
  before_state := pg_temp.observed_state();
  perform pg_temp.assert_ok(pg_temp.send(gen_random_uuid()) = '{"outcome":"duplicate"}'::jsonb, 'confirmed active duplicate exact response');
  perform pg_temp.assert_ok(pg_temp.observed_state() = before_state, 'confirmed duplicate leaves data and quotas unchanged');

  perform prereg_private.set_registration_status(old_id, 'cancelada');
  select to_jsonb(r) into strict cancelled_row from prereg_private.registrations r where id = old_id;
  perform pg_temp.assert_ok(pg_temp.submitted(cancelled_row) = pg_temp.submitted(old_row), 'cancellation retains ALL original submitted data and consent');
  perform pg_temp.assert_ok(cancelled_row->>'status' = 'cancelada'
    and cancelled_row->>'confirmed_group' is null and cancelled_row->>'confirmed_slot' is null
    and (cancelled_row->>'updated_at')::timestamptz >= (old_row->>'updated_at')::timestamptz, 'cancelled row retained and slot released');
  perform pg_temp.assert_ok(not exists(select 1 from prereg_private.registrations where confirmed_group = 'grupo-1'), 'no slot held by cancelled row');
  perform pg_temp.assert_ok(pg_temp.observed_state()->'rates' = before_state->'rates'
    and pg_temp.observed_state()->'groups' = before_state->'groups', 'cancel does not refund quota or change capacities');

  before_state := pg_temp.observed_state();
  perform pg_temp.assert_ok(pg_temp.send(old_key) = jsonb_build_object('outcome','replayed','public_code',old_receipt->>'public_code'), 'cancelled old key replays original receipt');
  perform pg_temp.assert_ok(pg_temp.observed_state() = before_state, 'cancelled replay changes nothing');
  perform pg_temp.assert_ok(pg_temp.send(old_key, p_request => repeat('e',64)) = '{"outcome":"conflict"}'::jsonb, 'changed old key remains conflict');
  perform pg_temp.assert_ok(pg_temp.observed_state() = before_state, 'conflict changes nothing');

  -- Same student, new key and changed schedule; never edit the original row.
  new_receipt := pg_temp.send(new_key, p_request => repeat('e',64),
    p_data => pg_temp.fixture() || '{"scheduleNotes":"Horario nuevo","firstPreference":"grupo-2"}'::jsonb);
  perform pg_temp.assert_ok(new_receipt->>'outcome' = 'created'
    and (new_receipt->>'public_code')::uuid is not null
    and new_receipt->>'public_code' <> old_receipt->>'public_code'
    and new_receipt = jsonb_build_object('outcome','created','public_code',new_receipt->>'public_code'), 'new submission has new exact receipt');
  select id, to_jsonb(r) into strict new_id, new_row from prereg_private.registrations r where idempotency_key = new_key;
  perform pg_temp.assert_ok(new_id <> old_id and (select count(*) = 2 from prereg_private.registrations), 'two distinct historical rows');
  perform pg_temp.assert_ok((select to_jsonb(r) = cancelled_row from prereg_private.registrations r where id = old_id), 'new submission leaves cancelled history exactly intact');
  perform pg_temp.assert_ok(new_row->>'schedule_notes' = 'Horario nuevo' and new_row->>'first_preference' = 'grupo-2'
    and new_row->>'status' = 'recibida' and new_row->>'confirmed_group' is null and new_row->>'confirmed_slot' is null
    and new_row->>'program_version' = '1' and new_row->>'privacy_version' = '1'
    and (new_row->>'program_accepted_at')::timestamptz = transaction_timestamp()
    and (new_row->>'privacy_accepted_at')::timestamptz = transaction_timestamp(), 'new data and consent, no automatic allocation');
  perform pg_temp.assert_ok((select count(*) = 1 and sum(submissions) = 2 from prereg_private.rate_windows), 'new submission consumes exactly one additional quota');

  before_state := pg_temp.observed_state();
  perform pg_temp.assert_ok(pg_temp.send(old_key) = jsonb_build_object('outcome','replayed','public_code',old_receipt->>'public_code'), 'old key still replays old receipt with active successor');
  perform pg_temp.assert_ok(pg_temp.observed_state() = before_state, 'old replay with successor changes nothing');
  perform pg_temp.assert_ok(pg_temp.send(new_key, p_request => repeat('e',64)) = jsonb_build_object('outcome','replayed','public_code',new_receipt->>'public_code'), 'new key replays new receipt');
  perform pg_temp.assert_ok(pg_temp.observed_state() = before_state, 'new replay changes nothing');
  perform pg_temp.assert_ok(pg_temp.send(gen_random_uuid(), p_rate => repeat('d',64)) = '{"outcome":"duplicate"}'::jsonb, 'another active duplicate remains rejected without receipt');
  perform pg_temp.assert_ok(pg_temp.observed_state() = before_state, 'successor duplicate changes no rows or counters');

  -- The index independently prevents reactivation alongside an active successor.
  begin
    perform prereg_private.set_registration_status(old_id, 'contactada');
    raise exception 'reactivation alongside active successor accepted';
  exception when unique_violation then null;
  end;
  perform pg_temp.assert_ok(pg_temp.observed_state() = before_state, 'rejected reactivation changes nothing');

  perform prereg_private.set_registration_status(new_id, 'confirmada', 'grupo-1');
  select confirmed_slot into strict new_slot from prereg_private.registrations where id = new_id;
  perform pg_temp.assert_ok(new_slot = old_slot, 'successor can use released original slot');
  before_state := pg_temp.observed_state();
  perform prereg_private.set_registration_status(new_id, 'cancelada');
  perform pg_temp.assert_ok((select pg_temp.submitted(to_jsonb(r)) = pg_temp.submitted(new_row)
    and status = 'cancelada' and confirmed_group is null and confirmed_slot is null
    from prereg_private.registrations r where id = new_id), 'confirmed cancellation retains all successor data and consent and releases slot');
  perform pg_temp.assert_ok(pg_temp.observed_state()->'rates' = before_state->'rates', 'confirmed cancellation does not refund quotas');

  -- Cancelled rows do not bypass the original five-per-contact/day limit.
  for n in 1..3 loop
    response := pg_temp.send(gen_random_uuid(), p_student => repeat(md5('quota-synthetic:' || n),2));
    perform pg_temp.assert_ok(response->>'outcome' = 'created', 'remaining quota accepted');
  end loop;
  before_state := pg_temp.observed_state();
  perform pg_temp.assert_ok(pg_temp.send(gen_random_uuid()) = '{"outcome":"limited"}'::jsonb, 'resubmission still limited at five');
  perform pg_temp.assert_ok(pg_temp.observed_state() = before_state, 'limited resubmission leaves all rows and quotas unchanged');

  response := pg_temp.send(replacement_key, p_student => repeat('f',64), p_rate => repeat('d',64));
  perform pg_temp.assert_ok(response->>'outcome' = 'created', 'unrelated replacement created');
  select id into strict replacement_id from prereg_private.registrations where idempotency_key = replacement_key;
  perform prereg_private.set_registration_status(replacement_id, 'confirmada', 'grupo-1');
  perform pg_temp.assert_ok((select confirmed_slot = new_slot from prereg_private.registrations where id = replacement_id), 'confirmed cancellation makes slot reusable');
  perform pg_temp.assert_ok((select count(*) = 1 from prereg_private.registrations where confirmed_group = 'grupo-1'), 'only replacement holds a slot');
  perform pg_temp.assert_ok((select to_jsonb(r) = cancelled_row from prereg_private.registrations r where id = old_id), 'original history still exactly unchanged');
end;
$$;

rollback;
