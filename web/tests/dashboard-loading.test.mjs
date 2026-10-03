import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';

async function load(path, dependencies, globals = {}) {
  const source = await readFile(new URL(`../src/${path}`, import.meta.url),'utf8');
  const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports = {};
  vm.runInNewContext(code,{exports,require:name=>{assert.ok(name in dependencies,name);return dependencies[name];},...globals});
  return exports;
}

test('tournament navigation shows requested selection while pending, hides old results and preserves URLs',async()=>{
  let pending=false;let name='';const pushes=[];
  const {TournamentPanel}=await load('app/dashboard/tournament-panel.tsx',{
    'react/jsx-runtime':jsx,
    react:{useTransition:()=>[pending,action=>{pending=true;action();}],useState:()=>[name,next=>{name=next;}]},
    'next/navigation':{useRouter:()=>({push:(...args)=>pushes.push(args)})},
    'next/link':{default:({children,...props})=>{const attributes={...props};delete attributes.onNavigate;delete attributes.prefetch;return jsx.jsx('a',{...attributes,children});}},
  });
  const props={tournaments:[{id:'first',name:'Primeiro',closed_at:null},{id:'second',name:'Segundo',closed_at:'2026-10-01'}],selectedId:'first',children:jsx.jsx('p',{children:'Ranking Primeiro'})};
  let tree=TournamentPanel(props);assert.match(renderToStaticMarkup(tree),/Ranking Primeiro/);
  const links=tree.props.children[0].props.children;
  assert.equal(links[1].props.prefetch,false);let prevented=false;
  links[1].props.onNavigate({preventDefault:()=>{prevented=true;}});
  assert.equal(prevented,true);assert.equal(pushes[0][0],'/dashboard?tournament=second');assert.equal(pushes[0][1].scroll,false);
  let html=renderToStaticMarkup(TournamentPanel(props));
  assert.match(html,/Carregando torneio Segundo/);assert.match(html,/aria-busy="true"/);assert.doesNotMatch(html,/Ranking Primeiro/);assert.match(html,/Selecionar torneio/);
  TournamentPanel(props).props.children[0].props.children[0].props.onNavigate({preventDefault(){}});
  assert.equal(pushes.at(-1)[0],'/dashboard?tournament=first');assert.match(renderToStaticMarkup(TournamentPanel(props)),/Carregando torneio Primeiro/);
  pending=false;html=renderToStaticMarkup(TournamentPanel({...props,selectedId:'second',children:jsx.jsx('p',{children:'Ranking Segundo'})}));
  assert.match(html,/Ranking Segundo/);assert.doesNotMatch(html,/Carregando torneio/);
});

test('explicit retry refreshes current route and announces pending work; unexpected errors use Next retry',async()=>{
  let pending=false;let refreshes=0;
  const {RetryLoad}=await load('app/dashboard/retry-load.tsx',{
    'react/jsx-runtime':jsx,react:{useTransition:()=>[pending,action=>{pending=true;action();}]},
    'next/navigation':{useRouter:()=>({refresh:()=>{refreshes++;}})},
  });
  const tree=RetryLoad();assert.match(renderToStaticMarkup(tree),/Tentar novamente/);
  tree.props.children[0].props.onClick();assert.equal(refreshes,1);
  const html=renderToStaticMarkup(RetryLoad());assert.match(html,/disabled/);assert.match(html,/Consultando os dados novamente/);
  const {default:ErrorView}=await load('app/dashboard/error.tsx',{'react/jsx-runtime':jsx});let retries=0;
  const error=ErrorView({retry:()=>{retries++;}});error.props.children.props.children.at(-1).props.onClick();assert.equal(retries,1);
  const {default:Loading}=await load('app/dashboard/loading.tsx',{'react/jsx-runtime':jsx});assert.match(renderToStaticMarkup(Loading()),/Carregando seus dados/);
});

test('query metrics measure slow stages, retain results/errors and exclude private data',async()=>{
  const logs=[];let time=0;
  const {measureDashboardQuery}=await load('lib/dashboard-metrics.ts',{}, {performance:{now:()=>time},console:{info:value=>logs.push(JSON.parse(value))}});
  const result={data:{access:true,email:'private@example.test',score:12345},error:null};
  const query={then:resolve=>{time=1500;resolve(result);}};
  assert.equal(await measureDashboardQuery('tournament_rpc',query),result);
  assert.equal(logs[0].duration_ms,1500);assert.equal(logs[0].outcome,'success');
  const failure={error:{code:'57014',message:'private timeout details'}};
  assert.equal(await measureDashboardQuery('tournament_rpc',Promise.resolve(failure)),failure);assert.equal(logs[1].code,'57014');
  const exception=new Error('secret');await assert.rejects(measureDashboardQuery('authentication',Promise.reject(exception)),exception);
  assert.equal(logs[2].outcome,'exception');
  await measureDashboardQuery('tournament_rpc',Promise.resolve({data:{access:false},error:null}));assert.equal(logs[3].outcome,'denied');
  await measureDashboardQuery('tournament_rpc',Promise.resolve({data:null,error:null}));assert.equal(logs[4].outcome,'empty');assert.doesNotMatch(JSON.stringify(logs),/private|12345|secret/);
});

test('proxy measures session validation only on dashboard and retains cookie refresh',async()=>{
  let claims=0;let cookieOptions;const stages=[];const writes=[];
  const response=()=>({cookies:{set:(...args)=>writes.push(['response',...args])}});
  const {updateSession}=await load('lib/supabase/proxy.ts',{
    '@supabase/ssr':{createServerClient:(_,__,options)=>{cookieOptions=options.cookies;return {auth:{getClaims:async()=>{claims++;cookieOptions.setAll([{name:'session',value:'refreshed',options:{httpOnly:true}}]);return {data:{claims:{}},error:null};}}};}},
    'next/server':{NextResponse:{next:response}},
    '@/lib/dashboard-metrics':{measureDashboardQuery:async(stage,query)=>{stages.push(stage);return await query;}},
  },{process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://example.test',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'public-test'}}});
  const request=path=>({nextUrl:{pathname:path},cookies:{getAll:()=>[],set:(...args)=>writes.push(['request',...args])}});
  await updateSession(request('/dashboard'));assert.equal(claims,1);assert.deepEqual(stages,['session_claims']);
  assert.equal(writes[0][0],'request');assert.equal(writes[1][0],'response');assert.equal(writes[1][3].httpOnly,true);
  await updateSession(request('/auth/login'));assert.equal(claims,2);assert.equal(stages.length,1);
});
