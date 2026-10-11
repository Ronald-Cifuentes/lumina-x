'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { FavoritesLink } from '@/features/favorites/FavoritesLink';
import { primaryNavigation, site } from '@/shared/config/site';

const mobileLinks = [
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/#ubicaciones', label: 'Ubicaciones' },
  { href: '/favoritos', label: 'Favoritos' },
  { href: '/propietarios', label: 'Propietarios' },
  { href: '/contacto', label: 'Agenda una asesoría' },
] as const;

const isCurrent = (pathname: string, href: string) =>
  href.startsWith('/#') ? false : pathname === href || pathname.startsWith(`${href}/`);

function Logo() {
  return (
    <Link href="/" className="group flex flex-col leading-none" aria-label={`${site.name}, inicio`}>
      <span className="font-serif text-[1.65rem] font-medium tracking-[0.2em]">{site.name}</span>
      <span className="mt-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.24em] text-bronze-deep">
        Portafolio demostrativo
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openMenu = () => dialogRef.current?.showModal();
  const closeMenu = () => dialogRef.current?.close();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="pointer-events-auto mx-auto flex max-w-[92rem] items-center justify-between gap-6 border border-charcoal/10 bg-ivory/85 px-4 py-2.5 shadow-[0_18px_40px_-28px_rgb(32_35_31/0.45)] backdrop-blur-md supports-[backdrop-filter]:bg-ivory/75 sm:px-6">
        <Logo />
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-9 text-[0.8125rem] font-medium tracking-[0.04em]">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                  className="relative py-2 after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-charcoal after:transition-transform after:duration-500 after:ease-[var(--ease-editorial)] hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <FavoritesLink />
          <Link
            href="/contacto"
            className="ml-2 hidden border border-charcoal px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-charcoal hover:text-ivory lg:inline-flex"
          >
            Agenda una asesoría
          </Link>
          <button
            ref={triggerRef}
            type="button"
            onClick={openMenu}
            aria-haspopup="dialog"
            aria-controls="menu-movil"
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-charcoal/5 md:hidden"
          >
            <Menu aria-hidden="true" className="size-5" strokeWidth={1.6} />
            <span className="sr-only">Abrir menú</span>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        id="menu-movil"
        aria-label="Menú"
        onClose={() => triggerRef.current?.focus()}
        className="pointer-events-auto m-0 h-dvh max-h-none w-full max-w-none bg-ivory p-0 text-charcoal opacity-100 transition-[opacity,translate] duration-300 ease-[var(--ease-editorial)] backdrop:bg-charcoal/40 starting:open:translate-y-2 starting:open:opacity-0"
      >
        <div className="flex h-full flex-col px-5 pb-8 pt-5">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong"
            >
              <X aria-hidden="true" className="size-5" strokeWidth={1.6} />
              <span className="sr-only">Cerrar menú</span>
            </button>
          </div>
          <nav aria-label="Menú móvil" className="mt-14 flex-1">
            <ol className="space-y-1">
              {mobileLinks.map((item, index) => (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                    className="flex items-baseline gap-4 py-4 font-serif text-[2.1rem] leading-none"
                  >
                    <span className="font-sans text-xs tabular-nums text-bronze-deep">0{index + 1}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <p className="text-sm leading-relaxed text-ink-muted">
            {site.name} es un portafolio demostrativo. Inmuebles, precios y fotografías son ilustrativos.
          </p>
        </div>
      </dialog>
    </header>
  );
}

