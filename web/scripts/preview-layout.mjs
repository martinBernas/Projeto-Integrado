// Isolated visual preview: real page components, synthetic data, no Auth or DB client.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

const web = fileURLToPath(new URL('../', import.meta.url));
const root = path.join(web, 'src');
const tournamentId = '00000000-0000-4000-8000-000000000001';
const secondId = '00000000-0000-4000-8000-000000000002';
const user = { id: 'preview-player-1', email: 'aurora@example.test' };
const today = '2026-11-24';
const names = ['Aurora', 'Horizonte', 'Bússola', 'Meridiano', 'Atlas', 'Estrela'];
const participants = names.map((name, i) => ({ id: `preview-player-${i}`, name: `Jogador ${name}`, eligible_from: '2026-11-01', geoguessr_url: null }));
const tournaments = [
  { id: tournamentId, name: 'Copa dos Exploradores · demonstração', starts_at: '2026-11-01', ends_at: '2026-11-30', closed_at: null, organizer_id: user.id },
  { id: secondId, name: 'Desafio dos Meridianos · demonstração', starts_at: '2026-11-01', ends_at: '2026-11-30', closed_at: null, organizer_id: user.id },
];
const days = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-23'];
const results = days.flatMap((day, d) => participants.map((p, i) => ({ player_id: p.id, played_on: day, raw_score: 18500 + ((d * 1301 + i * 997) % 6000), applied_score: ((d * 1301 + i * 997) % 6000), result_kind: 'score', provisional: false, personal_score_id: `score-${d}-${i}`, applied_rule_snapshot: { version: '1', minimum_positive: 18500, mode: 'relative_to_lowest' } })));
const rule = { id: 1, effective_from: '2026-11-01', effective_to: '2026-11-30', scoring_mode: 'relative_to_lowest', absence_penalty: -2500, weekly_schedule: 'monday_to_friday', exclusions: [], version: '1', reason: 'Configuração fictícia para revisão visual.', created_at: '2026-11-01T15:00:00Z' };
const dashboard = id => ({ access: true, today, tournament: { ...(tournaments.find(t => t.id === id) ?? tournaments[0]), timezone: 'America/Sao_Paulo', rule_version: '1' }, participants, results, excluded_dates: [], current_rule: rule, rule_versions: [rule] });
const history = results.filter(r => r.player_id === user.id).map(r => ({ id: r.personal_score_id, played_on: r.played_on, score: r.raw_score, source: 'manual' })).reverse();
const notifications = { server_now: `${today}T15:00:00Z`, is_organizer: true, pending_days: 1, request_tournaments: tournaments, managed_tournaments: tournaments.map((t, i) => ({ ...t, corrections_pending: i === 0 ? 1 : 0, audits_requested: 0, audits_open: 0, audits_ready: 0 })), open_votings: [] };
const changes = { has_more: false, changes: [{ id: 'preview-change', player_id: user.id, player_name: 'Jogador Horizonte', played_on: '2026-11-19', old_score: 19350, new_score: 22100, reason: 'Exemplo fictício: correção de digitação no resultado.', requested_at: '2026-11-23T15:00:00Z', decisions: [{ id: 'preview-decision', tournament_name: tournaments[0].name, status: 'pending', old_score: 19350, can_review: true, audit_blocked: false, decided_at: null }] }] };

