export type Stage = 'session_claims' | 'authentication' | 'tournaments' | 'personal_history' | 'profile' | 'tournament_rpc' | 'audit_status';
export type DashboardMetric = { stage: Stage; duration_ms: number; outcome: 'success' | 'error' | 'exception' | 'empty' | 'denied'; code?: string };

// Record query duration and outcome only; never include payloads, IDs or error messages.
export async function measureDashboardQuery<T>(stage: Stage, query: PromiseLike<T>, collect?: (metric: DashboardMetric) => void): Promise<T> {
  const started = performance.now();
  let outcome: DashboardMetric['outcome'] = 'success';
  let code: string | undefined;
  try {
    const result = await query;
    const error = (result as { error?: { code?: string } | null }).error;
    if (error) {
      outcome = 'error';
      if (typeof error.code === 'string' && /^[A-Z0-9_]{1,32}$/.test(error.code)) code = error.code;
    } else if (stage === 'tournament_rpc') {
      const data = (result as { data?: { access?: boolean } | null }).data;
      if (!data) outcome = 'empty';
      else if (data.access === false) outcome = 'denied';
    }
    return result;
  } catch (error) {
    outcome = 'exception';
    throw error;
  } finally {
    const metric = { stage, duration_ms: Math.round(performance.now() - started), outcome, ...(code ? { code } : {}) };
    console.info(JSON.stringify({ event: 'dashboard_query', ...metric }));
    try { collect?.(metric); } catch { /* Telemetry must not change the query result or exception. */ }
  }
}
