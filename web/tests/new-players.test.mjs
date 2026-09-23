import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('Luca e Zade: carga atomica, repetivel, elegibilidade e penalidades preservadas', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;`);
    for (const file of ['202609120001_initial_schema.sql', '202609200001_september_mvp.sql', '202609200002_score_entry.sql']) {
      await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
    }
    const luca = '8d899496-3cb0-41f6-b67d-4e57bb1185c4';
    const zade = '55a4aeaf-30bc-403a-a5e6-563328466313';
    await db.query('insert into auth.users(id,email) values($1,$2)', [luca, 'luca@example.test']);
    await db.query('select private.provision_september($1)', [luca]);
    const sql = await readFile(new URL('../supabase/seeds/september-new-players-2026-09-23.sql', import.meta.url), 'utf8');
    await assert.rejects(db.exec(sql), /Conta ou perfil ausente/);
    await db.exec('rollback');
    assert.equal((await db.query('select count(*)::int n from public.tournament_participants')).rows[0].n, 0);
    await db.query('insert into auth.users(id,email) values($1,$2)', [zade, 'zade@example.test']);
    await db.exec(sql);
    const counts = async () => (await db.query(`select
      (select count(*)::int from public.tournament_participants) participants,
      (select count(*)::int from public.personal_scores) scores,
      (select count(*)::int from private.score_changes) changes,
      (select history_ready from public.tournaments) ready`)).rows[0];
    const first = await counts();
    assert.equal(first.participants, 2);
    assert.equal(first.scores, 29);
    assert.equal(first.ready, false);
    assert.equal((await db.query("select count(*)::int n from public.tournament_participants where eligible_from='2026-09-01'")).rows[0].n, 2);
    await db.exec(sql);
    assert.deepEqual(await counts(), first);
    await db.exec('select private.complete_september_history()');
    await db.exec(sql);
    assert.deepEqual(await counts(), { ...first, ready: true });
    assert.equal((await db.query("select score from public.personal_scores where player_id=$1 and played_on='2026-09-22'", [zade])).rows[0].score, 21829);
  } finally { await db.close(); }
});
