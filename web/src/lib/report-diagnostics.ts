// Never log raw provider/database messages, arguments, snapshots or credentials.
export function logReportFailure(stage: string, error: unknown) {
  const value = error && typeof error === 'object' ? error as { code?: unknown; message?: unknown } : {};
  const knownMessages = ['reports_not_configured', 'gmail_reports_not_configured', 'report_database_failed', 'withdrawal_failed', 'smtp_delivery_failed'];
  const code = typeof value.code === 'string' && /^(?:[0-9A-Z]{5}|PGRST\d{3}|ENOENT|EACCES|ETIMEDOUT|ECONNRESET|ECONNREFUSED)$/.test(value.code)
    ? value.code : typeof value.message === 'string' && knownMessages.includes(value.message) ? value.message : 'unclassified';
  console.error(JSON.stringify({ event: 'tournament_report_failure', stage, code }));
}
