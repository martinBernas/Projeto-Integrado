import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tournamentStatistics, statisticsScore } from '../src/lib/tournament-statistics.ts';

const base=()=>({access:true,today:'2026-10-18',tournament:{id:'t',name:'Test',starts_at:'2026-10-01',ends_at:'2026-10-31'},
 participants:[{id:'me',eligible_from:'2026-10-01'},{id:'a',eligible_from:'2026-10-01'},{id:'b',eligible_from:'2026-10-02'}],excluded_dates:[],results:[]});
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
