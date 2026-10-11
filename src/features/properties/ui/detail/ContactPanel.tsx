'use client';

import { MessageCircle } from 'lucide-react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { PropertyInquiryForm } from '@/features/leads/ui/PropertyInquiryForm';
import { VisitRequestForm } from '@/features/leads/ui/VisitRequestForm';
import { cn } from '@/shared/lib/cn';
import type { Availability } from '../../domain';

type ContactPanelProps = {
  propertyId: string;
  propertyName: string;
  availability: Availability;
  dateBounds: { min: string; max: string };
  whatsappHref: string | null;
};

const TABS = [
  { id: 'consulta', label: 'Consultar' },
  { id: 'visita', label: 'Solicitar visita' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function ContactPanel({ propertyId, propertyName, availability, dateBounds, whatsappHref }: ContactPanelProps) {
  const [tab, setTab] = useState<TabId>('consulta');
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ consulta: null, visita: null });

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next: TabId = event.key === 'Home' ? 'consulta' : event.key === 'End' ? 'visita' : tab === 'consulta' ? 'visita' : 'consulta';
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="contacto-inmueble" aria-labelledby="contacto-inmueble-title" className="scroll-mt-28 border border-line bg-surface p-6 sm:p-8">
      <h2 id="contacto-inmueble-title" className="font-serif text-[2rem] leading-tight">
        ¿Te interesa esta residencia?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">Respondemos en horario hábil. Tus datos solo se usan para esta solicitud.</p>

      <div role="tablist" aria-label="Tipo de solicitud" className="mt-6 grid grid-cols-2 border border-line-strong">
        {TABS.map((item) => (
          <button
            key={item.id}
            ref={(element) => {
              tabRefs.current[item.id] = element;
            }}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            onKeyDown={onKeyDown}
            className={cn(
              'min-h-12 px-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] transition-colors',
              tab === item.id ? 'bg-charcoal text-ivory' : 'hover:bg-ivory-deep',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id="panel-consulta" role="tabpanel" aria-labelledby="tab-consulta" hidden={tab !== 'consulta'} className="pt-6">
        <PropertyInquiryForm propertyId={propertyId} propertyName={propertyName} />
      </div>
      <div id="panel-visita" role="tabpanel" aria-labelledby="tab-visita" hidden={tab !== 'visita'} className="pt-6">
        {availability === 'reservado' ? (
          <p className="border-l-2 border-bronze bg-ivory-deep/60 px-4 py-3 text-sm leading-relaxed">
            Este inmueble está reservado y no admite visitas por ahora. Envíanos una consulta y te avisamos si vuelve a estar
            disponible.
          </p>
        ) : (
          <VisitRequestForm propertyId={propertyId} dateBounds={dateBounds} />
        )}
      </div>

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex min-h-12 items-center justify-center gap-3 border border-sage-deep px-5 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-sage-deep transition-colors hover:bg-sage-deep hover:text-ivory"
          data-testid="whatsapp-cta"
        >
          <MessageCircle aria-hidden="true" className="size-4" strokeWidth={1.6} />
          Escribir por WhatsApp
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
      )}
    </section>
  );
}
