export type NotificationTournament = { id: string; name: string; closed_at: string | null };
export type ManagedNotificationTournament = NotificationTournament & {
  corrections_pending: number; audits_requested: number; audits_open: number; audits_ready: number;
};
export type OpenVoting = {
  id: string; tournament_id: string; tournament_name: string; played_on: string;
  deadline: string; can_vote: boolean; has_voted: boolean;
};
export type TournamentNotifications = {
  server_now: string; is_organizer: boolean; pending_days: number;
  request_tournaments: NotificationTournament[]; managed_tournaments: ManagedNotificationTournament[];
  open_votings: OpenVoting[];
};
export function notificationTotals(data: TournamentNotifications) {
  return data.managed_tournaments.reduce((total, t) => ({
    corrections: total.corrections + t.corrections_pending,
    requests: total.requests + t.audits_requested,
    voting: total.voting + t.audits_open,
    ready: total.ready + t.audits_ready,
  }), { corrections: 0, requests: 0, voting: 0, ready: 0 });
}
export function notificationPage(value?: string) {
  return value && /^\d{1,6}$/.test(value) ? Math.min(Number(value), 100000) : 0;
}
