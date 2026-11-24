"use client";

import { useId, type ReactNode } from 'react';

export function InfoTip({ label, children, id }: { label: string; children: ReactNode; id?: string }) {
  const generatedId = useId();
  const tipId = id ?? `info-${generatedId}`;
  return <span className="info-tip">
    <button type="button" className="info-tip-trigger" aria-label={`Informações sobre ${label}`} aria-describedby={tipId} aria-expanded={false} popoverTarget={tipId}>
      <span aria-hidden="true">i</span>
    </button>
    <span id={tipId} className="info-tip-popup" role="tooltip" popover="auto" tabIndex={0}>
      <strong className="info-tip-title">{label}</strong><span className="info-tip-copy">{children}</span>
    </span>
  </span>;
}
