import { CONSENT_VERSION } from '@/features/leads/domain';
import { site } from '@/shared/config/site';
import { pageMetadata } from '@/shared/seo/metadata';
import { PageIntro } from '@/shared/ui/PageIntro';

export const metadata = pageMetadata({
  title: 'Aviso de privacidad',
  description: 'Cómo trata LÚMINA los datos personales que envías en los formularios de este sitio demostrativo.',
  path: '/privacidad',
});

const SECTIONS = [
  {
    title: 'Responsable',
    body: `${site.legalName}, ${site.city}. Contacto para asuntos de datos personales: ${site.email}. Este sitio es un portafolio demostrativo y la marca es ficticia.`,
  },
  {
    title: 'Datos que recogemos',
    body: 'Nombre, correo electrónico, teléfono y el contenido de tu mensaje. En las solicitudes de visita, la fecha y la franja horaria preferidas. En el formulario de propietarios, los datos básicos del inmueble. No pedimos documentos de identidad ni datos financieros en este sitio.',
  },
  {
    title: 'Para qué los usamos',
    body: 'Únicamente para responder la consulta, la solicitud de visita o la asesoría que nos enviaste y para hacer seguimiento a esa misma solicitud. No los vendemos ni los compartimos con terceros con fines comerciales.',
  },
  {
    title: 'Base legal y consentimiento',
    body: 'Tratamos tus datos con tu autorización previa, expresa e informada, que otorgas al marcar la casilla de consentimiento, conforme a la Ley 1581 de 2012 y sus decretos reglamentarios. Registramos la fecha y la versión del aviso que aceptaste.',
  },
  {
    title: 'Tus derechos',
    body: `Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, así como revocar la autorización, escribiendo a ${site.email}. Responderemos dentro de los plazos previstos por la ley.`,
  },
  {
    title: 'Conservación y seguridad',
    body: 'Conservamos las solicitudes mientras sean necesarias para atenderlas. El acceso al panel donde se consultan está protegido con credenciales y sesiones seguras. Los identificadores usados para limitar envíos repetidos se guardan cifrados con una función hash.',
  },
  {
    title: 'Almacenamiento local de favoritos',
    body: 'Las residencias que guardas como favoritas se almacenan solo en tu navegador (localStorage). No se envían a nuestros servidores salvo para mostrarte sus fichas.',
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <PageIntro eyebrow="Legal" title="Aviso de privacidad">
        <p>Versión {CONSENT_VERSION}. Explicamos qué datos pedimos, para qué y cómo puedes ejercer tus derechos.</p>
      </PageIntro>
      <div className="shell py-16 lg:py-24">
        <div className="max-w-3xl space-y-12">
          {SECTIONS.map((section, index) => (
            <section key={section.title} aria-labelledby={`privacidad-${index}`} className="grid gap-4 sm:grid-cols-[4rem_1fr]">
              <span aria-hidden="true" className="display text-[2.25rem] font-light leading-none text-bronze">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h2 id={`privacidad-${index}`} className="font-serif text-[1.75rem] leading-tight">
                  {section.title}
                </h2>
                <p className="mt-3 text-[1rem] leading-relaxed text-ink-muted">{section.body}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
