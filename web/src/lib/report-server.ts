import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { renderTournamentPdf } from './tournament-report-pdf';
import { processReport } from './report-processing';
import { createGmailReportSender } from './gmail-report-mailer';

function reportClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_REPORTS_SECRET_KEY;
  if (!url || !key) throw new Error('reports_not_configured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) } });
}

export async function runTournamentReports(target?: string) {
  if (process.env.TOURNAMENT_REPORTS_ENABLED !== 'true') return;
  const client = reportClient();
  const send = createGmailReportSender(process.env);
  await processReport((name, args) => client.rpc(name, args), renderTournamentPdf, send, target);
  const result = await client.rpc('withdraw_due_tournaments');
  if (result.error) throw new Error('withdrawal_failed');
}
