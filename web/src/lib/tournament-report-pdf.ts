import PDFDocument from 'pdfkit';
import path from 'node:path';
import { tournamentReport, type ReportSnapshot } from './tournament-report.ts';
import { scoreChartPanels, scoredDateTickIndices, type ScorePanel } from './tournament-report-chart.ts';

const date = (s: string) => s.slice(0, 10).split('-').reverse().join('/');
const colors = ['#047857', '#1d4ed8', '#be123c', '#7e22ce', '#b45309', '#0e7490', '#4338ca', '#a21caf'];
export const TOURNAMENT_REPORT_REVISION = 'cumulative-scores-v5';
// The embedded Ubuntu font has no emoji glyphs. Preserve the source name and
// omit decorative emoji only in this PDF, with an explicit note on its cover.
const pdfName = (name: string) => name.replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\uFE0F\u200D\u20E3]/gu, '').replace(/\s+/g, ' ').trim() || '(nome com emoji)';

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
  doc.moveDown(0.5).fillColor('#0f172a').fontSize(23).text(snapshot.tournament.name, { width });
  doc.moveDown(0.3); text(`${date(snapshot.tournament.starts_at)} a ${date(snapshot.tournament.ends_at)} | ${report.participants.length} participantes`, 10);
  text(`Encerrado em ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(snapshot.tournament.closed_at))} (São Paulo)`, 9);
  text('Resultados finais congelados. A evolução usa os pontos aceitos no encerramento, incluindo correções e auditorias.', 9);
  if (report.participants.some(p => pdfName(p.name) !== p.name)) text('Emojis nos nomes não são exibidos neste PDF; os nomes cadastrados são preservados.', 8);
  const rankingHeader = (continuation = false) => {
    if (continuation) page('Classificação final - continuação');
    else { doc.moveDown(0.4); text('CLASSIFICAÇÃO FINAL', 14); }
    const y = doc.y;
    doc.rect(42, y, width, 22).fill('#065f46');
    doc.fillColor('#ffffff').fontSize(9).text('POSIÇÃO', 52, y + 6, { width: 62 });
    doc.text('JOGADOR', 128, y + 6, { width: 430 });
    doc.text('PONTOS', 605, y + 6, { width: width - 573, align: 'right' });
    doc.y = y + 22;
  };
  rankingHeader();
  if (!report.ranking.length) text('Sem participantes.');
  for (const [i, p] of report.ranking.entries()) {
    // Fit 18 ordinary names on the cover; grow rows for genuinely long names.
    doc.fontSize(10);
    const rowHeight = Math.max(18, doc.heightOfString(pdfName(p.name), { width: 450 }) + 6);
    if (doc.y + rowHeight > doc.page.height - 58) rankingHeader(true);
    const y = doc.y;
    doc.rect(42, y, width, rowHeight).fill(i % 2 ? '#f1f5f9' : '#ffffff');
    doc.fillColor(p.position <= 3 ? '#047857' : '#475569').fontSize(10).text(`${p.position}º`, 52, y + 4, { width: 62 });
    doc.fillColor('#0f172a').text(pdfName(p.name), 128, y + 4, { width: 450 });
    doc.fillColor(p.total < 0 ? '#9f1239' : '#0f172a').text(p.total.toLocaleString('pt-BR'), 605, y + 4,
      { width: width - 573, align: 'right' });
    doc.strokeColor('#e2e8f0').lineWidth(0.4).moveTo(42, y + rowHeight).lineTo(doc.page.width - 42, y + rowHeight).stroke();
    doc.y = y + rowHeight;
  }
  page('Duplas mais disputadas');
  text('As cinco duplas com mais trocas de liderança entre si. São mostradas menos de cinco quando não há outras duplas com trocas.', 10);
  if (!report.rivalries.length) text('Não houve troca de posições entre pares.');
  if (report.rivalries.length) {
    const top = doc.y + 8;
    doc.rect(42, top, width, 26).fill('#065f46');
    doc.fillColor('#ffffff').fontSize(10).text('DUPLA', 54, top + 7, { width: 530 });
    doc.text('TROCAS', 640, top + 7, { width: width - 610, align: 'right' });
    doc.y = top + 26;
    for (const [i, pair] of report.rivalries.entries()) {
      const label = `${pdfName(pair.a.name)} / ${pdfName(pair.b.name)}`;
      doc.fontSize(12);
      const rowHeight = Math.max(36, doc.heightOfString(label, { width: 540 }) + 16);
      if (doc.y + rowHeight > doc.page.height - 100) page('Duplas mais disputadas - continuação');
      const y = doc.y;
      doc.rect(42, y, width, rowHeight).fill(i % 2 ? '#f1f5f9' : '#ffffff');
      doc.fillColor('#0f172a').text(label, 54, y + 10, { width: 540 });
      doc.fillColor('#047857').text(String(pair.swaps), 640, y + 10, { width: width - 610, align: 'right' });
      doc.y = y + rowHeight;
    }
    doc.y += 15;
  }
  text('Empate intermediário não conta como troca: A > empate > B = 1; A > empate > A = 0. Empates na quantidade de trocas usam ordem alfabética para apresentar até cinco duplas.', 9);
  if (!report.points.length) text('Não há resultados consolidados para desenhar a evolução.');
  const series = report.ranking;
  const points = report.points;
  const { overview, details } = scoreChartPanels(points, series);
  const style = (i: number) => {
    doc.undash().strokeColor(colors[i % colors.length]).lineWidth(1.6);
    if (i >= colors.length) doc.dash(i < 16 ? 5 : 2, { space: 3 });
  };
  const drawChart = (panel: ScorePanel, detailIndex?: number) => {
    const { points, minimum, maximum } = panel;
    const players = series;
    page('Evolução da pontuação acumulada');
    const label = detailIndex === undefined ? 'Panorama de todos os participantes'
      : `Intervalo ${detailIndex + 1} | ${points.length} dias pontuados`;
    text(`${label} | ${date(points[0].day)} a ${date(points.at(-1)!.day)}`, 10);
    text(`Mínimo: ${minimum.toLocaleString('pt-BR')} | Máximo: ${maximum.toLocaleString('pt-BR')} pontos. Escala própria deste gráfico.`, 9);
    text(points.length === 1 ? 'Uma única data pontuada: os marcadores mostram os acumulados finais, sem uma curva temporal.'
      : 'Acumulado desde o início do torneio. Somente datas pontuadas no eixo X, igualmente espaçadas.', 9);
    const top = 155, bottom = 470, left = 96, right = 562;
    const positions = new Map(points.map((point, index) => [point.day, index]));
    const x = (day: string) => points.length === 1 ? (left + right) / 2
      : left + 3 + positions.get(day)! / (points.length - 1) * (right - left - 6);
    const y = (value: number) => maximum === minimum ? (top + bottom) / 2
      : bottom - 3 - (value - minimum) / (maximum - minimum) * (bottom - top - 6);
    doc.fillColor('#475569').fontSize(9).text('Pontos acumulados', 42, top - 18, { width: 160 });
    const divisions = Math.min(5, maximum - minimum);
    const ticks = divisions === 0 ? [minimum] : Array.from({ length: divisions + 1 }, (_, i) => minimum + Math.round((maximum - minimum) * i / divisions));
    for (const value of ticks) {
      doc.undash().strokeColor(value === 0 ? '#64748b' : '#e2e8f0').lineWidth(value === 0 ? 1 : 0.5)
        .moveTo(left, y(value)).lineTo(right, y(value)).stroke();
      doc.fillColor('#475569').fontSize(9).text(value.toLocaleString('pt-BR'), 35, y(value) - 5, { width: 53, align: 'right' });
    }
    if (minimum < 0 && maximum > 0 && !ticks.includes(0))
      doc.strokeColor('#94a3b8').lineWidth(0.7).moveTo(left, y(0)).lineTo(right, y(0)).stroke();
    for (const i of scoredDateTickIndices(points.length, right - left - 6)) {
      const p = points[i];
      doc.fillColor('#475569').fontSize(8).text(date(p.day).slice(0, 5), x(p.day) - 13, bottom + 10, { width: 26, align: 'center' });
    }
    // Frame clipping only; the local domain contains all eligible values.
    doc.save().rect(left, top, right - left, bottom - top).clip();
    series.forEach(p => {
      const i = series.findIndex(s => s.id === p.id);
      const valid = points.filter(point => p.eligible_from <= point.day);
      if (!valid.length) return;
      style(i);
      doc.moveTo(x(valid[0].day), y(valid[0].totals[p.id]));
      for (const point of valid.slice(1)) doc.lineTo(x(point.day), y(point.totals[p.id]));
      doc.stroke().undash();
      for (const point of valid) doc.circle(x(point.day), y(point.totals[p.id]), 1.6).fill(colors[i % colors.length]);
    });
    doc.restore();
    doc.fillColor('#475569').fontSize(9).text('Data do jogo - somente dias pontuados', left, bottom + 29, { width: right - left, align: 'center' });
    // One series per row avoids same-baseline labels being merged by viewers
    // that reconstruct reading order instead of preserving PDF text columns.
    const legendLeft = 586, legendWidth = doc.page.width - legendLeft - 42;
    doc.roundedRect(legendLeft, top - 14, legendWidth, 358, 5).fill('#f8fafc');
    doc.fillColor('#475569').fontSize(9).text('JOGADORES', legendLeft + 12, top - 3, { width: legendWidth - 24 });
    const legendEntry = (p: typeof series[number], index: number) => {
      const i = series.findIndex(s => s.id === p.id);
      const lx = legendLeft + 12, ly = top + 18 + index * 18;
      style(i); doc.moveTo(lx, ly + 5).lineTo(lx + 24, ly + 5).stroke().undash();
      doc.fillColor('#0f172a').fontSize(9).text(`${i + 1}. ${pdfName(p.name)}`, lx + 32, ly,
        { width: legendWidth - 56, height: 15, ellipsis: true });
    };
    players.slice(0, 18).forEach(legendEntry);
    // Overflow pages continue the legend, not a subset of the plotted series.
    for (let start = 18; start < players.length; start += 18) {
      page('Legenda do gráfico - continuação');
      text(`${label} | Jogadores ${start + 1} a ${Math.min(start + 18, players.length)} da legenda`, 10);
      players.slice(start, start + 18).forEach(legendEntry);
    }
  };
  if (points.length) {
    drawChart(overview);
    details.forEach((panel, index) => drawChart(panel, index));
  }
  // Numeric equivalent of every plotted value, with repeated headers.
  for (let group = 0; group < series.length; group += 6) {
    const players = series.slice(group, group + 6);
    const heading = () => {
      page('Valores da evolução - pontos acumulados');
      text('Pontos acumulados por data. Traço indica período anterior à elegibilidade.', 9);
      const rowY = doc.y;
      doc.fontSize(9).fillColor('#475569').text('Data', 42, rowY, { width: 85 });
      const headerHeight = Math.max(12, ...players.map(p => doc.heightOfString(pdfName(p.name), { width: 96 })));
      players.forEach((p, i) => doc.text(pdfName(p.name), 130 + i * 104, rowY, { width: 96, align: 'right' }));
      doc.strokeColor('#94a3b8').lineWidth(0.6).moveTo(42, rowY + headerHeight + 5).lineTo(doc.page.width - 42, rowY + headerHeight + 5).stroke();
      doc.y = rowY + headerHeight + 14;
    };
    heading();
    for (const point of points) {
      if (doc.y + 18 > doc.page.height - 62) heading();
      const rowY = doc.y;
      doc.fillColor('#334155').fontSize(10).text(date(point.day), 42, rowY, { width: 85 });
      players.forEach((p, i) => doc.text(p.eligible_from > point.day ? '-' : point.totals[p.id].toLocaleString('pt-BR'),
        130 + i * 104, rowY, { width: 96, align: 'right' }));
      doc.strokeColor('#e2e8f0').lineWidth(0.4).moveTo(42, rowY + 15).lineTo(doc.page.width - 42, rowY + 15).stroke();
      doc.y = rowY + 19;
    }
  }
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const margin = doc.page.margins.bottom; doc.page.margins.bottom = 0;
    doc.fillColor('#64748b').fontSize(8).text(`GeoGuaras | Relatório final | Pontos acumulados v5 | ${i + 1} / ${range.count}`, 42, doc.page.height - 34, { width, lineBreak: false });
    doc.page.margins.bottom = margin;
  }
  doc.end();
  return output;
}
