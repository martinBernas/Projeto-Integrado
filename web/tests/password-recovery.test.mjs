import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

async function load(relative, dependencies, env = {}) {
  const source = await readFile(new URL(relative, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: (name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  }, process: { env } });
  return exports;
}

test('recuperacao valida email, configura callback e nao revela existencia de conta', async () => {
  const calls = [];
  const auth = { resetPasswordForEmail: async (...args) => { calls.push(args); return {}; } };
  const actions = await load('../src/app/auth/actions.ts', {
    'next/navigation': {}, '@/lib/supabase/server': { createClient: async () => ({ auth }) },
  }, { NEXT_PUBLIC_SITE_URL: 'https://geoguaras.example/' });
  const form = new FormData();
  form.set('email', 'invalido');
  assert.ok((await actions.requestPasswordReset({}, form)).error);
  assert.equal(calls.length, 0);
  form.set('email', ' leo@example.test ');
  assert.match((await actions.requestPasswordReset({}, form)).message, /Se houver uma conta/);
  assert.equal(calls[0][0], 'leo@example.test');
  assert.equal(calls[0][1].redirectTo, 'https://geoguaras.example/auth/callback?next=/auth/reset-password');
  auth.resetPasswordForEmail = async () => ({ error: { message: 'internal detail' } });
  assert.doesNotMatch((await actions.requestPasswordReset({}, form)).error, /internal detail/);
});

test('nova senha exige confirmacao e usuario autenticado antes de atualizar', async () => {
  const updates = [];
  const auth = { getUser: async () => ({ data: { user: null } }), updateUser: async (value) => { updates.push(value); return {}; } };
  const actions = await load('../src/app/auth/actions.ts', {
    'next/navigation': {}, '@/lib/supabase/server': { createClient: async () => ({ auth }) },
  });
  const form = new FormData();
  form.set('password', '123');
  assert.ok((await actions.resetPassword({}, form)).error);
  form.set('password', 'new-secret');
  form.set('confirmation', 'different');
  assert.match((await actions.resetPassword({}, form)).error, /coincidem/);
  form.set('confirmation', 'new-secret');
  assert.match((await actions.resetPassword({}, form)).error, /expirou/);
  assert.equal(updates.length, 0);
  auth.getUser = async () => ({ data: { user: { id: 'authenticated-user' } } });
  assert.match((await actions.resetPassword({}, form)).message, /Senha atualizada/);
  assert.equal(updates[0].password, 'new-secret');
  auth.updateUser = async () => ({ error: { message: 'rejected' } });
  assert.ok((await actions.resetPassword({}, form)).error);
});

test('callback preserva cookies, trata falha e impede redirecionamento externo', async () => {
  let failure = false;
  const exchanges = [];
  const route = await load('../src/app/auth/callback/route.ts', {
    'next/server': { NextResponse: { redirect: (location) => ({ headers: new Headers({ location }), cookies: { values: [], set(...args) { this.values.push(args); } } }) } },
    '@supabase/ssr': { createServerClient: (_url, _key, options) => ({ auth: {
      exchangeCodeForSession: async (code) => {
        exchanges.push(code);
        options.cookies.setAll([{ name: 'session', value: 'test', options: { httpOnly: true } }]);
        return { error: failure ? { message: 'expired' } : null };
      },
    } }) },
  }, { NEXT_PUBLIC_SUPABASE_URL: 'https://supabase.example', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test' });
  const request = (query) => ({ nextUrl: new URL(`https://site.example/auth/callback${query}`), cookies: { getAll: () => [] } });
  let response = await route.GET(request('?code=valid&next=/auth/reset-password'));
  assert.equal(response.headers.get('location'), 'https://site.example/auth/reset-password');
  assert.equal(response.cookies.values[0][0], 'session');
  response = await route.GET(request('?code=valid&next=https://evil.example'));
  assert.equal(response.headers.get('location'), 'https://site.example/dashboard');
  failure = true;
  response = await route.GET(request('?code=expired&next=/auth/reset-password'));
  assert.equal(response.headers.get('location'), 'https://site.example/auth/forgot-password?error=invalid-link');
  const count = exchanges.length;
  response = await route.GET(request('?next=/auth/reset-password'));
  assert.equal(exchanges.length, count);
  assert.match(response.headers.get('location'), /invalid-link/);
});

test('token de recuperacao funciona sem cookies anteriores e rejeita token expirado, reutilizado ou tipo diferente', async () => {
  const verified = [];
  const consumed = new Set();
  const route = await load('../src/app/auth/callback/route.ts', {
    'next/server': { NextResponse: { redirect: (location) => ({ headers: new Headers({ location }), cookies: { values: [], set(...args) { this.values.push(args); } } }) } },
    '@supabase/ssr': { createServerClient: (_url, _key, options) => ({ auth: {
      exchangeCodeForSession: async () => { throw new Error('Recovery token must not require a PKCE verifier'); },
      verifyOtp: async ({ token_hash, type }) => {
        assert.deepEqual(options.cookies.getAll(), []);
        verified.push({ token_hash, type });
        if (token_hash === 'expired' || consumed.has(token_hash)) return { error: { message: 'invalid' } };
        consumed.add(token_hash);
        options.cookies.setAll([{ name: 'session', value: 'recovered-session', options: { httpOnly: true } }]);
        return { error: null };
      },
    } }) },
  }, { NEXT_PUBLIC_SUPABASE_URL: 'https://supabase.example', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test' });
  const request = (query) => ({ nextUrl: new URL(`https://site.example/auth/callback${query}`), cookies: { getAll: () => [] } });
  const response = await route.GET(request('?token_hash=valid&type=recovery&next=https://evil.example'));
  assert.deepEqual(verified, [{ token_hash: 'valid', type: 'recovery' }]);
  assert.equal(response.headers.get('location'), 'https://site.example/auth/reset-password');
  assert.equal(response.cookies.values[0][1], 'recovered-session');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer');
  for (const query of ['?token_hash=expired&type=recovery', '?token_hash=valid&type=recovery']) {
    const rejected = await route.GET(request(query));
    assert.equal(rejected.headers.get('location'), 'https://site.example/auth/forgot-password?error=invalid-link');
    assert.equal(rejected.cookies.values.length, 0);
  }
  const before = verified.length;
  for (const query of ['?type=recovery', '?token_hash=valid&type=signup', '?token_hash=valid', '?token_hash=valid&type=signup&code=valid']) {
    const rejected = await route.GET(request(query));
    assert.match(rejected.headers.get('location'), /invalid-link/);
  }
  assert.equal(verified.length, before);
});
