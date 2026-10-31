"""Offline PNG mockup only. Does not change the PDF renderer, database or mail."""
import argparse
import hashlib
import json
import math
import re
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


parser = argparse.ArgumentParser()
parser.add_argument('snapshot')
parser.add_argument('output_directory')
args = parser.parse_args()
source = Path(args.snapshot).read_bytes()
exported = json.loads(source.decode('utf-8-sig'))
if isinstance(exported, list):
    if len(exported) != 1:
        raise ValueError('Expected exactly one frozen tournament')
    exported = exported[0]
snapshot = exported.get('snapshot', exported)
if isinstance(snapshot, str):
    snapshot = json.loads(snapshot)
start = date.fromisoformat(snapshot['tournament']['starts_at'])
end = date.fromisoformat(snapshot['tournament']['ends_at'])
people = {p['id']: p for p in snapshot['participants']}
rows = [r for r in snapshot['results'] if r['player_id'] in people
        and max(people[r['player_id']]['eligible_from'], start.isoformat()) <= r['played_on'] <= end.isoformat()]
if any(r['provisional'] or r['result_kind'] == 'pending' for r in rows):
    raise ValueError('Unconsolidated snapshot')
totals = dict.fromkeys(people, 0)
points = []
for day in sorted({r['played_on'] for r in rows}):
    for row in rows:
        if row['played_on'] == day:
            totals[row['player_id']] += row['applied_score']
    points.append({'day': day, 'totals': dict(totals)})
players = sorted(people.values(), key=lambda p: (-totals[p['id']], p['name'], p['id']))
if len(players) > 18:
    raise ValueError('This HCM mockup supports up to 18 legend entries')
colors = ['#047857', '#1d4ed8', '#be123c', '#7e22ce', '#b45309', '#0e7490', '#4338ca', '#a21caf']
font_path = Path(__file__).resolve().parents[1] / 'src/assets/fonts/Ubuntu-R.ttf'
fonts = {n: ImageFont.truetype(str(font_path), n) for n in [16, 18, 19, 20, 21, 22, 24, 26, 32]}
W, H = 1720, 760


def fmt(value):
    return f'{round(value):,}'.replace(',', '.')


def name(value):
    # Same presentation limitation as the PDF's embedded Ubuntu font.
    return re.sub(r'[^\u0000-\uFFFF]|[\uFE0F\u200D]', '', value).strip()


def line(draw, a, b, color, index, width=3):
    length = math.dist(a, b)
    if index < 8 or not length:
        draw.line([a, b], fill=color, width=width)
        return
    dash, gap = (11, 7) if index < 16 else (3, 6)
    for distance in range(0, math.ceil(length), dash + gap):
        left, right = distance / length, min(distance + dash, length) / length
        draw.line([(a[0] + (b[0] - a[0]) * left, a[1] + (b[1] - a[1]) * left),
                   (a[0] + (b[0] - a[0]) * right, a[1] + (b[1] - a[1]) * right)], fill=color, width=width)


