import Link from 'next/link';
import { site } from '@/shared/config/site';

const columns = [
  {
    title: 'Explorar',
    links: [
      { href: '/propiedades', label: 'Todas las propiedades' },
      { href: '/propiedades?zona=el-poblado', label: 'El Poblado' },
      { href: '/propiedades?zona=laureles', label: 'Laureles' },
      { href: '/propiedades?zona=envigado', label: 'Envigado' },
      { href: '/propiedades?zona=sabaneta', label: 'Sabaneta' },
    ],
  },
  {
    title: 'Contacto',
    links: [
      { href: '/contacto', label: 'Agenda una asesoría' },
      { href: '/propietarios', label: 'Soy propietario' },
      { href: '/favoritos', label: 'Mis favoritos' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacidad', label: 'Aviso de privacidad' },
      { href: '/creditos', label: 'Créditos fotográficos' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="on-dark bg-charcoal text-ivory">
      <div className="shell pb-10 pt-20 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="display text-[clamp(2.4rem,5vw,4.25rem)] font-light">
              Vivir bien empieza por <em className="text-bronze-light">elegir dónde.</em>
            </p>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-ivory/70">
              {site.tagline}. {site.hours}.
            </p>
            <a href={`mailto:${site.email}`} className="mt-4 inline-block text-sm underline decoration-bronze-light underline-offset-4">
              {site.email}
            </a>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="eyebrow text-bronze-light">{column.title}</h2>
                <ul className="mt-5 space-y-3 text-sm text-ivory/80">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link prefetch={false} href={link.href} className="transition-colors hover:text-ivory">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-ivory/15 pt-8 text-xs leading-relaxed text-ivory/60">
          <p className="max-w-3xl" data-testid="demo-disclaimer">
            <strong className="font-semibold text-ivory/85">Portafolio demostrativo.</strong> {site.name} es una marca
            ficticia. Los inmuebles, direcciones, precios, disponibilidad y descripciones de este sitio son ilustrativos y no
            constituyen una oferta real. Las fotografías provienen de Unsplash y no corresponden a los inmuebles descritos.
          </p>
          <p className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <span>© 2026 {site.legalName}</span>
            <span className="font-serif text-lg tracking-[0.3em] text-ivory/80">{site.name}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
