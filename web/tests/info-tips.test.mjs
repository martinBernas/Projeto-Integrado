import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

async function compile(file, globals = {}, dependencies = {}) {
  const source = await readFile(new URL(file, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, ...globals, require: name => { assert.ok(name in dependencies, name); return dependencies[name]; } });
  return exports;
}

test('informacao usa botao sem submit, descricao acessivel e IDs unicos', async () => {
  const { InfoTip } = await compile('../src/app/info-tip.tsx', {}, { react: React, 'react/jsx-runtime': jsx });
  const html = renderToStaticMarkup(jsx.jsxs(React.Fragment, { children: [
    jsx.jsx(InfoTip, { label: 'Pontuação', children: 'Texto com <exemplo> seguro.' }),
    jsx.jsx(InfoTip, { label: 'Ranking', children: 'Empates compartilham posição.' }),
  ] }));
  assert.equal((html.match(/type="button"/g) ?? []).length, 2);
  assert.equal((html.match(/popover="auto"/g) ?? []).length, 2);
  assert.equal((html.match(/role="tooltip"/g) ?? []).length, 2);
  assert.match(html, /aria-label="Informações sobre Pontuação"/);
  assert.match(html, /&lt;exemplo&gt;/);
  const ids = [...html.matchAll(/popovertarget="([^"]+)"/gi)].map(match => match[1]);
  assert.equal(new Set(ids).size, 2);
  for (const id of ids) { assert.ok(html.includes(`id="${id}"`)); assert.ok(html.includes(`aria-describedby="${id}"`)); }
});

async function harness() {
  const events = new Map(), timers = new Map(); let nextTimer = 0;
  class Element {
    dataset = {}; style = {}; attributes = new Map(); open = false; focusVisible = false;
    constructor(kind) { this.kind = kind; }
    matches(selector) { return selector === ':popover-open' ? this.open : selector === ':focus-visible' ? this.focusVisible : selector === `.${this.kind}`; }
    closest(selector) { return this.matches(selector) ? this : selector === '.info-tip' ? wrapper : null; }
    getAttribute(name) { return this.attributes.get(name); }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getBoundingClientRect() { return this === popup ? { width: 270, height: 160 } : { left: 100, bottom: 50 }; }
    querySelector(selector) { return selector === '.info-tip-trigger' ? trigger : popup; }
    contains(target) { return this === wrapper ? [trigger, popup, wrapper].includes(target) : this === target; }
    showPopover() { this.open = true; }
    hidePopover() { this.open = false; }
  }
  const wrapper = new Element('info-tip'), trigger = new Element('info-tip-trigger'), popup = new Element('info-tip-popup');
  trigger.parentElement = wrapper; popup.parentElement = wrapper; trigger.setAttribute('popovertarget', 'tip');
  const doc = { activeElement: null, documentElement: { clientWidth: 390, clientHeight: 844 },
    getElementById: () => popup,
    querySelectorAll: () => popup.dataset.open === 'true' ? [popup] : [],
    querySelector: () => popup.dataset.open === 'true' ? popup : null,
    addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name),
    defaultView: { addEventListener() {}, removeEventListener() {} },
  };
  const helpers = await compile('../src/lib/info-tips.ts', { Element, HTMLElement: Element, Node: Element,
    setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; }, clearTimeout: id => timers.delete(id) });
  const cleanup = helpers.bindInfoTips(doc);
  const fire = (name, target = trigger, extra = {}) => { const event = { target, pointerType: 'mouse', relatedTarget: null, clientX: 100, clientY: 100, preventDefault() { this.prevented = true; }, ...extra }; events.get(name)?.(event); return event; };
  const flush = () => { const tasks = [...timers.values()]; timers.clear(); tasks.forEach(fn => fn()); };
  return { ...helpers, trigger, popup, wrapper, doc, events, fire, flush, cleanup };
}

test('posicao acompanha ponteiro e respeita bordas do celular e tela baixa', async () => {
  const { infoTipPosition } = await harness();
  for (const [x, y, width, height, vw, vh] of [[5, 5, 270, 160, 390, 844], [385, 840, 270, 160, 390, 844], [310, 200, 296, 180, 320, 240]]) {
    const point = infoTipPosition(x, y, width, height, vw, vh);
    assert.ok(point.left >= 12 && point.left + width <= vw - 12);
    assert.ok(point.top >= 12 && point.top + height <= vh - 12);
  }
});

test('mouse abre, move, permite aproximar do balao e fecha ao sair', async () => {
  const h = await harness();
  h.fire('pointerover'); assert.equal(h.popup.open, true); assert.equal(h.trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(h.popup.style.maxWidth, '366px'); assert.equal(h.popup.style.maxHeight, '420px');
  h.fire('pointermove', h.trigger, { clientX: 350, clientY: 800 }); assert.equal(h.popup.style.left, '108px'); assert.equal(h.popup.style.top, '624px');
  h.fire('pointerout', h.trigger); h.fire('pointerover', h.popup); h.flush(); assert.equal(h.popup.open, true);
  h.fire('pointerout', h.popup); h.flush(); assert.equal(h.popup.open, false);
  h.cleanup(); assert.equal(h.events.size, 0);
});

test('toque abre uma vez, fixa ate toque fora, e segundo clique fecha', async () => {
  const h = await harness();
  h.fire('pointerover', h.trigger, { pointerType: 'touch' }); assert.equal(h.popup.open, false);
  assert.equal(h.fire('click').prevented, true); assert.equal(h.popup.open, true);
  h.fire('pointerout'); h.flush(); assert.equal(h.popup.open, true);
  h.fire('click'); assert.equal(h.popup.open, false);
  h.fire('click'); h.fire('pointerdown', null); assert.equal(h.popup.open, false);
});

test('teclado abre no foco, Escape fecha e rolagem de foco mantem ajuda posicionada', async () => {
  const h = await harness(); h.trigger.focusVisible = true; h.doc.activeElement = h.trigger;
  h.fire('focusin'); assert.equal(h.popup.open, true);
  h.fire('keydown', h.trigger, { key: 'Escape' }); h.fire('pointermove'); assert.equal(h.popup.open, false);
  h.fire('focusin'); h.fire('scroll', null); assert.equal(h.popup.open, true);
  h.doc.activeElement = null; h.fire('scroll', null); assert.equal(h.popup.open, false);
  h.fire('focusin'); h.doc.activeElement = null; h.fire('focusout'); h.flush(); assert.equal(h.popup.open, false);
});
