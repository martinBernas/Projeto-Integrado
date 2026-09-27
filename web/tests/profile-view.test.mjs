import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import * as profile from '../src/lib/profile.ts';
test('link de perfil renderiza domínio permitido em nova aba e rejeita links externos inseguros',async()=>{
 const source=await readFile(new URL('../src/app/dashboard/player-name.tsx',import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
 const deps={'react/jsx-runtime':jsx,'@/lib/profile':profile};const exports={};
 vm.runInNewContext(outputText,{exports,require:name=>deps[name]});
 const render=url=>renderToStaticMarkup(jsx.jsx(exports.PlayerName,{name:'Ana <exemplo>',url}));
 const html=render('https://www.geoguessr.com/user/abc123');
 assert.match(html,/Ana &lt;exemplo&gt;/); assert.match(html,/target="_blank" rel="noopener noreferrer"/);
 for(const url of [null,'','javascript:alert(1)','https://www.geoguessr.com.evil/user/abc','https://www.geoguessr.com/maps/abc']) assert.doesNotMatch(render(url),/<a /);
});
