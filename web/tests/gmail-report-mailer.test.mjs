import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGmailReportSender, smtpFailureIsRetryable } from '../src/lib/gmail-report-mailer.ts';
import { processReport, SmtpDeliveryFailure } from '../src/lib/report-processing.ts';

test('Gmail transport sends exactly one PDF recipient, enforces TLS and accepts only explicit success without logging secrets',async()=>{
 let options,message,closed=0;
 const factory=o=>{options=o;return {close:()=>{closed++;},sendMail:async m=>{message=m;return {accepted:['recipient@example.test'],rejected:[],messageId:m.messageId};}};};
 const send=createGmailReportSender({GMAIL_SMTP_USER:'project@gmail.com',GMAIL_SMTP_APP_PASSWORD:'test app password'},factory);
 const job={snapshot:{tournament:{name:'Torneio'}}},delivery={id:'delivery-id',email:'recipient@example.test'};
 assert.equal(await send(job,delivery,Buffer.from('pdf').toString('base64')),'<geoguaras-report.delivery-id@gmail.com>');
 assert.equal(options.host,'smtp.gmail.com');assert.equal(options.port,465);assert.equal(options.secure,true);assert.equal(options.tls.rejectUnauthorized,true);
 assert.equal(options.logger,false);assert.equal(options.debug,false);assert.equal(options.disableUrlAccess,true);assert.equal(options.disableFileAccess,true);
 assert.deepEqual(message.envelope,{from:'project@gmail.com',to:['recipient@example.test']});assert.equal(message.attachments[0].content.toString(),'pdf');assert.equal(closed,1);
 assert.throws(()=>createGmailReportSender({GMAIL_SMTP_USER:'project@gmail.com'}),/not_configured/);
});

test('SMTP ambiguity is not automatically retryable; only rejection/pre-DATA proof qualifies and raw errors are sanitized',async()=>{
 assert.equal(smtpFailureIsRetryable({command:'AUTH PLAIN'}),true);
 assert.equal(smtpFailureIsRetryable({command:'RCPT TO',responseCode:550}),true);
 assert.equal(smtpFailureIsRetryable({command:'DATA',responseCode:550}),true);
 assert.equal(smtpFailureIsRetryable({command:'DATA',code:'ETIMEDOUT'}),false);
 assert.equal(smtpFailureIsRetryable({command:'QUIT',responseCode:421}),false);
 assert.equal(smtpFailureIsRetryable(new Error('unknown')),false);
 const send=createGmailReportSender({GMAIL_SMTP_USER:'project@gmail.com',GMAIL_SMTP_APP_PASSWORD:'test'},()=>({close:()=>{},sendMail:async()=>{throw Object.assign(new Error('private-address-and-password'),{command:'DATA'});}}));
 await assert.rejects(send({snapshot:{tournament:{name:'T'}}},{id:'id',email:'r@test'},'cGRm'),error=>error instanceof SmtpDeliveryFailure&&!error.retryable&&!error.message.includes('private'));
 for(const [info,retryable] of [[{accepted:[],rejected:[],messageId:'id'},false],[{accepted:[],rejected:['r@test'],messageId:'id'},true],[{accepted:['r@test'],rejected:['r@test'],messageId:'id'},false]]) {
  const attempt=createGmailReportSender({GMAIL_SMTP_USER:'project@gmail.com',GMAIL_SMTP_APP_PASSWORD:'test'},()=>({close:()=>{},sendMail:async()=>info}));
  await assert.rejects(attempt({snapshot:{tournament:{name:'T'}}},{id:'id',email:'r@test'},'cGRm'),error=>error instanceof SmtpDeliveryFailure&&error.retryable===retryable);
 }
});

test('worker records safe failure and stops later sends if failure bookkeeping cannot be persisted',async()=>{
 const calls=[];const job={id:'t',token:'token',snapshot:{},pdf:'cGRm',deliveries:[{id:'1',email:'r@test'}]};
 await processReport(async(name,args)=>{calls.push([name,args]);return {data:name==='claim_tournament_report'?job:null,error:null};},async()=>Buffer.from('unused'),async()=>{throw new SmtpDeliveryFailure(true);});
 assert.equal(calls.find(c=>c[0]==='fail_gmail_tournament_delivery')[1].retryable,true);
 assert.equal(calls.at(-1)[0],'release_tournament_report');
 const crashCalls=[];job.deliveries.push({id:'2',email:'other@test'});
 await processReport(async(name,args)=>{crashCalls.push([name,args]);return {data:name==='claim_tournament_report'?job:null,error:name==='fail_gmail_tournament_delivery'?{message:'db down'}:null};},async()=>Buffer.from('unused'),async()=>{throw new SmtpDeliveryFailure(true);});
 assert.equal(crashCalls.filter(c=>c[0]==='begin_gmail_tournament_delivery').length,1);
 assert.equal(crashCalls.at(-1)[0],'release_tournament_report');
});
