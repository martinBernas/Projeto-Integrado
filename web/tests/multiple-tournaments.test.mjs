import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const alice = '00000000-0000-4000-8000-000000000001';
const bob = '00000000-0000-4000-8000-000000000002';
async function database() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth, public to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;`);
  for (const file of ['202609120001_initial_schema.sql', '202609200001_september_mvp.sql', '202609200002_score_entry.sql', '202609260001_tournament_management.sql', '202609260002_participant_management.sql', '202609260003_multiple_tournaments.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
  }
  await db.exec('grant select, insert, update, delete on all tables in schema public to authenticated, anon');
  await db.query("insert into auth.users(id,email) values ($1,'alice@example.test'),($2,'bob@example.test')", [alice, bob]);
  return db;
}
async function login(db, id, role = 'authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  await db.exec(`set role ${role}`);
}
async function create(db, start = '2020-01-01', end = '2020-01-03') {
  return (await db.query("select public.create_tournament(' Torneio teste ', $1, $2) as id", [start, end])).rows[0].id;
}

test('multiple tournaments: list isolation, specific results, closed state and denied access', async () => {
  const db = await database();
  try {
    await login(db, alice);
    const first = await create(db);
    const second = await create(db);
    const hidden = await create(db);
    await db.exec('reset role');
    await db.query("insert into public.tournament_participants(tournament_id,player_id,eligible_from) values ($1,$3,'2020-01-01'),($2,$3,'2020-01-02')", [first, second, bob]);
    await db.query("insert into public.personal_scores(player_id,occurred_at,score) values ($1,'2020-01-01T15:00:00Z',12000)", [bob]);
    await db.query("insert into public.tournament_excluded_dates(tournament_id,excluded_date,reason) values ($1,'2020-01-03','Test')", [first]);
    await login(db, bob);
    assert.deepEqual((await db.query('select id from public.tournaments order by id')).rows.map(r => r.id), [first, second].sort());
    const get = async id => (await db.query('select public.get_tournament_dashboard($1) d', [id])).rows[0].d;
    const one = await get(first);
    const two = await get(second);
    assert.equal(one.tournament.id, first);
    assert.deepEqual(one.excluded_dates, ['2020-01-03']);
    assert.deepEqual(two.excluded_dates, []);
    assert.equal(one.participants[0].eligible_from, '2020-01-01');
    assert.equal(two.participants[0].eligible_from, '2020-01-02');
    assert.ok(one.results.some(r => r.raw_score === 12000));
    assert.ok(two.results.every(r => r.played_on >= '2020-01-02' && r.tournament_id === second));
    assert.deepEqual(await get(hidden), { access: false });
    assert.deepEqual(await get('00000000-0000-4000-8000-000000000099'), { access: false });
    assert.deepEqual((await db.query('select public.get_september_dashboard() d')).rows[0].d, { access: false });
    await login(db, alice);
    assert.equal((await get(hidden)).access, true);
    await db.query('select public.complete_tournament_history($1)', [first]);
    await db.query('select public.close_tournament($1)', [first]);
    const closed = await get(first);
    assert.ok(closed.tournament.closed_at);
    assert.deepEqual((await get(first)).results, closed.results);
    await db.query('select public.remove_tournament_participant($1,$2)', [second,bob]);
    await login(db,bob);
    assert.deepEqual(await get(second), { access: false });
    await login(db, '', 'anon');
    await assert.rejects(get(first), /permission denied/);
    await login(db, '');
    await assert.rejects(get(first), /authentication_required/);
  } finally { await db.close(); }
});
