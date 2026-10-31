import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tournamentStatistics, statisticsScore } from '../src/lib/tournament-statistics.ts';
import { tournamentReport } from '../src/lib/tournament-report.ts';

const base=()=>({access:true,today:'2026-10-18',tournament:{id:'t',name:'Test',starts_at:'2026-10-01',ends_at:'2026-10-31'},
 participants:[{id:'me',name:'Me',eligible_from:'2026-10-01'},{id:'a',name:'A',eligible_from:'2026-10-01'},{id:'b',name:'B',eligible_from:'2026-10-02'}],excluded_dates:[],results:[]});
const row=(player,day,applied,kind='score',raw=10000)=>({player_id:player,played_on:day,raw_score:raw,applied_score:applied,result_kind:kind,provisional:false});

test('RF21 averages include absences, exclude self from weighted comparison and round only on display',()=>{
 const data=base();data.results=[row('me','2026-10-01',12000),row('me','2026-10-02',-2500,'absence',null),
 row('a','2026-10-01',10000),row('a','2026-10-02',-2500,'absence',0),row('b','2026-10-02',5000)];
 const stats=tournamentStatistics(data,'me');assert.equal(stats.ownAverage,4750);assert.equal(stats.ownDays,2);
 assert.equal(stats.othersAverage,12500/3);assert.equal(stats.othersDays,3);assert.equal(statisticsScore(stats.othersAverage),'4.167');
 assert.deepEqual(stats.points,[{day:'2026-10-01',own:12000,others:10000,othersCount:1},{day:'2026-10-02',own:-2500,others:1250,othersCount:2}]);
 assert.equal(statisticsScore(-0.1),'0');assert.equal(statisticsScore(0),'0');
});

test('RF21 counts valid relative zeros, ties and sole valid scores; absence and sanctions only affect averages',()=>{
 const data=base();data.results=[row('me','2026-10-01',0),row('a','2026-10-01',2000),
 row('me','2026-10-02',100),row('a','2026-10-02',100),row('b','2026-10-02',100),
 row('me','2026-10-03',500),row('a','2026-10-03',-2500,'absence',0),row('b','2026-10-03',0,'audit_disregarded'),
 row('me','2026-10-04',-2500,'audit_penalty'),row('a','2026-10-04',-2500,'absence',null),
 row('me','2026-10-05',0,'audit_disregarded')];
 const stats=tournamentStatistics(data,'me');assert.equal(stats.first,2);assert.equal(stats.last,3);assert.equal(stats.ownDays,5);
 assert.equal(stats.ownAverage,-380);
});

test('RF21 omits current/future, provisional, pending, excluded, out-of-period and ineligible rows',()=>{
 const data=base();data.excluded_dates=['2026-10-12'];
 data.results=[row('me','2026-10-01',100),row('me','2026-10-18',900),row('me','2026-10-19',900),
 row('b','2026-10-01',900),row('unknown','2026-10-01',900),row('me','2026-09-30',900),row('me','2026-11-01',900),
 row('me','2026-10-12',900),{...row('me','2026-10-03',900),provisional:true},row('me','2026-10-04',0,'pending',null)];
 const stats=tournamentStatistics(data,'me');assert.equal(stats.ownAverage,100);assert.equal(stats.ownDays,1);assert.equal(stats.othersAverage,null);
 assert.equal(stats.first,1);assert.equal(stats.last,1);assert.equal(stats.points.length,1);
 assert.equal(stats.progression.points.length,1);assert.equal(stats.progression.points[0].totals.me,100);
});

test('RF26 shares the PDF cumulative model; RF27 personal rivals are not truncated to the global top five',()=>{
 const data=base();data.tournament.ends_at='2026-10-04';
 data.participants=['a','b','c','d','e','f','me'].map(id=>({id,name:id==='me'?'Zed':id.toUpperCase(),eligible_from:'2026-10-01'}));
 const targets=[[6,5,4,3,2,1,7],[1,2,3,4,5,6,7],[6,5,4,3,2,1,7],[6,5,4,1,2,3,0]];
 data.results=[];
 for(const [day,totals] of targets.entries()) totals.forEach((total,i)=>data.results.push(row(data.participants[i].id,`2026-10-0${day+1}`,total-(day?targets[day-1][i]:0))));
 const copy=structuredClone(data),stats=tournamentStatistics(data,'me');
 const pdf=tournamentReport({tournament:{...data.tournament,closed_at:'2026-10-05T12:00:00Z'},participants:data.participants,results:data.results});
 assert.deepEqual(stats.progression.points,pdf.points);assert.deepEqual(stats.progression.ranking,pdf.ranking);
 assert.ok(pdf.rivalries.every(p=>p.a.id!=='me'&&p.b.id!=='me'));
 assert.deepEqual(stats.nemeses.map(p=>[p.id,p.swaps]),[['a',1],['b',1],['c',1],['d',1],['e',1]]);
 assert.deepEqual(tournamentStatistics(data,'organizer').nemeses,[]);
 assert.deepEqual(data,copy);
});

test('Nêmesis counts direct and through-tie inversions only after both players become eligible',()=>{
 const data=base();data.participants=data.participants.slice(0,2);
 const targets=[[100,80],[150,170],[220,220],[300,280]];
 data.results=targets.flatMap((totals,day)=>totals.map((total,i)=>row(i?'a':'me',`2026-10-0${day+1}`,total-(day?targets[day-1][i]:0))));
 assert.deepEqual(tournamentStatistics(data,'me').nemeses,[{id:'a',name:'A',swaps:2}]);
 data.participants[1].eligible_from='2026-10-04';
 assert.deepEqual(tournamentStatistics(data,'me').nemeses,[]);
 data.participants[1].eligible_from='2026-10-01';
 data.results=data.results.filter(r=>r.played_on!=='2026-10-02');
 assert.deepEqual(tournamentStatistics(data,'me').nemeses,[]);
});

test('RF21 empty, nonparticipant organizer, actual zero, missing comparison and a long complete period have distinct semantics',()=>{
 const data=base();let stats=tournamentStatistics(data,'me');assert.equal(stats.ownAverage,null);assert.equal(stats.first,0);
 data.results=[row('me','2026-10-01',0)];stats=tournamentStatistics(data,'organizer');
 assert.equal(stats.participant,false);assert.equal(stats.ownAverage,null);assert.equal(stats.othersAverage,0);assert.equal(stats.first,0);
 stats=tournamentStatistics(data,'me');assert.equal(stats.ownAverage,0);assert.equal(stats.othersAverage,null);
 data.tournament.starts_at='2020-01-01';data.participants[0].eligible_from='2020-01-01';
 data.results=Array.from({length:1201},(_,i)=>row('me',new Date(Date.UTC(2020,0,1+i)).toISOString().slice(0,10),i===1200?2402:1));
 stats=tournamentStatistics(data,'me');assert.equal(stats.ownDays,1201);assert.equal(stats.ownAverage,3602/1201);
});
