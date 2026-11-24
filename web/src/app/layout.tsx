import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from './app-header';
import { InfoTipController } from './info-tip-controller';

export const metadata: Metadata = {
  title: "GeoGuaras",
  description: "Pontuações pessoais e torneios de GeoGuessr.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head><script dangerouslySetInnerHTML={{ __html: `(function(){var p='system';try{var s=localStorage.getItem('geoguaras-theme');if(s==='light'||s==='dark')p=s}catch(e){}var d=document.documentElement;d.dataset.preference=p;d.dataset.theme=p==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p})()` }} /></head>
      <body className="min-h-full flex flex-col"><InfoTipController /><AppHeader /><div id="main-content" tabIndex={-1} className="app-content">{children}</div><footer className="app-footer"><span className="font-bold">GeoGuaras</span><span>Pontuações, torneios e boas disputas.</span><span>Projeto independente da comunidade. Sem afiliação ao GeoGuessr.</span></footer></body>
    </html>
  );
}
