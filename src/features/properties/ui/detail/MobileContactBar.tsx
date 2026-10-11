import { MessageCircle } from 'lucide-react';
import { formatCOP } from '@/shared/lib/format';

/** Keeps the main contact action reachable on small screens without covering the content. */
export function MobileContactBar({ monthlyRent, whatsappHref }: { monthlyRent: number; whatsappHref: string | null }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
      data-testid="mobile-contact-bar"
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <p className="min-w-0 flex-1 leading-tight">
          <span className="block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-muted">Canon mensual</span>
          <span className="text-base font-semibold">{formatCOP(monthlyRent)}</span>
        </p>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-12 items-center justify-center border border-sage-deep text-sage-deep"
          >
            <MessageCircle aria-hidden="true" className="size-5" strokeWidth={1.6} />
            <span className="sr-only">Escribir por WhatsApp (se abre en una pestaña nueva)</span>
          </a>
        )}
        <a
          href="#contacto-inmueble"
          className="inline-flex h-12 items-center bg-charcoal px-5 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ivory"
        >
          Consultar
        </a>
      </div>
    </div>
  );
}
