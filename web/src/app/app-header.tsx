"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemePicker } from './theme-picker';

const items = [
  ['/dashboard', 'Painel'],
  ['/dashboard/statistics', 'Estatísticas'],
  ['/dashboard/tournaments', 'Torneios'],
  ['/dashboard/requests', 'Meus pedidos'],
  ['/dashboard/profile', 'Perfil'],
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const dashboard = pathname.startsWith('/dashboard');
  return <>
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/" className="brand" aria-label="GeoGuaras — início">
          <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 40" fill="none"><path d="M16 38S2 24 2 16a14 14 0 1 1 28 0c0 8-14 22-14 22Z" fill="currentColor"/><circle cx="16" cy="16" r="6" fill="#21183e"/></svg></span>
          <span>Geo<span className="brand-accent">Guaras</span></span>
        </Link>
        {dashboard ? <nav className="app-nav" aria-label="Navegação principal">{items.map(([href, label]) => {
          const active = href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined}>{label}</Link>;
        })}</nav> : <span className="header-tagline">Cada rodada conta.</span>}
        <div className="header-tools"><ThemePicker />{!dashboard && <Link className="header-login" href="/auth/login">Entrar</Link>}</div>
      </div>
    </header>
  </>;
}
