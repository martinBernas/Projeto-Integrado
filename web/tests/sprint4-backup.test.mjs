import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const target = '20260900-0000-4000-8000-000000000001';
const alice = '00000000-0000-4000-8000-000000000001';
const bob = '00000000-0000-4000-8000-000000000002';
const script = name => readFile(new URL(`../supabase/rehearsal/sprint4/${name}.sql`, import.meta.url), 'utf8');

test('backup consistente, sem mutação dos dados, protegido, exportável e comparação detecta alterações', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth, public to authenticated, anon;`);
    for (const file of ['202609120001_initial_schema.sql','202609200001_september_mvp.sql','202609200002_score_entry.sql','202609260001_tournament_management.sql']) {
      await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url),'utf8'));
    }
    await db.query("insert into auth.users(id,email) values ($1,'alice@example.test'),($2,'bob@example.test')",[alice,bob]);
    await db.query('select private.provision_september($1)',[alice]);
    await db.query(`insert into public.tournament_participants(tournament_id,player_id,eligible_from)
      values ($1,$2,'2026-09-01'),($1,$3,'2026-09-01')`,[target,alice,bob]);
    await db.query(`insert into public.personal_scores(player_id,occurred_at,score)
      values ($1,'2026-09-01T15:00:00Z',20000),($2,'2026-09-01T15:00:00Z',15000),($1,'2026-08-01T15:00:00Z',12345)`,[alice,bob]);
    await db.query('update public.tournaments set history_ready=true where id=$1',[target]);
    await db.query("select private.refresh_tournament($1,'2026-09-03')",[target]);
    const live = async () => (await db.query(`select
      (select jsonb_agg(to_jsonb(t) order by id) from public.tournaments t) as tournaments,
      (select jsonb_agg(to_jsonb(s) order by id) from public.personal_scores s) as scores,
      (select jsonb_agg(to_jsonb(r) order by id) from public.tournament_score_results r) as results`)).rows;
    const before = await live();
    const captured = await db.exec(await script('01-backup'));
    assert.equal(captured.at(-1).rows[0].participantes,2);
    assert.equal(captured.at(-1).rows[0].pontuacoes_pessoais,3);
    assert.deepEqual(await live(),before);
    const exported = (await db.exec(await script('03-export'))).at(-1).rows[0].backup_completo;
    assert.equal(Object.keys(exported.snapshot.personal_scores).length,3);
    const compare = async () => {
      const result = await db.exec(await script('02-verify'));
      return result.find(r => r.rows?.[0]?.backup_id).rows[0];
    };
    assert.equal(Number((await compare()).diferencas),0);
    await assert.rejects(db.exec(await script('01-backup')),/Backup ja existe/);
    await db.exec('rollback');
    assert.deepEqual((await db.exec(await script('03-export'))).at(-1).rows[0].backup_completo,exported);
    await db.query("update public.personal_scores set score=22000 where player_id=$1 and played_on='2026-09-01'",[alice]);
    let diff = await compare();
    assert.ok(diff.detalhes.some(d=>d.section==='personal_scores' && d.change==='changed'));
    assert.ok(diff.detalhes.some(d=>d.section==='calculated_totals' && d.row_key===alice));
    await db.query('delete from public.tournament_participants where tournament_id=$1 and player_id=$2',[target,alice]);
    diff = await compare();
    assert.ok(diff.detalhes.some(d=>d.section==='participants' && d.change==='removed'));
    assert.ok(diff.detalhes.some(d=>d.section==='personal_scores' && d.change==='changed'));
    // Scores of a former participant are still compared against the baseline.
    await db.query("insert into public.personal_scores(player_id,occurred_at,score) values ($1,'2026-09-02T15:00:00Z',18000)",[alice]);
    assert.ok((await compare()).detalhes.some(d=>d.section==='personal_scores' && d.change==='added'));
    await db.query("delete from public.personal_scores where player_id=$1 and played_on='2026-08-01'",[alice]);
    assert.ok((await compare()).detalhes.some(d=>d.section==='personal_scores' && d.change==='removed'));
    assert.deepEqual((await db.exec(await script('03-export'))).at(-1).rows[0].backup_completo,exported);
    for (const role of ['authenticated','anon']) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.query('select * from private.sprint4_backups'),/permission denied/);
      await assert.rejects(db.query('select private.sprint4_snapshot($1,array[$2::uuid],current_date)',[target,alice]),/permission denied/);
      await db.exec('reset role');
    }
  } finally { await db.close(); }
});
