import type { DayResult, Participant } from './tournament.ts';
import { tournamentProgression } from './tournament-progression.ts';
export type { ProgressionPoint as ReportPoint } from './tournament-progression.ts';

export type ReportSnapshot = {
  tournament: { id: string; name: string; starts_at: string; ends_at: string; closed_at: string };
  participants: Participant[];
  results: DayResult[];
};
export function tournamentReport(snapshot: ReportSnapshot) {
  const progression = tournamentProgression(snapshot.participants, snapshot.results, snapshot.tournament);
  return { ...progression, rivalries: progression.rivalries.slice(0, 5) };
}
