import PDFDocument from 'pdfkit';
import path from 'node:path';
import { tournamentReport, type ReportSnapshot } from './tournament-report.ts';

const date = (s: string) => s.slice(0, 10).split('-').reverse().join('/');
const colors = ['#047857', '#1d4ed8', '#be123c', '#7e22ce', '#b45309', '#0e7490', '#4338ca', '#a21caf'];

export async function renderTournamentPdf(snapshot: ReportSnapshot): Promise<Buffer> {
  const report = tournamentReport(snapshot);
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 42, bufferPages: true,
    info: { Title: `Relatório geral - ${snapshot.tournament.name}`, Author: 'GeoGuaras', CreationDate: new Date(snapshot.tournament.closed_at), ModDate: new Date(snapshot.tournament.closed_at) } });
  doc.registerFont('Ubuntu', path.join(process.cwd(), 'src/assets/fonts/Ubuntu-R.ttf')).font('Ubuntu');
  const chunks: Buffer[] = [];
  let bytes = 0;
  const output = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => { bytes += chunk.length; if (bytes > 8_000_000) { doc.destroy(new Error('report_too_large')); return; } chunks.push(chunk); });
    doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject);
  });
  const width = doc.page.width - 84;
  const page = (title: string) => { doc.addPage(); doc.fillColor('#0f172a').fontSize(19).text(title, 42, 42, { width }); doc.moveDown(); };
  const text = (value: string, size = 11) => {
    doc.fontSize(size);
    const height = doc.heightOfString(value, { width });
    if (doc.y + height > doc.page.height - 62) page('Relatório geral - continuação');
    doc.fillColor('#334155').fontSize(size).text(value, 42, doc.y, { width, paragraphGap: 6 });
  };
  doc.fillColor('#047857').fontSize(11).text('GEOGUARAS / RELATÓRIO GERAL');
  doc.moveDown().fillColor('#0f172a').fontSize(25).text(snapshot.tournament.name, { width });
  doc.moveDown(); text(`${date(snapshot.tournament.starts_at)} a ${date(snapshot.tournament.ends_at)} | ${report.participants.length} participantes`);
  text(`Encerrado em ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(snapshot.tournament.closed_at))} (São Paulo)`);
  text('Resultados finais congelados. A evolução foi reconstruída por data com os valores aceitos no encerramento; não representa versões anteriores a correções ou auditorias.', 10);
  doc.moveDown(); text('CLASSIFICAÇÃO FINAL', 15);
  if (!report.ranking.length) text('Sem participantes.');
  for (const [i, p] of report.ranking.entries()) text(`${p.position}º  ${p.name}  |  ${p.total.toLocaleString('pt-BR')} pontos  |  Série ${i + 1}`);
  doc.moveDown(); text('DUPLAS MAIS DISPUTADAS', 15);
  if (!report.rivalries.length) text('Não houve troca de posições entre pares.');
  for (const pair of report.rivalries) text(`${pair.a.name} / ${pair.b.name}: ${pair.swaps} ${pair.swaps === 1 ? 'troca' : 'trocas'}`);
  text('Conta-se a inversão da liderança do par. Empate não conta: A > empate > B = 1 troca; A > empate > A = 0. Todas as duplas empatadas na maior contagem positiva são apresentadas.', 10);
  if (!report.points.length) text('Não há resultados consolidados para desenhar a evolução.');
  const series = report.ranking;
  // Keep every date and participant: paginate, never silently downsample data.
  for (let start = 0; start < report.points.length; start += 20) {
    const points = report.points.slice(Math.max(0, start - 1), start + 20);
    page('Evolução da classificação acumulada');
    text(`${date(points[0].day)} a ${date(points.at(-1)!.day)}. Primeiro lugar no topo; empates compartilham posição. Séries identificadas na classificação e nas tabelas.`, 10);
    const top = doc.y + 18, bottom = 470, left = 70, right = doc.page.width - 55;
    const first = Date.parse(points[0].day), last = Date.parse(points.at(-1)!.day);
    const x = (day: string) => first === last ? (left + right) / 2 : left + (Date.parse(day) - first) / (last - first) * (right - left);
    const y = (position: number) => series.length < 2 ? top : top + (position - 1) / (series.length - 1) * (bottom - top);
    const step = Math.max(1, Math.ceil(series.length / 14));
    for (let pos = 1; pos <= series.length; pos += step) {
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(left, y(pos)).lineTo(right, y(pos)).stroke();
      doc.fillColor('#475569').fontSize(9).text(`${pos}º`, 42, y(pos) - 5, { width: 24 });
    }
    for (let i = 0; i < points.length; i += Math.max(1, Math.ceil(points.length / 8))) {
      const p = points[i]; doc.fillColor('#475569').fontSize(8).text(date(p.day), x(p.day) - 25, bottom + 12, { width: 55 });
    }
    series.forEach((p, i) => {
      const valid = points.filter(point => point.positions[p.id] !== undefined);
      if (!valid.length) return;
      doc.strokeColor(colors[i % colors.length]).lineWidth(1.6);
      if (i >= colors.length) doc.dash(3 + Math.floor(i / colors.length), { space: 2 });
      doc.moveTo(x(valid[0].day), y(valid[0].positions[p.id]));
      for (const point of valid.slice(1)) doc.lineTo(x(point.day), y(point.positions[p.id]));
      doc.stroke().undash();
      for (const point of valid) doc.circle(x(point.day), y(point.positions[p.id]), 2).fill(colors[i % colors.length]);
      const lastPoint = valid.at(-1)!;
      doc.fillColor(colors[i % colors.length]).fontSize(8).text(String(i + 1), x(lastPoint.day) + 3, y(lastPoint.positions[p.id]) - 9, { width: 18 });
    });
  }
  // Numeric equivalent of every plotted value, split into readable column groups.
  for (let group = 0; group < series.length; group += 6) {
    const players = series.slice(group, group + 6);
    page('Valores da evolução - posições por dia');
    for (const [i, p] of players.entries()) text(`Série ${group + i + 1}: ${p.name}`, 10);
    text('Data | ' + players.map((_, i) => `S${group + i + 1}`).join(' | '), 11);
    for (const point of report.points) text(`${date(point.day)} | ${players.map(p => point.positions[p.id] === undefined ? '-' : `${point.positions[p.id]}º`).join(' | ')}`, 10);
  }
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const margin = doc.page.margins.bottom; doc.page.margins.bottom = 0;
    doc.fillColor('#64748b').fontSize(8).text(`GeoGuaras | Relatório final | ${i + 1} / ${range.count}`, 42, doc.page.height - 34, { width, lineBreak: false });
    doc.page.margins.bottom = margin;
  }
  doc.end();
  return output;
}
