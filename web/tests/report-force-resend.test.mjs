import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const ids = ['34727be9-2447-4e7c-af41-e685b6db290b', '93c7e3c5-a676-42d4-83ca-05284cce0fff'];
const operationId = 'force-corrected-report-resend-20261031-v1';
const source = await readFile(new URL('../supabase/operations/report-score-correction/05-force-resend-approved.sql', import.meta.url), 'utf8');
const stateSql = await readFile(new URL('../supabase/operations/report-score-correction/06-resend-status.sql', import.meta.url), 'utf8');

async function setup() {
  const db = new PGlite();
  await db.exec(`create schema private;
    create table public.tournaments(id uuid primary key,name text);
    create table private.tournament_reports(tournament_id uuid primary key references public.tournaments(id),
      snapshot jsonb,pdf_base64 text,generated_at timestamptz,due_at timestamptz,withdrawn_at timestamptz,
      lease_until timestamptz,lease_token uuid,next_attempt_at timestamptz default now(),last_error text,
      created_at timestamptz default now());
    create table private.tournament_report_deliveries(id uuid primary key default gen_random_uuid(),
      tournament_id uuid references private.tournament_reports(tournament_id),player_id uuid,email text,state text,
      first_attempt_at timestamptz,sent_at timestamptz,provider_id text,unique(tournament_id,player_id));
    create table private.sprint8_backups(id text primary key,captured_at timestamptz default now(),as_of date not null,
      snapshot jsonb not null,function_definitions jsonb not null);`);
  let sql = source;
  for (const [i, id] of ids.entries()) {
    const snapshot = { tournament: { id, name: `Synthetic ${i}` } };
    await db.query('insert into public.tournaments values($1,$2)', [id, `Synthetic ${i}`]);
    await db.query(`insert into private.tournament_reports(tournament_id,snapshot,pdf_base64,generated_at,due_at)
      values($1,$2,$3,'2026-10-31T03:22:00Z','2026-11-07T03:22:00Z')`, [id, snapshot, `corrected-${i}`]);
    for (let p = 0; p < (i ? 18 : 6); p++) await db.query(`insert into private.tournament_report_deliveries
      (tournament_id,player_id,email,state,first_attempt_at,sent_at,provider_id)
      values($1,gen_random_uuid(),$2,'sent',now(),now(),$3)`, [id, `person-${i}-${p}@example.test`, `old-${i}-${p}`]);
    const hashes = (await db.query('select md5(snapshot::text) s,md5(pdf_base64) p from private.tournament_reports where tournament_id=$1', [id])).rows[0];
    sql = sql.replace(i ? 'ab7951e112207aaf37ef5c2d482b5ad3' : 'a2587770c6163af56fcc4b876836b5b1', hashes.s)
      .replace(i ? 'df9f8c21ab263beb92bb942d2b783a04' : '359473d39308e759d7b6c0a2f2b9479b', hashes.p);
  }
  const outsider = '00000000-0000-4000-8000-000000000099';
  await db.query('insert into public.tournaments values($1,$2)', [outsider, 'Unrelated']);
  await db.query("insert into private.tournament_reports(tournament_id,snapshot,pdf_base64) values($1,'{}','unchanged')", [outsider]);
  return { db, sql };
}

test('one-off resend saves original deliveries, changes only active send records and is never rearmed by repeating the script', async () => {
  const { db, sql } = await setup();
  try {
    const reports = (await db.query('select * from private.tournament_reports order by tournament_id')).rows;
    const original = (await db.query('select * from private.tournament_report_deliveries order by tournament_id,id')).rows;
    await db.exec(sql);
    assert.deepEqual((await db.query('select * from private.tournament_reports order by tournament_id')).rows, reports);
    const current = (await db.query('select * from private.tournament_report_deliveries order by tournament_id,player_id')).rows;
    assert.equal(current.length, 24);
    const oldIds = new Set(original.map(d => d.id));
    for (const row of current) {
      assert.ok(!oldIds.has(row.id));assert.equal(row.state, 'pending');
      assert.equal(row.first_attempt_at, null);assert.equal(row.sent_at, null);assert.equal(row.provider_id, null);
      const previous = original.find(d => d.player_id === row.player_id);
      assert.equal(row.email, previous.email);assert.equal(row.tournament_id, previous.tournament_id);
    }
    const archive = (await db.query('select snapshot from private.sprint8_backups where id=$1', [operationId])).rows[0].snapshot;
    assert.equal(archive.deliveries.length, 24);assert.ok(archive.deliveries.every(d => d.state === 'sent' && d.provider_id));
    assert.deepEqual(new Set(archive.deliveries.map(d => d.id)), oldIds);
    // The already-published worker immediately recognizes the requeued records.
    const gmail = await readFile(new URL('../supabase/migrations/202610240002_gmail_report_delivery.sql', import.meta.url), 'utf8');
    await db.exec(gmail.slice(gmail.indexOf('create or replace function public.claim_tournament_report'), gmail.indexOf('revoke all on function')));
    const job = (await db.query('select public.claim_tournament_report($1) job', [ids[0]])).rows[0].job;
    assert.equal(job.pdf, 'corrected-0');assert.equal(job.deliveries.length, 6);
    const delivery = job.deliveries[0];
    await db.query('select public.begin_gmail_tournament_delivery($1,$2,$3)', [ids[0], job.token, delivery.id]);
    await db.query('select public.complete_gmail_tournament_delivery($1,$2,$3,$4)', [ids[0], job.token, delivery.id, 'new-message-id']);
    await db.query('update private.tournament_reports set lease_until=null,lease_token=null where tournament_id=$1', [ids[0]]);
    await assert.rejects(db.exec(sql), /resend_already_requested/);await db.exec('rollback');
    assert.equal((await db.query('select state from private.tournament_report_deliveries where id=$1', [delivery.id])).rows[0].state, 'sent');
    const summary = await db.exec(stateSql);
    assert.equal(summary[0].rows[0].original_deliveries_saved, 24);assert.equal(summary[1].rows.length, 2);
  } finally { await db.close(); }
});

test('one-off resend fails atomically if PDFs, snapshot, delivery state, address, withdrawal or processing have changed', async () => {
  for (const [mutation, expected] of [
    ["update private.tournament_reports set pdf_base64='changed' where tournament_id=$1", /corrected_report_changed/],
    ["update private.tournament_reports set snapshot='{}' where tournament_id=$1", /corrected_report_changed/],
    ["update private.tournament_report_deliveries set state='uncertain' where tournament_id=$1", /delivery_state_changed/],
    ["update private.tournament_report_deliveries set email=null where tournament_id=$1", /delivery_state_changed/],
    ["update private.tournament_reports set withdrawn_at=now() where tournament_id=$1", /report_unavailable/],
    ["update private.tournament_reports set lease_until=now()+interval '5 minutes' where tournament_id=$1", /report_busy/],
  ]) {
    const { db, sql } = await setup();
    try {
      await db.query(mutation, [ids[1]]);
      await assert.rejects(db.exec(sql), expected);await db.exec('rollback');
      assert.equal((await db.query('select count(*) n from private.sprint8_backups')).rows[0].n, 0);
      assert.equal((await db.query("select count(*) n from private.tournament_report_deliveries where state='pending'")).rows[0].n, 0);
    } finally { await db.close(); }
  }
});
