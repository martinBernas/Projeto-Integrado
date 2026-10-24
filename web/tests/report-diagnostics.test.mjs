import { test } from 'node:test';
import assert from 'node:assert/strict';
import { logReportFailure } from '../src/lib/report-diagnostics.ts';

test('report diagnostics expose only stage and allowlisted codes, never raw secrets or personal data', () => {
  const entries = [], original = console.error;
  console.error = text => entries.push(JSON.parse(text));
  try {
    logReportFailure('gmail_config', new Error('gmail_reports_not_configured'));
    logReportFailure('claim_tournament_report', { code: '42501', message: 'secret-password private@example.test', details: 'private snapshot' });
    logReportFailure('render_pdf', { code: 'ENOENT', message: 'private/path' });
    logReportFailure('delivery', { code: 'secret-password', message: 'private@example.test' });
    assert.deepEqual(entries.map(e => e.code), ['gmail_reports_not_configured', '42501', 'ENOENT', 'unclassified']);
    assert.ok(entries.every(e => e.event === 'tournament_report_failure'));
    assert.doesNotMatch(JSON.stringify(entries), /secret-password|private@|snapshot|private\/path/);
  } finally { console.error = original; }
});
