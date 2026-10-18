import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

test('resolution displays totals before punishment, with no default sanction and no sanction for maintained results',async()=>{
 const source=await readFile(new URL('../src/app/dashboard/tournaments/audit-form.tsx',import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
 let state={},hook=0;
 const deps={'react/jsx-runtime':jsx,react:{useActionState:()=>[hook++===0?state:{},undefined,false]},'./audit-actions':{manageAudit:()=>{}}};
 const exports={};vm.runInNewContext(outputText,{exports,require:n=>deps[n]});
 const render=()=>{hook=0;return renderToStaticMarkup(jsx.jsx(exports.AuditResolution,{target:'t',audit:'a'}));};
 assert.match(render(),/Apurar votos/);assert.doesNotMatch(render(),/name="sanction"|name="confirm"|Aplicar punição/);
 state={tally:{invalid_votes:3,maintain_votes:1}};
 let html=render();
 assert.match(html,/Total de votos: 4/);assert.match(html,/Aplicar punição e encerrar/);
 assert.match(html,/<option value="" disabled="" selected="">Selecione a punição/);
 assert.ok(html.indexOf('Resultado dos votos')<html.indexOf('name="sanction"'));
 assert.match(html,/ranking permanece inalterado/);
 for(const [invalid,maintain,reason] of [[0,0,'Sem votos'],[2,2,'Empate'],[1,3,'Maioria por manter']]) {
  state={tally:{invalid_votes:invalid,maintain_votes:maintain}};html=render();
  assert.ok(html.includes(reason));assert.match(html,/Manter pontuação e encerrar/);assert.doesNotMatch(html,/name="sanction"/);
 }
 state={error:'A apuração fica disponível após o prazo de 48 horas.'};assert.match(render(),/role="alert"/);assert.doesNotMatch(render(),/name="sanction"/);
});
