import Link from 'next/link';
import { getDatabase } from '@/db/client';
import { requireAdmin } from '@/features/admin/auth.server';
import { getDashboardStats, listInquiries } from '@/features/admin/repository';
import { INQUIRY_KIND_LABELS, LEAD_STATUS_LABELS } from '@/features/leads/domain';
import { AVAILABILITY_LABELS, AVAILABILITY } from '@/features/properties/domain';
import { formatDateTime } from '@/shared/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdmin();
  const db = getDatabase();
  const [stats, recent] = await Promise.all([getDashboardStats(db), listInquiries(db, 6)]);

  const tiles = [
    { label: 'Propiedades', value: stats.properties, detail: AVAILABILITY.map((key) => `${AVAILABILITY_LABELS[key]}: ${stats.byAvailability[key] ?? 0}`).join(' · ') },
    { label: 'Consultas y visitas', value: stats.inquiries, detail: `${stats.newInquiries} nuevas` },
    { label: 'Propietarios', value: stats.ownerSubmissions, detail: `${stats.newOwnerSubmissions} nuevas` },
  ];

  return (
    <div>
      <h1 className="display text-[3rem] font-light">Resumen</h1>
      <dl className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="bg-surface p-6">
            <dt className="eyebrow text-ink-muted">{tile.label}</dt>
            <dd className="mt-3 font-serif text-[3rem] leading-none" data-testid={`stat-${tile.label}`}>
              {tile.value}
            </dd>
            <dd className="mt-3 text-xs text-ink-muted">{tile.detail}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-12" aria-labelledby="recientes">
        <div className="flex items-baseline justify-between">
          <h2 id="recientes" className="font-serif text-[2rem]">
            Últimas solicitudes
          </h2>
          <Link href="/admin/solicitudes" className="text-sm underline underline-offset-4">
            Ver todas
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">Todavía no hay solicitudes.</p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {recent.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4 text-sm">
                <span>
                  <strong className="font-semibold">{lead.fullName}</strong> · {INQUIRY_KIND_LABELS[lead.kind]}
                  {lead.propertyName ? ` · ${lead.propertyName}` : ''}
                </span>
                <span className="text-ink-muted">
                  {LEAD_STATUS_LABELS[lead.status]} · {formatDateTime(lead.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
