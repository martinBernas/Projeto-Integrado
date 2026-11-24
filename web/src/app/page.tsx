import Link from "next/link";

export default function Home() {
  return <main className="home-page">
    <section className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow">A comunidade que joga junto</p>
        <h1>O mundo é grande.<br /><span>A disputa é nossa.</span></h1>
        <p className="hero-description">Cada palpite vira história. Registre suas pontuações do GeoGuessr, acompanhe sua evolução e entre na disputa com a comunidade GeoGuaras.</p>
        <div className="hero-actions"><Link href="/auth/login" className="primary-action">Entrar na disputa</Link><Link href="/dashboard" className="secondary-action">Abrir meu painel</Link></div>
        <p className="hero-note">Seu histórico pessoal. Seus torneios. Tudo no mesmo lugar.</p>
      </div>
      <div className="world-art" aria-hidden="true">
        <div className="world-orbit orbit-one" /><div className="world-orbit orbit-two" />
        <svg className="world-globe" viewBox="0 0 440 440" fill="none">
          <defs><radialGradient id="ocean" cx=".3" cy=".25" r=".8"><stop stopColor="#6862ae"/><stop offset="1" stopColor="#29234f"/></radialGradient><clipPath id="globe-clip"><circle cx="220" cy="220" r="176"/></clipPath></defs>
          <circle cx="220" cy="220" r="176" fill="url(#ocean)" stroke="#9b8cd1" strokeWidth="2"/>
          <g clipPath="url(#globe-clip)" stroke="#b7a4ed" strokeOpacity=".23"><ellipse cx="220" cy="220" rx="74" ry="176"/><ellipse cx="220" cy="220" rx="140" ry="176"/><ellipse cx="220" cy="220" rx="176" ry="58"/><ellipse cx="220" cy="220" rx="176" ry="121"/><path d="M44 220h352M220 44v352"/></g>
          <g clipPath="url(#globe-clip)" fill="#a3bf94" stroke="#c9d9aa" strokeWidth="2" strokeLinejoin="round"><path d="m80 132 35-32 43-7 35 26-8 32-25 8-3 29-25 10-19-27-25-6Z"/><path d="m155 205 35 13 21 38-18 37-4 31-22 34-16-44 5-38-23-39Z"/><path d="m245 111 28-18 23 21 36-5 42 31-17 22-37-3-14 23-26-9-20-29-23-5Z"/><path d="m244 173 43 6 28 37-19 27-13 42-27-8-18-42-16-29Z"/><path d="m329 292 29-11 29 23-4 26-29 4-26-17Z"/></g>
          <path d="M128 180Q216 38 309 158" stroke="#d9f881" strokeWidth="3" strokeDasharray="6 8"/>
          <g transform="translate(112 142)"><path d="M16 45S0 29 0 16a16 16 0 1 1 32 0c0 13-16 29-16 29Z" fill="#ed806c"/><circle cx="16" cy="16" r="6" fill="#fff0dd"/></g>
          <g transform="translate(293 119)"><path d="M16 45S0 29 0 16a16 16 0 1 1 32 0c0 13-16 29-16 29Z" fill="#d9f881"/><circle cx="16" cy="16" r="6" fill="#29234f"/></g>
        </svg>
        <div className="world-caption"><span className="caption-icon">◎</span><div><strong>Um novo dia. Uma nova rodada.</strong><span>Seu próximo resultado começa aqui.</span></div></div>
      </div>
    </section>
    <section className="home-features" aria-labelledby="features-title">
      <div className="section-intro"><div><p className="eyebrow">Muito além do palpite</p><h2 id="features-title">Seu jogo, em perspectiva.</h2></div><p>Acompanhe cada resultado e celebre a evolução.</p></div>
      <div className="feature-grid">{[
        ['◎', 'Seu ritmo', 'Cada ponto conta.', 'Registre seus resultados diários e mantenha seu histórico pessoal, dentro e fora dos torneios.', 'feature-green'],
        ['♜', 'Sua comunidade', 'A disputa ganha vida.', 'Acompanhe os rankings e os resultados de cada rodada dos torneios de que você participa.', 'feature-purple'],
        ['↗', 'Sua evolução', 'Enxergue mais longe.', 'Explore suas estatísticas, acompanhe a progressão e descubra quem disputa posição com você.', 'feature-coral'],
      ].map(([icon, label, title, description, color]) => <article key={label} className={`feature-card ${color}`}><span className="feature-icon" aria-hidden="true">{icon}</span><p className="eyebrow">{label}</p><h3>{title}</h3><p>{description}</p></article>)}</div>
    </section>
    <section className="home-callout"><div><p className="eyebrow">Nos vemos no ranking</p><h2>Pronto para a próxima rodada?</h2></div><Link className="primary-action" href="/auth/login">Criar conta ou entrar</Link></section>
  </main>;
}
