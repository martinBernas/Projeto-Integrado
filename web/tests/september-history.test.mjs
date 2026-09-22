import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('carga de 22/09 confere identidades, importa 148 resultados e permite repeticao', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;`);
    for (const file of ['202609120001_initial_schema.sql', '202609200001_september_mvp.sql', '202609200002_score_entry.sql']) {
      await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
    }
    const sql = await readFile(new URL('../supabase/seeds/september-history-2026-09-22.sql', import.meta.url), 'utf8');
    const accounts = ['leonardohuffo', 'martin.bernasconi', 'fabio.teixeira.sap', 'arthur.andrade', 'tales.ocampos', 'dianaseibt', 'luizf9844', 'ramos.viniciusuriel', 'eduardobrohr2', 'crisbobsin', 'math.9711'];
    for (const account of accounts) {
      await db.query('insert into auth.users values(gen_random_uuid(), $1, $2)', [`${account}@example.test`, '{}']);
    }
    await db.exec('select private.provision_september((select id from auth.users limit 1))');
    await db.exec(sql);
    const counts = async () => (await db.query(`select
      (select count(*)::int from public.tournament_participants) participants,
      (select count(*)::int from public.personal_scores) scores,
      (select count(*)::int from private.score_changes) changes,
      (select history_ready from public.tournaments) ready`)).rows[0];
    const first = await counts();
    assert.equal(first.participants, 11);
    assert.equal(first.scores, 148);
    assert.equal(first.ready, false);
    assert.equal((await db.query(`select score from public.personal_scores s join auth.users u on u.id=s.player_id
      where u.email='martin.bernasconi@example.test' and played_on='2026-09-22'`)).rows[0].score, 18063);
    await db.exec(sql);
    assert.deepEqual(await counts(), first);
    await db.query('insert into auth.users values(gen_random_uuid(), $1, $2)', ['leonardohuffo@other.test', '{}']);
    await assert.rejects(db.exec(sql), /2 correspondencias/);
    await db.exec('rollback');
    assert.deepEqual(await counts(), first);
    await db.query('update auth.users set email=$1 where email=$2', ['changed@example.test', 'math.9711@example.test']);
    await db.query('delete from auth.users where email=$1', ['leonardohuffo@other.test']);
    await assert.rejects(db.exec(sql), /0 correspondencias/);
    await db.exec('rollback');
    assert.deepEqual(await counts(), first);
  } finally { await db.close(); }
});
