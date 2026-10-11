import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/features/admin/auth.server';
import { LoginForm } from '@/features/admin/ui/LoginForm';
import { isAdminConfigured } from '@/shared/config/env.server';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({ searchParams }: PageProps<'/admin/login'>) {
  if (await getAdminSession()) redirect('/admin');
  const { next } = await searchParams;
  const nextPath = typeof next === 'string' && next.startsWith('/admin') ? next : '/admin';

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="font-serif text-3xl tracking-[0.2em]">
          LÚMINA
        </Link>
        <h1 className="display mt-10 text-[3rem] font-light">Administración</h1>
        <p className="mt-3 text-sm text-ink-muted">Acceso restringido. Las credenciales se configuran en variables de entorno.</p>
        <div className="mt-10 border border-line bg-surface p-7">
          {isAdminConfigured() ? (
            <LoginForm next={nextPath} />
          ) : (
            <div role="alert" className="text-sm leading-relaxed" data-testid="admin-disabled">
              <p className="font-semibold">La administración está deshabilitada.</p>
              <p className="mt-2 text-ink-muted">
                Define <code>ADMIN_EMAIL</code> y <code>ADMIN_PASSWORD_HASH</code> (genera el hash con{' '}
                <code>pnpm admin:hash</code>) y reinicia el servidor.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
