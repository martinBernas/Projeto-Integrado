// Offline only: reads one exported frozen snapshot and never connects or sends.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { renderTournamentPdf, TOURNAMENT_REPORT_REVISION } from '../src/lib/tournament-report-pdf.ts';
import { tournamentReport } from '../src/lib/tournament-report.ts';

const [input, output, replacementFlag] = process.argv.slice(2);
if (!input || !output || (replacementFlag && replacementFlag !== '--prepare-replacement')) {
  throw Error('Usage: node scripts/preview-tournament-report.mjs <snapshot.json> <new-output-directory> [--prepare-replacement]');
}
const inputPath = resolve(input), outputPath = resolve(output);
const source = await readFile(inputPath);
let exported = JSON.parse(source.toString('utf8').replace(/^\uFEFF/, ''));
if (Array.isArray(exported)) {
  if (exported.length !== 1) throw Error('Export must contain exactly one tournament');
  exported = exported[0];
}
if (exported.withdrawn_at) throw Error('Withdrawn tournament: recovery must be reviewed separately');
const snapshot = typeof exported.snapshot === 'string' ? JSON.parse(exported.snapshot) : exported.snapshot ?? exported;
if (!snapshot?.tournament?.id || !snapshot.tournament.name || !Number.isFinite(Date.parse(snapshot.tournament.closed_at))
  || !Array.isArray(snapshot.participants) || !Array.isArray(snapshot.results)) throw Error('Missing frozen snapshot');
if (exported.tournament_id && exported.tournament_id !== snapshot.tournament.id) throw Error('Tournament ID mismatch');
const day = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value));
if (!day(snapshot.tournament.starts_at) || !day(snapshot.tournament.ends_at)
  || snapshot.tournament.starts_at > snapshot.tournament.ends_at) throw Error('Invalid tournament dates');
const ids = new Set();
for (const p of snapshot.participants) {
  if (typeof p.id !== 'string' || !p.id || ids.has(p.id) || typeof p.name !== 'string' || !day(p.eligible_from)) throw Error('Invalid participant');
  ids.add(p.id);
}
const rows = new Set();
for (const row of snapshot.results) {
  const key = `${row.player_id}/${row.played_on}`;
  if (!ids.has(row.player_id) || !day(row.played_on) || !Number.isSafeInteger(row.applied_score)
    || row.provisional !== false || row.result_kind === 'pending' || rows.has(key)) throw Error('Invalid or unconsolidated result');
  rows.add(key);
}
const report = tournamentReport(snapshot);
// Renderer uses the project's bundled font, independent of caller directory.
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const pdf = await renderTournamentPdf(snapshot);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const md5 = value => createHash('md5').update(value).digest('hex');
const evidence = {
  tournament_id: snapshot.tournament.id, revision: TOURNAMENT_REPORT_REVISION,
  source_sha256: sha256(source), snapshot_database_md5: exported.snapshot_database_md5 ?? null,
  previous_pdf_md5: exported.previous_pdf_md5 ?? null, pdf_sha256: sha256(pdf),
  participants: report.participants.length, results: snapshot.results.length, dates: report.points.length,
  ranking: report.ranking.map(p => ({ id: p.id, total: p.total, position: p.position })),
};
let replacement, backup;
if (replacementFlag) {
  if (!/^[\da-f-]{36}$/i.test(snapshot.tournament.id)
    || !/^[\da-f]{32}$/.test(exported.snapshot_database_md5 ?? '')
    || !/^[\da-f]{32}$/.test(exported.previous_pdf_md5 ?? '')) throw Error('Replacement requires database export with original checksums');
  const id = snapshot.tournament.id, base64 = pdf.toString('base64');
  backup = `-- PRIVATE: export this single result as JSON under /backups/ and verify it before replacement.\nselect jsonb_build_object('captured_at',clock_timestamp(),'report',to_jsonb(r),'deliveries',coalesce((select jsonb_agg(to_jsonb(d) order by d.id) from private.tournament_report_deliveries d where d.tournament_id=r.tournament_id),'[]'::jsonb)) as backup\nfrom private.tournament_reports r where r.tournament_id='${id}' and r.withdrawn_at is null and md5(r.snapshot::text)='${exported.snapshot_database_md5}' and md5(r.pdf_base64)='${exported.previous_pdf_md5}';\n`;
  // Compare-and-swap, locks in the same order as withdrawal; no queue reset.
  replacement = `-- PRIVATE: contains PDF. Run only after HCM acceptance and verified backup.\n-- ${TOURNAMENT_REPORT_REVISION}; SHA-256 ${sha256(pdf)}\nbegin;\nset local lock_timeout='10s';\ndo $$\ndeclare r private.tournament_reports;\nbegin\n perform 1 from public.tournaments where id='${id}' for update;\n select * into r from private.tournament_reports where tournament_id='${id}' for update;\n if not found or r.withdrawn_at is not null or r.snapshot is null then raise exception 'report_unavailable'; end if;\n if r.lease_until>clock_timestamp() then raise exception 'report_busy'; end if;\n if md5(r.snapshot::text)<>'${exported.snapshot_database_md5}' then raise exception 'snapshot_changed'; end if;\n if md5(r.pdf_base64)='${md5(base64)}' then return; end if;\n if r.generated_at is null or r.pdf_base64 is null or md5(r.pdf_base64)<>'${exported.previous_pdf_md5}' then raise exception 'original_pdf_changed'; end if;\n update private.tournament_reports set pdf_base64='${base64}' where tournament_id='${id}';\nend $$;\nselect tournament_id,md5(pdf_base64) as corrected_pdf_md5,generated_at,due_at,withdrawn_at from private.tournament_reports where tournament_id='${id}';\ncommit;\n`;
}
// Exclusive directory prevents accidental overwrite of the source/evidence.
await mkdir(dirname(outputPath), { recursive: true });
await mkdir(outputPath);
await writeFile(resolve(outputPath, 'report.pdf'), pdf, { flag: 'wx' });
await writeFile(resolve(outputPath, 'evidence.json'), JSON.stringify(evidence, null, 2), { flag: 'wx' });
if (replacement) {
  await writeFile(resolve(outputPath, 'backup-before-replacement.sql'), backup, { flag: 'wx' });
  await writeFile(resolve(outputPath, 'replace-reviewed-report.sql'), replacement, { flag: 'wx' });
}
console.log(JSON.stringify({ output: outputPath, revision: evidence.revision, participants: evidence.participants, dates: evidence.dates, sha256: evidence.pdf_sha256 }));
