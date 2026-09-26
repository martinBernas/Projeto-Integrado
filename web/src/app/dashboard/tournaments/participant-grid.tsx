"use client";

import { useActionState, useId, useState, type FormEvent } from 'react';
import { formatDate } from '@/lib/tournament';
import { manageParticipant } from './participant-actions';

export type GridParticipant = { id: string; name: string; email?: string | null; eligible_from?: string };
type GridProps = {
  people: GridParticipant[]; target: string; start: string; end: string;
  mode: 'members' | 'candidates'; closed?: boolean;
};

function ParticipantRow({ person, target, start, end, mode, closed }: Omit<GridProps, 'people'> & { person: GridParticipant }) {
  const [state, action, pending] = useActionState(manageParticipant, {});
  const [day, setDay] = useState(person.eligible_from ?? start);
  const formId = useId();
  const dateChanged = day !== (person.eligible_from ?? start);
  function confirmChange(event: FormEvent<HTMLFormElement>) {
    const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const operation = button?.value ?? (mode === 'candidates' ? 'add' : 'update');
    const message = operation === 'remove'
      ? `Remover ${person.name} deste torneio e recalcular o ranking? As pontuações pessoais serão preservadas.`
      : `${operation === 'add' ? 'Adicionar' : 'Atualizar'} ${person.name}, com participação desde ${formatDate(day)}? O ranking será recalculado, incluindo ausências se o histórico estiver pronto.`;
    if (!window.confirm(message)) event.preventDefault();
  }
  return <tr className="border-t border-slate-200 align-top hover:bg-slate-50">
    <th scope="row" className="px-4 py-3 text-left font-medium">
      <span className="block break-words">{person.name}</span>
      {mode === 'candidates' && <span className="mt-0.5 block break-all text-xs font-normal text-slate-500">{person.email ?? 'Sem e-mail cadastrado'}</span>}
    </th>
    <td className="px-4 py-2.5">{closed ? <span className="inline-block py-1.5 tabular-nums">{formatDate(day)}</span>
      : <input type="date" name="eligible" form={formId} required min={start} max={end} value={day}
        onChange={event => setDay(event.target.value)} disabled={pending} aria-label={`Participa desde — ${person.name}`}
        className="w-40 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:outline-emerald-600 disabled:opacity-50" />}</td>
    <td className="px-4 py-2.5">{closed ? <span className="inline-block py-1.5 text-xs text-slate-500">Encerrado</span>
      : <form id={formId} action={action} onSubmit={confirmChange}>
        <input type="hidden" name="target" value={target} /><input type="hidden" name="player" value={person.id} />
        <input type="hidden" name="confirm" value="yes" />
        <div className="flex items-center gap-2">
          <button name="operation" value={mode === 'candidates' ? 'add' : 'update'} disabled={pending || (mode === 'members' && !dateChanged)}
            aria-label={`${mode === 'candidates' ? 'Adicionar' : 'Salvar data de'} ${person.name}`}
            className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-40">
            {pending ? 'Salvando…' : mode === 'candidates' ? 'Adicionar' : 'Salvar'}
          </button>
          {mode === 'members' && <button name="operation" value="remove" formNoValidate disabled={pending} aria-label={`Remover ${person.name}`}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40">Remover</button>}
        </div>
        <div aria-live="polite" className="max-w-xs text-xs">{state.error && <p role="alert" className="mt-2 text-red-700">{state.error}</p>}{state.message && <p className="mt-2 text-emerald-800">{state.message}</p>}</div>
      </form>}</td>
  </tr>;
}

export function ParticipantGrid({ people, ...props }: GridProps) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table className="w-full min-w-[620px] table-fixed text-left text-sm">
      <caption className="sr-only">{props.mode === 'members' ? 'Participantes atuais' : 'Usuários disponíveis para inclusão'}</caption>
      <thead className="bg-slate-100 text-xs text-slate-600"><tr>
        <th scope="col" className="px-4 py-2.5">{props.mode === 'members' ? 'Participante' : 'Usuário / e-mail'}</th>
        <th scope="col" className="w-48 px-4 py-2.5">Participa desde</th>
        <th scope="col" className="w-52 px-4 py-2.5">Ações</th>
      </tr></thead>
      <tbody>{people.map(person => <ParticipantRow key={`${person.id}-${person.eligible_from ?? ''}`} person={person} {...props} />)}</tbody>
    </table>
  </div>;
}
