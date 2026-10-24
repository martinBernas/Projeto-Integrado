import { timingSafeEqual } from 'node:crypto';
import { runTournamentReports } from '@/lib/report-server';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const actual = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret ?? ''}`);
  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected)) return new Response(null, { status: 401 });
  if (process.env.TOURNAMENT_REPORTS_ENABLED !== 'true') return Response.json({ enabled: false }, { status: 503 });
  try { await runTournamentReports(); return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return Response.json({ ok: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
