// Validate a private full JSON export; never print its contents.
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const file = process.argv[2];
if (!file) throw new Error('Informe o caminho privado do JSON exportado.');
let backup;
try { backup = JSON.parse(await readFile(file, 'utf8')); } catch { throw new Error('Exportação JSON inválida ou incompleta.'); }
const sections = ['public.tournaments','public.tournament_rule_versions','public.tournament_participants',
 'public.personal_scores','public.profiles','public.tournament_excluded_dates','public.tournament_score_results',
 'private.score_changes','private.result_changes','private.tournament_changes','private.participant_changes',
 'private.rule_revision_changes','private.profile_changes','private.score_audits','private.audit_electors','private.audit_votes',
 'private.audit_events','private.retroactive_score_changes','private.score_change_decisions','private.tournament_score_inputs','calculated'];
if (backup.id === 'before-gmail-reports-20261024-v1') sections.push('private.tournament_reports','private.tournament_report_deliveries','private.tournament_mail_events');
if (!['before-reports-20261024-v1','before-gmail-reports-20261024-v1'].includes(backup.id) || !backup.as_of || !Array.isArray(backup.function_definitions)
 || !backup.function_definitions.length || Object.keys(backup.snapshot ?? {}).length !== sections.length
 || sections.some(key => !Array.isArray(backup.snapshot[key]))) throw new Error('Estrutura de backup inesperada.');
const db = new PGlite();
try {
 for (const [field, checksum] of [['snapshot','snapshot_md5'],['function_definitions','functions_md5']]) {
  const actual = (await db.query('select md5($1::jsonb::text) checksum',[JSON.stringify(backup[field])])).rows[0].checksum;
  if (actual !== backup[checksum]) throw new Error('Checksum divergente; não prosseguir com a migração.');
 }
 console.log(JSON.stringify({ verified: true, sections: sections.length, definitions: backup.function_definitions.length }));
} finally { await db.close(); }
