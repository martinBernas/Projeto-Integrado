import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import * as tournament from '../src/lib/tournament.ts';
import * as rules from '../src/lib/rules.ts';

test('abas preservam seleção por URL e tratam lista vazia, falhas e acesso inválido', async () => {
  let rows = [
    { id: 'closed', name: 'Copa encerrada', starts_at: '2026-09-01', ends_at: '2026-09-30', closed_at: '2026-10-01' },
    { id: 'open', name: 'Copa aberta', starts_at: '2026-08-01', ends_at: '2026-10-30', closed_at: null },
  ];
  let listError = null;
  let rpcError = null;
  let schedule;
  const calls = [];
  const dependencies = {
    'react/jsx-runtime': jsx,
    'next/link': { default: ({ children, ...props }) => jsx.jsx('a', { ...props, children }) },
    'next/navigation': { redirect: () => { throw new Error('redirect'); } },
    '@/app/auth/actions': { signOut: () => {} },
    '@/lib/supabase/config': { isSupabaseConfigured: true },
    '@/lib/tournament': tournament,
    '@/lib/rules': rules,
    './score-form': { ScoreForm: () => null },
    './tournament-view': { TournamentView: ({ data }) => jsx.jsx('p', { children: `Ranking ${data.tournament.name}` }) },
    '@/lib/supabase/server': { createClient: async () => ({
      auth: { getUser: async () => ({ data: { user: { id: 'user', email: 'test@example.test' } } }) },
      from: table => {
        const query = { select: () => query, eq: () => query, order: () => query, limit: () => query, maybeSingle: () => query,
          then: resolve => resolve({ data: table === 'tournaments' ? rows : [], error: table === 'tournaments' ? listError : null }) };
        return query;
      },
      rpc: async (_, { target }) => {
        calls.push(target);
        return { error: rpcError, data: { access: true, today: '2026-09-26', tournament: rows.find(t => t.id === target), excluded_dates: [],
          ...(schedule ? { rule_versions: [{ id: 1, effective_from: '2026-08-01', effective_to: '2026-10-31', weekly_schedule: schedule, exclusions: [] }] } : {}) } };
      },
    }) },
  };
  const source = await readFile(new URL('../src/app/dashboard/page.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, Intl, Date, require: name => dependencies[name] });
  const render = async value => renderToStaticMarkup(await exports.default({ searchParams: Promise.resolve(value) }));
  assert.match(await render({}), /Ranking Copa aberta/);
  assert.equal(calls.at(-1), 'open');
  schedule = 'every_day';
  assert.doesNotMatch(await render({ tournament: 'open' }), /Este lançamento não conta/);
  schedule = 'monday_to_friday';
  assert.match(await render({ tournament: 'open' }), /Este lançamento não conta/);
  schedule = undefined;
  const closed = await render({ tournament: 'closed' });
  assert.match(closed, /href="\/dashboard\?tournament=closed" aria-current="page"/);
  assert.match(closed, /Ranking Copa encerrada/);
  assert.match(await render({ tournament: 'closed' }), /Ranking Copa encerrada/);
  const before = calls.length;
  assert.match(await render({ tournament: 'unknown' }), /Torneio indisponível/);
  assert.match(await render({ tournament: ['open', 'closed'] }), /Torneio indisponível/);
  assert.equal(calls.length, before);
  rpcError = { message: 'internal' };
  assert.match(await render({ tournament: 'open' }), /Torneio temporariamente indisponível/);
  rpcError = null;
  rows = [];
  assert.match(await render({}), /Você ainda não participa/);
  listError = { message: 'internal' };
  assert.match(await render({}), /Não foi possível carregar seus torneios/);
});