def chart(selected, first, last, overview=False):
    image = Image.new('RGB', (W, H), 'white')
    draw = ImageDraw.Draw(image)
    title = 'HCM - Outubro | Pontuação acumulada'
    draw.text((40, 20), title, font=fonts[32], fill='#0f172a')
    period = f'{first:%d/%m} a {last:%d/%m/%Y}'
    unit = 'dia pontuado' if len(selected) == 1 else 'dias pontuados'
    subtitle = (f'Gráfico geral | {period}' if overview else
                f'Intervalo de {len(selected)} {unit} | {period}')
    draw.text((40, 65), subtitle, font=fonts[24], fill='#334155')
    values = [point['totals'][p['id']] for point in selected for p in players
              if p['eligible_from'] <= point['day']]
    if not values:
        draw.text((100, 250), 'Sem resultados consolidados neste intervalo.', font=fonts[26], fill='#475569')
        return image, {'first': first.isoformat(), 'last': last.isoformat(), 'observations': 0}
    minimum, maximum = min(values), max(values)
    draw.text((40, 103), f'Eixo Y deste intervalo: mínimo {fmt(minimum)} | máximo {fmt(maximum)} pontos',
              font=fonts[21], fill='#475569')
    left, right, top, bottom = 126, 1320, 180, 650
    span = maximum - minimum or 1
    # The frozen results contain only consolidated tournament dates. Use their
    # ordinal positions: excluded days consume no tick and no horizontal space.
    dates = [point['day'] for point in selected]
    positions = {day: i for i, day in enumerate(dates)}
    x = lambda day: ((left + right) / 2 if len(dates) == 1 else
                     left + 6 + positions[day] / (len(dates) - 1) * (right - left - 12))
    # A small internal inset keeps circles visible, without changing data limits.
    y = lambda value: bottom - 6 - (value - minimum) / span * (bottom - top - 12)
    draw.text((left, top - 31), 'Pontos acumulados', font=fonts[19], fill='#475569')
    for i in range(6):
        value = minimum + (maximum - minimum) * i / 5
        yy = y(value)
        draw.line([(left, yy), (right, yy)], fill='#e2e8f0', width=1)
        draw.text((left - 15, yy), fmt(value), font=fonts[19], fill='#475569', anchor='rm')
    if minimum < 0 < maximum:
        draw.line([(left, y(0)), (right, y(0))], fill='#94a3b8', width=2)
    for day in dates:
        xx = x(day)
        draw.text((xx, bottom + 16), f'{date.fromisoformat(day):%d/%m}',
                  font=fonts[16 if overview else 20], fill='#475569', anchor='mt')
    draw.text(((left + right) / 2, bottom + 55), 'Data do jogo — somente dias válidos',
              font=fonts[21], fill='#475569', anchor='mt')
    for i, p in enumerate(players):
        valid = [point for point in selected if p['eligible_from'] <= point['day']]
        coords = [(x(point['day']), y(point['totals'][p['id']])) for point in valid]
        color = colors[i % len(colors)]
        for a, b in zip(coords, coords[1:]):
            line(draw, a, b, color, i)
        for xx, yy in coords:
            draw.ellipse((xx - 4, yy - 4, xx + 4, yy + 4), fill=color)
    draw.rounded_rectangle((1350, 150, 1685, 714), radius=10, fill='#f8fafc')
    draw.text((1370, 165), 'JOGADORES', font=fonts[19], fill='#475569')
    for i, p in enumerate(players):
        yy = 210 + i * 27
        line(draw, (1370, yy + 10), (1410, yy + 10), colors[i % len(colors)], i)
        label = f'{i + 1}. {name(p["name"])}'
        while draw.textlength(label, font=fonts[19]) > 248:
            label = label[:-2] + '…'
        draw.text((1420, yy), label, font=fonts[19], fill='#0f172a')
    draw.text((40, H - 29), 'SIMULAÇÃO PARA VALIDAÇÃO | Acumulado desde o início do torneio; escala Y própria em cada intervalo.',
              font=fonts[16], fill='#64748b')
    return image, {'first': first.isoformat(), 'last': last.isoformat(), 'minimum': minimum,
                   'maximum': maximum, 'observations': len(selected),
                   'x_dates': dates, 'x_positions': [x(day) for day in dates]}


out = Path(args.output_directory)
out.mkdir(parents=True, exist_ok=False)
overview, overview_evidence = chart(points, start, end, overview=True)
overview.save(out / 'grafico-geral.png')
windows, evidence = [], []
groups = [points[offset:offset + 5] for offset in range(0, len(points), 5)]
# A singleton has no temporal segment. Merge it into the preceding chart.
# A tournament with only one scored date still has no preceding chart to use.
if len(groups) > 1 and len(groups[-1]) == 1:
    groups[-2].extend(groups.pop())
for selected in groups:
    first = date.fromisoformat(selected[0]['day'])
    last = date.fromisoformat(selected[-1]['day'])
    image, record = chart(selected, first, last)
    image.save(out / f'intervalo-{first:%d}-{last:%d}.png')
    windows.append(image)
    evidence.append(record)
sheet = Image.new('RGB', (W, H + math.ceil(len(windows) / 2) * H // 2), '#e2e8f0')
sheet.paste(overview, (0, 0))
for i, image in enumerate(windows):
    image = image.resize((W // 2 - 4, H // 2 - 4), Image.Resampling.LANCZOS)
    sheet.paste(image, ((i % 2) * W // 2 + 2, H + (i // 2) * H // 2 + 2))
sheet.save(out / 'simulacao-cinco-dias.png')
record = {'source_sha256': hashlib.sha256(source).hexdigest(), 'scored_days_per_window': 5,
          'singleton_tail_merged': len(points) > 5 and len(points) % 5 == 1,
          'overview': overview_evidence, 'intervals': evidence,
          'final_totals': [{'id': p['id'], 'total': totals[p['id']]} for p in players]}
(out / 'evidence.json').write_text(json.dumps(record, indent=2), encoding='utf-8')
print(json.dumps({'output': str(out.resolve()), 'intervals': evidence}))
