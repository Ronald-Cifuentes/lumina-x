import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ConversionBand() {
  return (
    <section aria-label="Propietarios y asesoría" className="border-t border-line bg-surface">
      <div className="shell grid lg:grid-cols-2">
        <div className="border-b border-line py-20 lg:border-b-0 lg:border-r lg:py-28 lg:pr-16">
          <p className="eyebrow text-bronze-deep">Propietarios</p>
          <h2 className="display mt-6 text-[clamp(2.2rem,4vw,3.75rem)] font-light">
            ¿Tienes un inmueble que merece ser visto así?
          </h2>
          <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-ink-muted">
            Cuéntanos sobre tu apartamento o tu casa. Revisamos cada solicitud y te contactamos para conocerlo antes de
            publicarlo.
          </p>
          <Link
            href="/propietarios"
            className="group mt-9 inline-flex items-center gap-4 bg-charcoal px-6 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-charcoal-soft"
          >
            Inscribe tu inmueble
            <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="py-20 lg:py-28 lg:pl-16">
          <p className="eyebrow text-bronze-deep">Arrendatarios</p>
          <h2 className="display mt-6 text-[clamp(2.2rem,4vw,3.75rem)] font-light">¿Prefieres que te guiemos?</h2>
          <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-ink-muted">
            Dinos cómo vives, con quién y cuánto quieres invertir. Un asesor te propone una selección corta y agenda las
            visitas contigo.
          </p>
          <Link
            href="/contacto"
            className="group mt-9 inline-flex items-center gap-4 border border-charcoal px-6 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-charcoal hover:text-ivory"
          >
            Agenda una asesoría
            <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
