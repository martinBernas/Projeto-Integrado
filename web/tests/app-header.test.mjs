import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

async function render(pathname) {
  const source = await readFile(new URL('../src/app/app-header.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  const exports = {};
  const dependencies = {
    'react/jsx-runtime': jsx,
    'next/link': { default: ({ children, ...props }) => jsx.jsx('a', { ...props, children }) },
    'next/navigation': { usePathname: () => pathname },
    './theme-picker': { ThemePicker: () => jsx.jsx('select', { 'aria-label': 'Tema da aplicação' }) },
  };
  vm.runInNewContext(outputText, { exports, require: name => { assert.ok(name in dependencies, name); return dependencies[name]; } });
  return renderToStaticMarkup(jsx.jsx(exports.AppHeader, {}));
}

test('cabecalho publico oferece acesso e tema sem indicar sessao autenticada', async () => {
  const html = await render('/auth/forgot-password');
  assert.match(html, /Pular para o conteúdo/);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /Tema da aplicação/);
  assert.match(html, /href="\/auth\/login"/);
  assert.doesNotMatch(html, /Navegação principal|aria-current/);
});

test('navegacao compartilhada mantem destinos e indica apenas a secao atual', async () => {
  for (const [path, active] of [
    ['/dashboard', '/dashboard'],
    ['/dashboard/statistics', '/dashboard/statistics'],
    ['/dashboard/tournaments/demo/audits', '/dashboard/tournaments'],
    ['/dashboard/requests', '/dashboard/requests'],
    ['/dashboard/profile', '/dashboard/profile'],
  ]) {
    const html = await render(path);
    assert.match(html, /Navegação principal/);
    assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
    assert.ok(html.includes(`href="${active}" aria-current="page"`));
    for (const href of ['/dashboard', '/dashboard/statistics', '/dashboard/tournaments', '/dashboard/requests', '/dashboard/profile']) assert.ok(html.includes(`href="${href}"`));
    assert.doesNotMatch(html, /href="\/auth\/login"/);
  }
});
