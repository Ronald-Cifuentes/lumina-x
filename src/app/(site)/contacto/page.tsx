import { Clock, Mail, MapPin } from 'lucide-react';
import { visitDateBounds } from '@/features/leads/schemas';
import { AdvisoryForm } from '@/features/leads/ui/AdvisoryForm';
import { site } from '@/shared/config/site';
import { pageMetadata } from '@/shared/seo/metadata';
import { PageIntro } from '@/shared/ui/PageIntro';

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
  title: 'Agenda una asesoría',
  description: 'Cuéntanos cómo quieres vivir y un asesor de LÚMINA te propondrá una selección de arriendos en Medellín y el Valle de Aburrá.',
  path: '/contacto',
});

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Contacto" title="Agenda una asesoría">
        <p>
          Dinos qué buscas y cuándo te queda bien una llamada. Un asesor revisa tu solicitud y te propone una selección
          corta antes de programar visitas.
        </p>
      </PageIntro>
      <section className="shell grid gap-16 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <AdvisoryForm dateBounds={visitDateBounds(new Date())} />
        </div>
        <aside className="space-y-10 lg:col-span-4 lg:col-start-9" aria-label="Datos de contacto">
          <div>
            <h2 className="eyebrow text-bronze-deep">Cómo trabajamos</h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-muted">
              La asesoría es una conversación sin costo para entender tu presupuesto, tus tiempos y el tipo de barrio que te
              conviene. La fecha que elijas es una preferencia: confirmamos el horario contigo.
            </p>
          </div>
          <ul className="space-y-5 border-t border-line pt-8 text-[0.95rem]">
            <li className="flex items-start gap-3">
              <Mail aria-hidden="true" className="mt-0.5 size-4 text-bronze" strokeWidth={1.6} />
              <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock aria-hidden="true" className="mt-0.5 size-4 text-bronze" strokeWidth={1.6} />
              {site.hours}
            </li>
            <li className="flex items-start gap-3">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 text-bronze" strokeWidth={1.6} />
              {site.city} · atención virtual y visitas con cita
            </li>
          </ul>
          <p className="border-l-2 border-bronze pl-4 text-xs leading-relaxed text-ink-muted">
            Sitio demostrativo: las solicitudes se guardan en la base de datos local de esta aplicación y nadie las atenderá.
          </p>
        </aside>
      </section>
    </>
  );
}
