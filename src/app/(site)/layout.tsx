import type { ReactNode } from 'react';
import { ScrollProgress } from '@/features/motion/ScrollProgress';
import { SiteFooter } from '@/shared/layout/SiteFooter';
import { SiteHeader } from '@/shared/layout/SiteHeader';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-charcoal focus:px-4 focus:py-3 focus:text-sm focus:text-ivory"
      >
        Saltar al contenido
      </a>
      <ScrollProgress />
      <SiteHeader />
      <main id="contenido" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
