import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {loadPersonalStatistics,personalStatistics,statisticsPeriod,saoPauloToday,thirtyDayStart} from '../src/lib/personal-statistics.ts';

test('RF20 averages exclude zero, derive per-game before rounding and return no fictitious empty values',()=>{
 const s=personalStatistics([{played_on:'2026-10-02',score:15000},{played_on:'2026-10-01',score:20000},{played_on:'2026-10-03',score:0}]);
 assert.equal(s.days,2);assert.equal(s.dailyAverage,17500);assert.equal(s.gameAverage,3500);
 assert.deepEqual(s.points.map(p=>p.played_on),['2026-10-01','2026-10-02']);
 const rounded=personalStatistics([{played_on:'2026-10-01',score:17502},{played_on:'2026-10-02',score:17503}]);
 assert.equal(rounded.dailyAverage,17503);assert.equal(rounded.gameAverage,3501);
 const independent=personalStatistics([{played_on:'2026-10-01',score:17502},{played_on:'2026-10-02',score:17502}]);
 assert.equal(independent.gameAverage,3500);
 assert.equal(personalStatistics([]).dailyAverage,null);assert.equal(personalStatistics([{played_on:'2026-10-01',score:0}]).gameAverage,null);
 assert.equal(statisticsPeriod(undefined),'last5');assert.equal(statisticsPeriod(['all','last30']),'last5');assert.equal(statisticsPeriod('all'),'all');
 assert.equal(saoPauloToday(new Date('2026-01-01T01:00:00Z')),'2025-12-31');
 assert.equal(thirtyDayStart('2026-01-10'),'2025-12-12');assert.equal(thirtyDayStart('2024-03-01'),'2024-02-01');
});

// Exercise the real SQL filtering under the same authenticated RLS used by the
// Supabase client; emulate a lower remote page cap to test complete traversal.
function client(db, cap=37, failPage=Infinity) {
 let page=0;
 return {from(table){assert.equal(table,'personal_scores');const clauses=[],values=[];let limit=200;
  const add=(col,op,val)=>{assert.ok(['played_on','score','player_id'].includes(col));values.push(val);clauses.push(`${col}${op}$${values.length}`);return query;};
  const query={select:()=>query,eq:(c,v)=>add(c,'=',v),gt:(c,v)=>add(c,'>',v),gte:(c,v)=>add(c,'>=',v),lte:(c,v)=>add(c,'<=',v),lt:(c,v)=>add(c,'<',v),order:()=>query,limit:n=>{limit=Math.min(n,cap);return query;},
   then(resolve,reject){page++;if(page===failPage)return Promise.resolve({data:null,error:{message:'unavailable'}}).then(resolve,reject);
    return db.query(`select played_on::text,score from public.personal_scores where ${clauses.join(' and ')} order by played_on desc limit ${limit}`,values).then(result=>({data:result.rows,error:null})).then(resolve,reject);}};
  return query;}};
}
const alice='00000000-0000-4000-8000-000000000001',bob='00000000-0000-4000-8000-000000000002';
test('RF20 real RLS isolates owners, loads >100 and >page-cap records, last5 played dates and last30 boundaries; errors discard partial data',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
   create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
   create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   grant usage on schema public,auth to authenticated,anon;`);
  for(const file of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile(new URL(`../supabase/migrations/${file}`,import.meta.url),'utf8'));
  await db.exec('grant select on public.personal_scores to authenticated,anon');
  await db.query(`insert into auth.users(id,email,raw_user_meta_data) values($1,'a@test','{"display_name":"Alice"}'),($2,'b@test','{"display_name":"Bob"}')`,[alice,bob]);
  await db.query(`insert into public.personal_scores(player_id,occurred_at,score)
   select $1,('2025-01-01'::date+n+time '12:00') at time zone 'America/Sao_Paulo',10000+n from generate_series(0,249) n`,[alice]);
  await db.query(`insert into public.personal_scores(player_id,occurred_at,score) values
   ($1,'2026-01-01 15:00Z',25000),($1,'2026-01-02 15:00Z',0),($1,'2026-01-10 15:00Z',20000),
   ($1,'2026-01-11 15:00Z',15000),($1,'2026-01-12 15:00Z',0),($1,'2026-01-13 15:00Z',10000),
   ($1,'2026-01-14 15:00Z',0),($1,'2026-01-15 15:00Z',5000),($1,'2026-01-16 15:00Z',25000),
   ($1,'2025-12-17 15:00Z',11111),($1,'2025-12-16 15:00Z',22222),($2,'2026-01-15 15:00Z',12345)`,[alice,bob]);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[alice]);await db.exec('set role authenticated');
  const full=await loadPersonalStatistics(client(db),alice,'all','2026-01-15');
  assert.equal(full.days,257);assert.ok(!full.points.some(p=>p.played_on==='2026-01-16'));
  const five=await loadPersonalStatistics(client(db,2),alice,'last5','2026-01-15');
  assert.deepEqual(five.points.map(p=>p.played_on),['2026-01-01','2026-01-10','2026-01-11','2026-01-13','2026-01-15']);
  const thirty=await loadPersonalStatistics(client(db),alice,'last30','2026-01-15');
  assert.ok(thirty.points.some(p=>p.played_on==='2025-12-17'));assert.ok(!thirty.points.some(p=>p.played_on==='2025-12-16'));assert.equal(thirty.days,6);
  assert.equal((await loadPersonalStatistics(client(db),bob,'all','2026-01-15')).days,0);
  await assert.rejects(loadPersonalStatistics(client(db,37,2),alice,'all','2026-01-15'),/unavailable/);
  await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[bob]);await db.exec('set role authenticated');
  assert.equal((await loadPersonalStatistics(client(db),bob,'last5','2026-01-15')).days,1);
  assert.equal((await loadPersonalStatistics(client(db),alice,'all','2026-01-15')).days,0);
  await db.exec('reset role;set role anon');assert.equal((await loadPersonalStatistics(client(db),alice,'all','2026-01-15')).days,0);
 } finally {await db.close();}
});
