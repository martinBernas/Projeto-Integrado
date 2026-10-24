import nodemailer from 'nodemailer';
import { SmtpDeliveryFailure, type ReportJob } from './report-processing.ts';

// Message-ID is not SMTP idempotency: only proven rejection/pre-submission
// failures may be retried automatically.
export function smtpFailureIsRetryable(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const e = error as { command?: string; responseCode?: number };
  const command = e.command ?? '';
  if (['CONN', 'EHLO', 'HELO', 'STARTTLS', 'MAIL FROM', 'RCPT TO'].includes(command) || command.startsWith('AUTH ')) return true;
  return command === 'DATA' && typeof e.responseCode === 'number' && e.responseCode >= 400 && e.responseCode < 600;
}

export function createGmailReportSender(env: Record<string, string | undefined>, factory = nodemailer.createTransport) {
  const user = env.GMAIL_SMTP_USER?.trim(), password = env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s/g, '');
  if (!user || !/^[^\s<>@]+@(gmail|googlemail)\.com$/i.test(user) || !password) throw new Error('gmail_reports_not_configured');
  return async (job: ReportJob, delivery: ReportJob['deliveries'][number], pdf: string): Promise<string> => {
    if (!delivery.email) throw new SmtpDeliveryFailure(true);
    const transport = factory({ host: 'smtp.gmail.com', port: 465, secure: true,
      pool: true, maxConnections: 1, maxMessages: 1,
      auth: { user, pass: password }, tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
      connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000, dnsTimeout: 8000,
      logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const info = await Promise.race([
        transport.sendMail({ from: { name: 'GeoGuaras', address: user }, to: [{ address: delivery.email, name: '' }],
          envelope: { from: user, to: [delivery.email] }, messageId: `<geoguaras-report.${delivery.id}@gmail.com>`,
          subject: `Relatório final - ${job.snapshot.tournament.name}`,
          text: 'O torneio foi encerrado. O relatório geral final está anexado em PDF. Guarde este e-mail: após a retirada do torneio, o PDF ficará disponível somente nos e-mails enviados.',
          attachments: [{ filename: 'relatorio-torneio.pdf', content: Buffer.from(pdf, 'base64'), contentType: 'application/pdf' }] }),
        new Promise<never>((_, reject) => { timer = setTimeout(() => { transport.close(); reject(new SmtpDeliveryFailure(false)); }, 12000); }),
      ]);
      const accepted = info.accepted?.some(address => String(address).toLowerCase() === delivery.email!.toLowerCase());
      if (!accepted) {
        const explicitlyRejected = info.rejected?.some(address => String(address).toLowerCase() === delivery.email!.toLowerCase());
        throw new SmtpDeliveryFailure(Boolean(explicitlyRejected));
      }
      if (info.rejected?.length) throw new SmtpDeliveryFailure(false);
      if (!info.messageId) throw new SmtpDeliveryFailure(false);
      return String(info.messageId);
    } catch (error) {
      if (error instanceof SmtpDeliveryFailure) throw error;
      throw new SmtpDeliveryFailure(smtpFailureIsRetryable(error));
    } finally { if (timer) clearTimeout(timer); transport.close(); }
  };
}