function query(table) {
  if (!['tournaments', 'personal_scores', 'profiles'].includes(table)) throw Error(`Unsupported preview table: ${table}`);
  let data = table === 'profiles' ? { display_name: 'Jogador Horizonte', public_name_confirmed: true, geoguessr_url: '' } : table === 'tournaments' ? tournaments : [...history];
  const q = { select: () => q, eq: (column, value) => { if (table === 'tournaments' && column === 'id') data = data.filter(row => row.id === value); return q; }, order: () => q, gt: () => q, gte: () => q, lte: () => q,
    lt: (column, value) => { data = data.filter(row => row[column] < value); return q; },
    limit: n => { data = data.slice(0, n); return q; },
    maybeSingle: () => Promise.resolve({ data: Array.isArray(data) ? data[0] : data, error: null }), single: () => Promise.resolve({ data: Array.isArray(data) ? data[0] : data, error: null }),
    then: (resolve, reject) => Promise.resolve({ data, error: null }).then(resolve, reject) };
  return q;
}
const client = { auth: { getUser: async () => ({ data: { user }, error: null }) }, from: query, rpc: async (name, args) => {
  const data = name === 'get_tournament_dashboard' ? dashboard(args.target)
    : name === 'get_tournament_notifications' ? notifications
    : name === 'get_score_audits' ? { server_now: `${today}T15:00:00Z`, organizer: true, participant: true, audits: [] }
    : name === 'get_managed_participants' ? participants
    : name === 'list_participant_candidates' ? { users: [{ id: 'preview-new', name: 'Jogador Sol', email: 'sol@example.test' }], has_more: false }
    : ['get_personal_score_changes', 'get_tournament_score_changes'].includes(name) ? changes : undefined;
  if (data === undefined) throw Error(`Unsupported preview RPC: ${name}`);
  return { data, error: null };
} };
let currentPath = '/dashboard';
const cache = new Map();
const mocks = {
  'react/jsx-runtime': jsx,
  react: { ...React, useActionState: () => [{}, '/__preview/submit', false] },
  'next/link': { default: ({ children, ...props }) => { const attributes = { ...props }; delete attributes.prefetch; delete attributes.onNavigate; return jsx.jsx('a', { ...attributes, children }); } },
  'next/navigation': { usePathname: () => currentPath, useRouter: () => ({ push() {}, refresh() {} }), redirect: () => { throw Error('Unexpected preview redirect'); } },
  '@/lib/supabase/config': { isSupabaseConfigured: true },
  '@/lib/supabase/server': { createClient: async () => client },
  '@/lib/operational-metrics': { createDashboardMetrics: () => async (_stage, value) => value },
};
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const exports = {}; cache.set(file, exports);
  const source = fs.readFileSync(file, 'utf8');
  const out = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(out, { exports, Intl, Date, Map, Set, URL, require(name) {
    if (name in mocks) return mocks[name];
    if (/\/(?:[\w-]*actions)$/.test(name)) return new Proxy({}, { get: () => () => {} });
    if (!name.startsWith('@/') && !name.startsWith('.')) throw Error(`Blocked preview dependency: ${name}`);
    const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
    if (!base.startsWith(root + path.sep)) throw Error('Preview dependency outside source');
    for (const extension of ['', '.tsx', '.ts']) if (fs.existsSync(base + extension) && fs.statSync(base + extension).isFile()) return load(base + extension);
    throw Error(`Unknown preview dependency: ${name}`);
  } });
  return exports;
}
function findCSS(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(f => f.isDirectory() ? findCSS(path.join(dir, f.name)) : f.name.endsWith('.css') ? [path.join(dir, f.name)] : []); }
const cssFiles = fs.existsSync(path.join(web, '.next/static')) ? findCSS(path.join(web, '.next/static')) : [];
if (!cssFiles.length) throw Error('Execute pnpm build antes da prévia.');
const css = cssFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const { AppHeader } = load(path.join(root, 'app/app-header.tsx'));
const routes = new Map([
  ['/dashboard', 'app/dashboard/page.tsx'],
  ['/dashboard/statistics', 'app/dashboard/statistics/page.tsx'],
  ['/dashboard/profile', 'app/dashboard/profile/page.tsx'],
  ['/dashboard/tournaments', 'app/dashboard/tournaments/page.tsx'],
  ['/dashboard/requests', 'app/dashboard/requests/page.tsx'],
  ['/dashboard/notifications', 'app/dashboard/notifications/page.tsx'],
  [`/dashboard/tournaments/${tournamentId}/statistics`, 'app/dashboard/tournaments/[id]/statistics/page.tsx'],
  [`/dashboard/tournaments/${secondId}/statistics`, 'app/dashboard/tournaments/[id]/statistics/page.tsx'],
  [`/dashboard/tournaments/${tournamentId}/audits`, 'app/dashboard/tournaments/[id]/audits/page.tsx'],
  [`/dashboard/tournaments/${secondId}/audits`, 'app/dashboard/tournaments/[id]/audits/page.tsx'],
  [`/dashboard/tournaments/${tournamentId}/participants`, 'app/dashboard/tournaments/[id]/participants/page.tsx'],
  [`/dashboard/tournaments/${secondId}/participants`, 'app/dashboard/tournaments/[id]/participants/page.tsx'],
  [`/dashboard/tournaments/${tournamentId}/rules`, 'app/dashboard/tournaments/[id]/rules/page.tsx'],
  [`/dashboard/tournaments/${secondId}/rules`, 'app/dashboard/tournaments/[id]/rules/page.tsx'],
]);
const browserScript = `
const themeSelect=document.querySelector('select[aria-label="Tema da aplicação"]');
function applyTheme(value){document.documentElement.dataset.theme=value==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):value;}
let preference='dark';try{preference=localStorage.getItem('geoguaras-preview-theme')||'dark';}catch{}
themeSelect.value=preference;applyTheme(preference);
themeSelect.addEventListener('change',()=>{preference=themeSelect.value;applyTheme(preference);try{localStorage.setItem('geoguaras-preview-theme',preference);}catch{}});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>applyTheme(preference));
function notice(text){const status=document.getElementById('preview-status');status.textContent=text;status.focus();}
document.addEventListener('submit',event=>{event.preventDefault();notice('Simulação visual: nada foi salvo, enviado ou alterado.');});
document.querySelectorAll('button[type="button"]:not(.info-tip-trigger)').forEach(button=>button.addEventListener('click',()=>notice('Este controle é apenas visual nesta prévia. Navegação, temas e detalhes das tabelas estão disponíveis.')));
`;
const infoTipScript = ts.transpileModule(fs.readFileSync(path.join(root, 'lib/info-tips.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
async function render(url) {
  const file = routes.get(url.pathname);
  if (!file) return null;
  const Page = load(path.join(root, file)).default;
  const page = await Page({ searchParams: Promise.resolve(Object.fromEntries(url.searchParams)), params: Promise.resolve({ id: url.pathname.split('/')[3] }) });
  currentPath = url.pathname;
  const shell = renderToStaticMarkup(jsx.jsxs(React.Fragment, { children: [
    jsx.jsx(AppHeader, {}),
    jsx.jsxs('aside', { className: 'border-b border-amber-200 bg-amber-50 p-4 text-sm', children: [jsx.jsx('strong', { children: 'SIMULAÇÃO LOCAL · DADOS FICTÍCIOS. ' }), 'Explore pelo menu superior. Formulários e controles de gráficos são demonstrativos; nenhuma ação é enviada ao sistema real.', jsx.jsx('p', { id: 'preview-status', role: 'status', tabIndex: -1 })] }),
    jsx.jsx('div', { id: 'main-content', tabIndex: -1, className: 'app-content', children: page }),
  ] }));
  return `<!doctype html><html lang="pt-BR" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GeoGuaras · simulação local</title><style>${css}</style></head><body>${shell}<script>${browserScript}</script><script type="module">${infoTipScript}\nbindInfoTips(document);</script></body></html>`;
}

// Validate every supported screen before exposing the preview server.
for (const route of routes.keys()) await render(new URL(route, 'http://127.0.0.1'));
if (process.argv.includes('--check')) {
  console.log(`Prévia validada: ${routes.size} rotas renderizadas com dados fictícios, sem cliente real de Auth/banco.`);
} else {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'");
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end('Prévia visual sem gravações.'); return; }
    const url = new URL(req.url, 'http://127.0.0.1:3100');
    if (url.pathname === '/') { res.writeHead(302, { Location: '/dashboard' }); res.end(); return; }
    try {
      const html = await render(url);
      res.writeHead(html ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(req.method === 'HEAD' ? '' : html ?? '<p>Tela não incluída nesta simulação. <a href="/dashboard">Voltar ao painel</a></p>');
    } catch { res.writeHead(500); res.end('Falha ao renderizar a prévia local.'); }
  });
  server.listen(3100, '127.0.0.1', () => console.log('Prévia visual: http://127.0.0.1:3100/dashboard (somente dados fictícios)'));
}
