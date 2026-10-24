"use client";

import { useEffect, useSyncExternalStore } from 'react';

function subscribe(notify: () => void) {
  window.addEventListener('geoguaras-theme', notify);
  return () => window.removeEventListener('geoguaras-theme', notify);
}
function currentTheme() { return document.documentElement.dataset.preference ?? 'system'; }
function serverTheme() { return 'system'; }

export function ThemePicker() {
  const theme = useSyncExternalStore(subscribe, currentTheme, serverTheme);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const preference = document.documentElement.dataset.preference ?? 'system';
      document.documentElement.dataset.theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    };
    const sync = (event: StorageEvent) => {
      if (event.key !== 'geoguaras-theme' && event.key !== null) return;
      const next = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : 'system';
      document.documentElement.dataset.preference = next; apply(); window.dispatchEvent(new Event('geoguaras-theme'));
    };
    media.addEventListener('change', apply); window.addEventListener('storage', sync);
    return () => { media.removeEventListener('change', apply); window.removeEventListener('storage', sync); };
  }, []);
  return <div className="theme-toolbar border-b border-slate-200 bg-white px-4 py-2 text-right text-sm">
    <label className="inline-flex items-center gap-2">Tema
      <select aria-label="Tema da aplicação" value={theme} className="rounded border border-slate-300 bg-white px-2 py-1" onChange={event => {
        const next = event.target.value;
        document.documentElement.dataset.preference = next;
        document.documentElement.dataset.theme = next === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : next;
        window.dispatchEvent(new Event('geoguaras-theme'));
        try { localStorage.setItem('geoguaras-theme', next); } catch { /* Preference still works for this tab. */ }
      }}><option value="light">Claro</option><option value="dark">Escuro</option><option value="system">Sistema</option></select>
    </label>
  </div>;
}
