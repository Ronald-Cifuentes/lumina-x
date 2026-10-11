import Link from 'next/link';
import { SiteFooter } from '@/shared/layout/SiteFooter';
import { SiteHeader } from '@/shared/layout/SiteHeader';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="shell flex min-h-[80svh] flex-col justify-center pb-20 pt-36">
        <p className="eyebrow text-bronze-deep">Error 404</p>
        <h1 className="display mt-6 max-w-4xl text-[clamp(2.75rem,6.5vw,6rem)] font-light">
          Esta puerta no lleva a ninguna parte.
        </h1>
        <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted">
          La página o la residencia que buscas no existe o ya no está publicada.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/propiedades"
            className="inline-flex h-12 items-center bg-charcoal px-6 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ivory"
          >
            Ver propiedades
          </Link>
          <Link href="/" className="inline-flex h-12 items-center border border-charcoal px-6 text-[0.75rem] font-semibold uppercase tracking-[0.16em]">
            Volver al inicio
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
