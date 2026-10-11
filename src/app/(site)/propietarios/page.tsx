import { OwnerForm } from '@/features/leads/ui/OwnerForm';
import { pageMetadata } from '@/shared/seo/metadata';
import { PageIntro } from '@/shared/ui/PageIntro';

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
  title: 'Inscribe tu inmueble',
  description: 'Propietarios: cuéntanos sobre tu apartamento, casa, apartaestudio o loft en Medellín, Envigado, Sabaneta o Itagüí.',
  path: '/propietarios',
});

const STEPS = [
  { title: 'Revisión', text: 'Leemos la información y te llamamos para resolver dudas y conocer el inmueble.' },
  { title: 'Visita técnica', text: 'Recorremos el espacio, revisamos su estado y acordamos el canon de salida.' },
  { title: 'Ficha editorial', text: 'Fotografía, planos y una descripción honesta que explique cómo se vive allí.' },
] as const;

export default function OwnersPage() {
  return (
    <>
      <PageIntro eyebrow="Propietarios" title="Tu inmueble, contado con cuidado">
        <p>
          Trabajamos con pocos inmuebles a la vez para presentarlos bien. Envíanos los datos básicos y te contactaremos para
          conocerlo.
        </p>
      </PageIntro>
      <section className="shell grid gap-16 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <OwnerForm />
        </div>
        <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="propietarios-pasos">
          <h2 id="propietarios-pasos" className="eyebrow text-bronze-deep">
            Qué sigue después
          </h2>
          <ol className="mt-6 space-y-8">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-5 border-t border-line pt-5">
                <span aria-hidden="true" className="display text-[2.5rem] font-light leading-none text-bronze">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-serif text-[1.5rem] leading-tight">{step.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10 border-l-2 border-bronze pl-4 text-xs leading-relaxed text-ink-muted">
            Sitio demostrativo: la información se guarda en la base de datos local de esta aplicación para su revisión en el
            panel de administración.
          </p>
        </aside>
      </section>
    </>
  );
}
