import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

test('ações validam sessão, datas reais e confirmação; usam RPC e invalidam telas', async () => {
  const source = await readFile(new URL('../src/app/dashboard/tournaments/actions.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const calls = []; const paths = []; let user = null; let error = null;
  const dependencies = {
    'next/cache': { revalidatePath: path => paths.push(path) },
    '@/lib/supabase/server': { createClient: async () => ({
      auth: { getUser: async () => ({ data: { user } }) },
      rpc: async (...args) => { calls.push(args); return { error }; },
    }) },
  };
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: name => {
    assert.ok(name in dependencies); return dependencies[name];
  } });
  const form = new FormData();
  form.set('operation', 'create'); form.set('name', 'Copa outubro');
  form.set('start', '2026-10-01'); form.set('end', '2026-10-31');
  assert.match((await exports.manageTournament({}, form)).error, /sessão/);
  assert.equal(calls.length, 0);
  user = { id: 'organizer' };
  form.set('start', '2026-02-30');
  assert.match((await exports.manageTournament({}, form)).error, /período/);
  assert.equal(calls.length, 0);
  form.set('start', '2026-10-01');
  assert.match((await exports.manageTournament({}, form)).message, /criado/);
  assert.equal(calls[0][0], 'create_tournament');
  assert.equal(calls[0][1].tournament_name, 'Copa outubro');
  assert.deepEqual(paths, ['/dashboard', '/dashboard/tournaments']);
  form.set('operation', 'update');
  form.set('target', '00000000-0000-4000-8000-000000000001');
  error = { message: 'period_locked' };
  assert.match((await exports.manageTournament({}, form)).error, /período não pode mudar/);
  assert.equal(paths.length, 2);
  error = { message: 'secret database details' };
  assert.doesNotMatch((await exports.manageTournament({}, form)).error, /secret/);
  form.set('operation', 'close');
  const before = calls.length;
  assert.match((await exports.manageTournament({}, form)).error, /Confirme/);
  assert.equal(calls.length, before);
  form.set('confirm', 'yes'); error = null;
  assert.match((await exports.manageTournament({}, form)).message, /encerrado/);
  assert.equal(calls.at(-1)[0], 'close_tournament');
});
