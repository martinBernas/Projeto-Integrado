import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
const alice='00000000-0000-4000-8000-000000000001';
const bob='00000000-0000-4000-8000-000000000002';
const stranger='00000000-0000-4000-8000-000000000003';
const migration = name => readFile(new URL(`../supabase/migrations/${name}.sql`,import.meta.url),'utf8');
const currentMigration=()=>migration('202609270001_public_profiles');
async function setup(apply=true) {
 const db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth to anon,authenticated;`);
 for(const file of ['202609120001_initial_schema','202609200001_september_mvp','202609200002_score_entry','202609260001_tournament_management','202609260002_participant_management','202609260003_multiple_tournaments']) await db.exec(await migration(file));
 await db.query("insert into auth.users(id,email) values ($1,'legacy-private@example.test'),($2,'bob@example.test'),($3,'stranger@example.test')",[alice,bob,stranger]);
 await db.exec('grant select,insert,update,delete on all tables in schema public to anon,authenticated');
 if(apply) await db.exec(await currentMigration());
 return db;
}
async function login(db,id,role='authenticated'){
 await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]); await db.exec(`set role ${role}`);
}
const update=(db,name,url=null)=>db.query('select public.update_my_profile($1,$2)',[name,url]);

test('perfil: migração preserva legado, edição validada e unicidade global sem escrita direta', async()=>{
 const db=await setup(); try{
  await login(db,alice);
  const original=(await db.query('select * from public.profiles')).rows;
  assert.equal(original.length,1); assert.equal(original[0].display_name,'legacy-private'); assert.equal(original[0].public_name_confirmed,false);
  assert.equal((await db.query("update public.profiles set display_name='Bypass' returning id")).rows.length,0);
  await assert.rejects(db.query('insert into public.profiles(id) values ($1)',[crypto.randomUUID()]), /row-level security/);
  for(const bad of [null,'','  ','a@b.test','a\nb','a'.repeat(81)]) await assert.rejects(update(db,bad),/invalid_public_name/);
  await update(db,'  Ana  ','https://geoguessr.com/user/abc123/');
  const profile=(await db.query('select * from public.profiles')).rows[0];
  assert.equal(profile.display_name,'Ana'); assert.equal(profile.public_name_confirmed,true);
  assert.equal(profile.geoguessr_url,'https://www.geoguessr.com/user/abc123');
  for(const bad of ['http://www.geoguessr.com/user/abc','https://www.geoguessr.com.evil/user/abc','javascript:alert(1)','https://www.geoguessr.com/user/abc?x=1','https://evil@www.geoguessr.com/user/abc','https://www.geoguessr.com/maps/abc']) await assert.rejects(update(db,'Ana',bad),/invalid_geoguessr_url/);
  await update(db,'Ana',''); assert.equal((await db.query('select geoguessr_url from public.profiles')).rows[0].geoguessr_url,null);
  await login(db,bob); await assert.rejects(update(db,' aNA '),/public_name_unavailable/);
  await update(db,'José'); await login(db,alice); await assert.rejects(update(db,'Jose\u0301'),/public_name_unavailable/);
  await assert.rejects(db.query('select * from private.profile_changes'),/permission denied/);
  await login(db,'','anon'); await assert.rejects(update(db,'Other'),/permission denied/);
  assert.equal((await db.query("select public.is_public_name_available(' ANA ') free")).rows[0].free,false);
  await login(db,''); await assert.rejects(update(db,'Other'),/authentication_required/);
  await db.exec('reset role'); assert.ok((await db.query('select count(*)::int n from private.profile_changes')).rows[0].n>=3);
 }finally{await db.close();}
});

test('migração recusa colisões legadas sem renomear contas',async()=>{
 const db=await setup(false); try{
  await db.query("update public.profiles set display_name=case when id=$1 then 'Nome' else ' nome ' end where id in ($1,$2)",[alice,bob]);
  await assert.rejects(db.exec(await currentMigration()),/existing_public_name_conflicts/); await db.exec('rollback');
  assert.equal((await db.query("select count(*)::int n from information_schema.columns where table_name='profiles' and column_name='public_name_confirmed'")).rows[0].n,0);
  assert.equal((await db.query('select display_name from public.profiles where id=$1',[bob])).rows[0].display_name,' nome ');
 }finally{await db.close();}
});

test('cadastro exige nome explícito e restrição arbitra reservas simultâneas',async()=>{
 const db=await setup();try{
  await assert.rejects(db.query("insert into auth.users(id,email) values ($1,'no-name@test.test')",[crypto.randomUUID()]),/invalid_public_name/);
  const ids=[crypto.randomUUID(),crypto.randomUUID()];
  const outcomes=await Promise.allSettled(ids.map(id=>db.query("insert into auth.users(id,email,raw_user_meta_data) values($1,'new@test.test','{\"display_name\":\"NewName\"}')",[id])));
  assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(outcomes.filter(x=>x.status==='rejected').length,1);
  assert.equal((await db.query("select count(*)::int n from public.profiles where display_name='NewName' and public_name_confirmed")).rows[0].n,1);
 }finally{await db.close();}
});

test('links e nomes confirmados só nos torneios autorizados; inclusão não sobrescreve nome',async()=>{
 const db=await setup();try{
  await login(db,alice);
  const t=(await db.query("select public.create_tournament('Perfil teste','2026-09-01','2026-09-30') id")).rows[0].id;
  await db.query("select public.add_tournament_participant($1,$2,'2026-09-01')",[t,bob]);
  const dash=async()=> (await db.query('select public.get_tournament_dashboard($1) d',[t])).rows[0].d;
  const legacy=await dash(); assert.match(legacy.participants[0].name,/^Jogador /); assert.doesNotMatch(JSON.stringify(legacy),/bob@example|\"name\":\"bob\"/);
  await login(db,bob); await update(db,'Public Bob','https://www.geoguessr.com/user/123');
  assert.equal((await dash()).participants[0].geoguessr_url,'https://www.geoguessr.com/user/123');
  await login(db,stranger); assert.deepEqual(await dash(),{access:false});
  assert.equal((await db.query('select * from public.profiles where id=$1',[bob])).rows.length,0);
  await login(db,alice);
  const members=(await db.query('select public.get_managed_participants($1) d',[t])).rows[0].d;
  assert.equal(members[0].name,'Public Bob'); assert.equal(members[0].geoguessr_url,'https://www.geoguessr.com/user/123');
  assert.equal('email' in members[0],false);
  await db.query('select public.remove_tournament_participant($1,$2)',[t,bob]); await login(db,bob); assert.deepEqual(await dash(),{access:false});
  await db.exec('reset role'); await db.query('select private.provision_september($1)',[alice]);
  await db.query("select private.add_september_participant($1,'Overwrite')",[bob]);
  assert.equal((await db.query('select display_name from public.profiles where id=$1',[bob])).rows[0].display_name,'Public Bob');
 }finally{await db.close();}
});

const backupPath=new URL('../../backups/sprint-4/before-s4-02-september-v1.json',import.meta.url);
test('cópia privada: migração de perfil preserva identidade, nomes existentes, pontuações, vínculos e cálculo', {skip:!existsSync(backupPath)}, async()=>{
 const db=await setup(false);try{
  const backup=JSON.parse(await readFile(backupPath,'utf8')); const snapshot=backup.snapshot;
  const ids=new Set([...backup.players,...Object.values(snapshot.tournament).map(t=>t.organizer_id)]);
  for(const id of ids) await db.query('insert into auth.users(id,email) values($1,$2)',[id,`${id}@fixture.invalid`]);
  for(const p of Object.values(snapshot.profiles)) await db.query('update public.profiles set display_name=$2,created_at=$3 where id=$1',[p.id,p.display_name,p.created_at]);
  for(const [table,section] of [['tournaments','tournament'],['tournament_participants','participants'],['tournament_excluded_dates','excluded_dates'],['tournament_score_results','stored_results']]) {
   if(table==='tournament_score_results') continue;
   await db.query(`insert into public.${table} select * from jsonb_populate_recordset(null::public.${table},$1::jsonb)`,[JSON.stringify(Object.values(snapshot[section]))]);
  }
  await db.query(`insert into public.personal_scores(id,player_id,score,occurred_at,created_at,updated_at,source)
    select id,player_id,score,occurred_at,created_at,updated_at,source from jsonb_populate_recordset(null::public.personal_scores,$1::jsonb)`,[JSON.stringify(Object.values(snapshot.personal_scores))]);
  await db.query('insert into public.tournament_score_results select * from jsonb_populate_recordset(null::public.tournament_score_results,$1::jsonb)',[JSON.stringify(Object.values(snapshot.stored_results))]);
  const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
  const state=async()=>{
   const output=[];
   for(const table of ['profiles','personal_scores','tournaments','tournament_participants','tournament_excluded_dates','tournament_score_results']) output.push((await db.query(`select to_jsonb(t) - 'public_name_confirmed' - 'geoguessr_url' as d from public.${table} t order by (to_jsonb(t)::text)`)).rows);
   return hash(output);
  };
  const calc=async()=>hash((await db.query('select * from private.calculate_tournament($1,$2) order by player_id,played_on',[backup.tournament_id,backup.as_of])).rows);
  const before=await state(); const calculation=await calc();
  await db.exec(await currentMigration());
  assert.equal(await state(),before,'original business fields must remain unchanged'); assert.equal(await calc(),calculation);
 }finally{await db.close();}
});

test('comparador de perfil exclui somente colunas novas e preserva backup original',async()=>{
 const db=await setup(false);try{
  await db.query('select private.provision_september($1)',[alice]);
  await db.query("select private.add_september_participant($1,'Nome antigo')",[bob]);
  const readScript=name=>readFile(new URL(`../supabase/${name}.sql`,import.meta.url),'utf8');
  await db.exec(await readScript('rehearsal/sprint4/01-backup'));
  const captured=(await db.query('select md5(snapshot::text) h from private.sprint4_backups')).rows[0].h;
  await db.exec(await currentMigration());
  const compare=async()=> (await db.exec(await readScript('operations/20260927-profile-verify'))).find(r=>r.rows?.[0]?.backup_id).rows[0];
  assert.equal(Number((await compare()).diferencas),0);
  await login(db,bob); await update(db,'Nome novo'); await db.exec('reset role');
  const changed=await compare(); assert.equal(Number(changed.diferencas),1);
  assert.equal(changed.detalhes[0].section,'profiles');
  assert.equal((await db.query('select md5(snapshot::text) h from private.sprint4_backups')).rows[0].h,captured);
 }finally{await db.close();}
});
