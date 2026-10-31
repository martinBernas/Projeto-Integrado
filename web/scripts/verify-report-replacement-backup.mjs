// Offline verification; never prints recipient addresses or PDF contents.
// Supports one or several approved targets, each supplied as a frozen export.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { resolve } from 'node:path';

const hash = (value, algorithm = 'sha256') => createHash(algorithm).update(value).digest('hex');
const check = (condition, code) => {
  if (!condition) { const error = Error(code);error.name = 'BackupVerificationError';throw error; }
};
const parse = bytes => JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
const object = value => typeof value === 'string' ? JSON.parse(value) : value;
const instant = value => typeof value === 'string' && Number.isFinite(Date.parse(value));

try {
  const [backupPath, ...referencePaths] = process.argv.slice(2);
  check(backupPath && referencePaths.length, 'usage: node scripts/verify-report-replacement-backup.mjs <backup.json> <frozen-export.json> [additional-frozen-export.json]');
  const bytes = await readFile(backupPath);
  const decoded = parse(bytes);
  const backups = (Array.isArray(decoded) ? decoded : [decoded]).map(row => object(row.backup ?? row));
  check(backups.length === referencePaths.length, 'backup_target_count_mismatch');
  const seen = new Set();
  const evidence = [];
  for (const referencePath of referencePaths) {
    const referenceBytes = await readFile(referencePath);
    const decodedReference = parse(referenceBytes);
    check(!Array.isArray(decodedReference) || decodedReference.length === 1, 'reference_must_have_one_target');
    const reference = Array.isArray(decodedReference) ? decodedReference[0] : decodedReference;
    check(/^[a-f0-9]{32}$/.test(reference.snapshot_database_md5 ?? '')
      && /^[a-f0-9]{32}$/.test(reference.previous_pdf_md5 ?? ''), 'invalid_reference_checksums');
    const snapshot = object(reference.snapshot);
    check(snapshot?.tournament?.id && snapshot.tournament.id === reference.tournament_id, 'invalid_reference');
    const id = reference.tournament_id;
    check(!seen.has(id), 'duplicate_reference');seen.add(id);
    const matching = backups.filter(row => row.report?.tournament_id === id);
    check(matching.length === 1, 'missing_or_duplicate_backup_target');
    const backup = matching[0], report = backup.report;
    check(instant(backup.captured_at), 'missing_backup_timestamp');
    check(report.withdrawn_at === null && isDeepStrictEqual(report.snapshot, snapshot), 'snapshot_changed_or_withdrawn');
    check(instant(report.generated_at) && instant(report.due_at) && instant(reference.due_at)
      && Date.parse(report.due_at) === Date.parse(reference.due_at), 'report_dates_changed');
    check(report.lease_until === null || (instant(report.lease_until) && Date.parse(report.lease_until) <= Date.now()), 'report_busy');
    check(typeof report.pdf_base64 === 'string' && hash(report.pdf_base64, 'md5') === reference.previous_pdf_md5, 'original_pdf_changed');
    const pdf = Buffer.from(report.pdf_base64, 'base64');
    check(pdf.subarray(0, 5).toString() === '%PDF-' && pdf.toString('base64') === report.pdf_base64, 'invalid_pdf_backup');
    const deliveries = backup.deliveries;
    const participants = new Set(snapshot.participants.map(p => p.id));
    check(Array.isArray(deliveries) && deliveries.length === participants.size, 'recipient_count_changed');
    const recipients = new Set(), deliveryIds = new Set();
    for (const delivery of deliveries) {
      check(delivery.tournament_id === id && participants.has(delivery.player_id)
        && !recipients.has(delivery.player_id) && typeof delivery.id === 'string' && !deliveryIds.has(delivery.id), 'recipient_identity_changed');
      check(delivery.state === 'sent', 'delivery_state_changed');
      recipients.add(delivery.player_id);deliveryIds.add(delivery.id);
    }
    evidence.push({ tournament_id: id, reference_sha256: hash(referenceBytes), captured_at: backup.captured_at,
      snapshot_database_md5: reference.snapshot_database_md5, original_pdf_md5: hash(report.pdf_base64, 'md5'),
      original_pdf_sha256: hash(pdf), generated_at: report.generated_at, due_at: report.due_at,
      recipients: deliveries.length, sent: deliveries.length });
  }
  const result = { verified_at: new Date().toISOString(), backup_sha256: hash(bytes), targets: evidence };
  const output = resolve(`${backupPath}.verified.json`);
  await writeFile(output, JSON.stringify(result, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ verified: true, output, backup_sha256: result.backup_sha256,
    targets: evidence.map(t => ({ tournament_id: t.tournament_id, recipients: t.recipients, sent: t.sent })) }));
} catch (error) {
  console.error(error instanceof Error && error.name === 'BackupVerificationError'
    ? error.message : 'backup_read_parse_or_write_failed');
  process.exitCode = 1;
}
