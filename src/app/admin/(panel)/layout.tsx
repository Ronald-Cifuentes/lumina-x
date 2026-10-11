import { ExternalLink, Inbox, LayoutDashboard, LogOut, Building2 } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { logoutAction } from '@/features/admin/actions';
import { requireAdmin } from '@/features/admin/auth.server';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { href: '/admin/propiedades', label: 'Propiedades', icon: Building2 },
  { href: '/admin/solicitudes', label: 'Solicitudes', icon: Inbox },
] as const;

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-surface px-5 py-6 lg:border-b-0 lg:border-r">
        <Link href="/admin" className="font-serif text-2xl tracking-[0.2em]">
          LÚMINA
        </Link>
        <p className="eyebrow mt-1 text-bronze-deep">Administración</p>
        <nav aria-label="Administración" className="mt-8">
          <ul className="flex flex-wrap gap-1 lg:flex-col">
            {NAV.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-ivory-deep">
                  <Icon aria-hidden="true" className="size-4 text-bronze" strokeWidth={1.6} />
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-ivory-deep">
                <ExternalLink aria-hidden="true" className="size-4 text-bronze" strokeWidth={1.6} />
                Ver sitio
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-8 border-t border-line pt-5 text-xs text-ink-muted">
          <p className="truncate" data-testid="admin-session-email">
            {session.email}
          </p>
          <form action={logoutAction} className="mt-3">
            <button type="submit" className="inline-flex items-center gap-2 font-semibold text-charcoal underline underline-offset-4">
              <LogOut aria-hidden="true" className="size-3.5" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main id="contenido" className="min-w-0 px-5 py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
