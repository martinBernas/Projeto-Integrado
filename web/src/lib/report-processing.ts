import type { ReportSnapshot } from './tournament-report.ts';

export type ReportJob = { id: string; token: string; snapshot: ReportSnapshot; pdf: string | null;
  deliveries: { id: string; email: string | null; state: string }[] };
type Rpc = (name: string, args?: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }>;
export class SmtpDeliveryFailure extends Error {
  retryable: boolean;
  constructor(retryable: boolean) { super('smtp_delivery_failed'); this.retryable = retryable; }
}

// Kept independent of secrets/framework so delivery failures and retry ordering
// can be tested without a network call or real message.
export async function processReport(rpc: Rpc, render: (data: ReportSnapshot) => Promise<Buffer>,
  send: (job: ReportJob, delivery: ReportJob['deliveries'][number], pdf: string) => Promise<string>, target?: string) {
  const call = async (name: string, args?: Record<string, unknown>) => {
    const result = await rpc(name, args); if (result.error) throw new Error('report_database_failed'); return result.data;
  };
  const job = await call('claim_tournament_report', { target: target ?? null }) as ReportJob | null;
  if (!job) return { processed: false };
  let failed = false;
  const started = Date.now();
  try {
    let pdf = job.pdf;
    if (!pdf) {
      pdf = (await render(job.snapshot)).toString('base64');
      await call('save_tournament_report', { target: job.id, token: job.token, pdf });
    }
    for (const delivery of job.deliveries.slice(0, 5)) {
      if (Date.now() - started > 35_000) break;
      if (!delivery.email) { failed = true; continue; }
      let begun = false;
      try {
        await call('begin_gmail_tournament_delivery', { target: job.id, token: job.token, delivery: delivery.id });
        begun = true;
        const provider = await send(job, delivery, pdf);
        await call('complete_gmail_tournament_delivery', { target: job.id, token: job.token, delivery: delivery.id, provider });
      } catch (error) {
        failed = true;
        if (begun) await call('fail_gmail_tournament_delivery', { target: job.id, token: job.token, delivery: delivery.id,
          retryable: error instanceof SmtpDeliveryFailure && error.retryable });
      }
    }
  } catch { failed = true; }
  finally { await call('release_tournament_report', { target: job.id, token: job.token, failure: failed ? 'processing_failed' : null }); }
  return { processed: true, failed };
}
