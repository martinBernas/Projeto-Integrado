import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { after } from 'next/server';
import { measureDashboardQuery, type DashboardMetric, type Stage } from './dashboard-metrics';

export type StoredMetric = DashboardMetric & { occurred_at: string };

// Separate from the cookie-bearing user client: never refresh a user session or
// attach request data to this privileged, write-only telemetry call.
export async function persistOperationalMetrics(events: StoredMetric[]) {
  if (process.env.OPERATIONAL_METRICS_ENABLED !== 'true' || !events.length) return;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_METRICS_SECRET_KEY;
  if (!url || !key) { console.warn('operational_metrics_not_configured'); return; }
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(2000) }) },
    });
    // Construct the payload explicitly; no generic error, profile or query object
    // can accidentally become persisted telemetry.
    const batch = events.slice(0, 32).map(e => ({ occurred_at: e.occurred_at, stage: e.stage,
      duration_ms: Math.max(0, Math.min(3600000, Math.round(e.duration_ms))), outcome: e.outcome,
      ...(e.code && /^([0-9]{2}[A-Z0-9]{3}|PGRST[0-9]{3})$/.test(e.code) ? { code: e.code } : {}) }));
    const { error } = await client.rpc('record_operational_metrics', { events: batch });
    if (error) console.warn('operational_metrics_write_failed');
  } catch { console.warn('operational_metrics_write_failed'); }
}

export function createDashboardMetrics() {
  if (process.env.OPERATIONAL_METRICS_ENABLED !== 'true') return measureDashboardQuery;
  const events: StoredMetric[] = [];
  try { after(() => persistOperationalMetrics(events)); }
  catch { console.warn('operational_metrics_schedule_failed'); return measureDashboardQuery; }
  return <T>(stage: Stage, query: PromiseLike<T>) => measureDashboardQuery(stage, query, metric => {
    if (events.length < 32) events.push({ ...metric, occurred_at: new Date().toISOString() });
  });
}
