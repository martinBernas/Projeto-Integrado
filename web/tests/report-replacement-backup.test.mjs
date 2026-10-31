import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

test('offline backup verification checks every approved target, original PDF and recipient state without logging private fields', async () => {
  await mkdir(new URL('../tmp/', import.meta.url), { recursive: true });
  const temp = await mkdtemp(new URL('../tmp/backup-verification-', import.meta.url));
  const due = '2026-11-07T03:22:00Z';
  const pdf = Buffer.from('%PDF-1.4\nsynthetic backup fixture\n').toString('base64');
  const md5 = value => createHash('md5').update(value).digest('hex');
  const references = [1, 2].map(i => ({ tournament_id: `t${i}`, due_at: due,
    snapshot_database_md5: md5(`snapshot-${i}`), previous_pdf_md5: md5(pdf),
    snapshot: { tournament: { id: `t${i}` }, participants: [{ id: `p${i}`, name: `Pessoa ${i}` }], results: [] } }));
  const backups = references.map((r, i) => ({ backup: { captured_at: '2026-10-31T12:00:00Z',
    report: { tournament_id: r.tournament_id, snapshot: r.snapshot, withdrawn_at: null,
      generated_at: '2026-10-31T03:22:00Z', due_at: due, lease_until: null, pdf_base64: pdf },
    deliveries: [{ id: `d${i}`, tournament_id: r.tournament_id, player_id: `p${i + 1}`, state: 'sent', email: 'private-recipient@example.test' }] } }));
  const paths = [];
  for (const [i, ref] of references.entries()) {
    const path = `${temp}/reference-${i}.json`;await writeFile(path, JSON.stringify([ref]));paths.push(path);
  }
  const run = promisify(execFile);
  const script = fileURLToPath(new URL('../scripts/verify-report-replacement-backup.mjs', import.meta.url));
  const invoke = async (name, data) => {
    const path = `${temp}/${name}.json`;await writeFile(path, JSON.stringify(data));
    return { path, execution: run(process.execPath, [script, path, ...paths]) };
  };
  const valid = await invoke('valid', backups);const result = await valid.execution;
  assert.equal(result.stdout.includes('private-recipient'), false);
  const evidence = JSON.parse(await readFile(`${valid.path}.verified.json`, 'utf8'));
  assert.equal(evidence.targets.length, 2);assert.ok(evidence.targets.every(t => t.recipients === 1 && t.sent === 1));
  assert.equal(JSON.stringify(evidence).includes('private-recipient'), false);
  for (const [name, alter, code] of [
    ['missing', b => b.pop(), 'backup_target_count_mismatch'],
    ['duplicate', b => { b[1] = b[0]; }, 'missing_or_duplicate_backup_target'],
    ['snapshot', b => { b[0].backup.report.snapshot.results.push({ applied_score: 1 }); }, 'snapshot_changed_or_withdrawn'],
    ['pdf', b => { b[0].backup.report.pdf_base64 = 'changed'; }, 'original_pdf_changed'],
    ['recipient', b => { b[0].backup.deliveries[0].player_id = 'other'; }, 'recipient_identity_changed'],
    ['uncertain', b => { b[0].backup.deliveries[0].state = 'uncertain'; }, 'delivery_state_changed'],
    ['deadline', b => { b[0].backup.report.due_at = '2026-11-08T00:00:00Z'; }, 'report_dates_changed'],
    ['withdrawn', b => { b[0].backup.report.withdrawn_at = '2026-10-31T12:00:00Z'; }, 'snapshot_changed_or_withdrawn'],
    ['lease', b => { b[0].backup.report.lease_until = '2999-01-01T00:00:00Z'; }, 'report_busy'],
  ]) {
    const data = structuredClone(backups);alter(data);
    const invalid = await invoke(name, data);
    await assert.rejects(invalid.execution, error => error.stderr.includes(code) && !error.stderr.includes('private-recipient'));
  }
  const malformed = `${temp}/malformed.json`;
  await writeFile(malformed, 'private-recipient@example.test broken-json');
  await assert.rejects(run(process.execPath, [script, malformed, ...paths]), error =>
    error.stderr.includes('backup_read_parse_or_write_failed') && !error.stderr.includes('private-recipient'));
});
