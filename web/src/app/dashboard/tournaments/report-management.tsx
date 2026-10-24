import { createClient } from '@/lib/supabase/server';
import { ReportForm } from './report-form';

export async function ReportManagement({ target }: { target: string }) {
  const client = await createClient();
  const { data, error } = await client.rpc('get_tournament_report_status', { target });
  if (error) return <p role="alert" className="mt-3 text-sm text-red-700">Não foi possível consultar os envios do relatório. A retirada permanece bloqueada.</p>;
  if (!data) return <p className="mt-3 text-sm text-slate-600">Este torneio foi encerrado antes da ativação dos relatórios. Não será retirado automaticamente; consulte o procedimento operacional para inclusão explícita.</p>;
  const status = data as { generated: boolean; due_at: string; recipients: number; sent: number; uncertain: number; busy: boolean; error: string | null };
  const ready = status.generated && status.sent === status.recipients && !status.busy;
  return <section className="mt-4 border-t border-slate-200 pt-4" aria-label="Relatório final e retirada">
    <h4 className="font-semibold">Relatório final e retirada</h4>
    <p className="mt-2 text-sm">PDF: {status.generated ? 'gerado' : 'aguardando geração'} · Envios aceitos pelo Gmail: {status.sent}/{status.recipients}</p>
    <p className="mt-1 text-sm text-slate-600">Retirada automática a partir de {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(status.due_at))} (São Paulo), condicionada à geração do PDF e à aceitação de todos os envios pelo Gmail. Isso não comprova leitura ou chegada à caixa de entrada.</p>
    {(status.error || status.uncertain > 0) && <p role="alert" className="mt-2 text-sm text-red-700">Há falha ou envio sem confirmação. A retirada está bloqueada. Envios incertos exigem conferência operacional para evitar duplicidade.</p>}
    {status.busy && <p role="status" className="mt-2 text-sm">Relatório em processamento. Atualize a página para acompanhar.</p>}
    <ReportForm target={target} ready={ready} busy={status.busy} />
  </section>;
}
