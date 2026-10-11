import Link from 'next/link';
import { getDatabase } from '@/db/client';
import { setLeadStatusAction } from '@/features/admin/actions';
import { requireAdmin } from '@/features/admin/auth.server';
import { listInquiries, listOwnerSubmissions } from '@/features/admin/repository';
import { INQUIRY_KIND_LABELS, LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadStatus } from '@/features/leads/domain';
import { MUNICIPALITY_LABELS, PROPERTY_TYPE_LABELS } from '@/features/properties/domain';
import { formatCOP, formatDate, formatDateTime } from '@/shared/lib/format';

export const dynamic = 'force-dynamic';

function StatusForm({ id, status, source }: { id: string; status: LeadStatus; source: 'consulta' | 'propietario' }) {
  return (
    <form action={setLeadStatusAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="source" value={source} />
      <label htmlFor={`status-${id}`} className="sr-only">
        Estado
      </label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={status}
        className="select-chevron border border-line-strong bg-surface px-2 py-1.5 pr-7 text-xs"
      >
        {LEAD_STATUSES.map((value) => (
          <option key={value} value={value}>
            {LEAD_STATUS_LABELS[value]}
          </option>
        ))}
      </select>
      <button type="submit" className="border border-charcoal px-2.5 py-1.5 text-xs font-semibold">
        Guardar
      </button>
    </form>
  );
}

export default async function AdminLeadsPage() {
  await requireAdmin();
  const db = getDatabase();
  const [inquiries, owners] = await Promise.all([listInquiries(db), listOwnerSubmissions(db)]);

  return (
    <div className="space-y-16">
      <section aria-labelledby="consultas-title">
        <h1 id="consultas-title" className="display text-[3rem] font-light">
          Solicitudes
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Consultas, solicitudes de visita y asesorías ({inquiries.length}). Las fechas de visita son preferencias por
          confirmar.
        </p>
        {inquiries.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">No hay solicitudes todavía.</p>
        ) : (
          <ul className="mt-6 space-y-4" data-testid="admin-inquiries">
            {inquiries.map((lead) => (
              <li key={lead.id} className="border border-line bg-surface p-5 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow text-bronze-deep">{INQUIRY_KIND_LABELS[lead.kind]}</p>
                    <p className="mt-2 font-semibold">{lead.fullName}</p>
                    <p className="text-ink-muted">
                      {lead.email} · {lead.phone}
                    </p>
                  </div>
                  <StatusForm id={lead.id} status={lead.status} source="consulta" />
                </div>
                {lead.propertySlug && (
                  <p className="mt-3">
                    Inmueble:{' '}
                    <Link href={`/propiedades/${lead.propertySlug}`} className="underline underline-offset-4">
                      {lead.propertyName}
                    </Link>
                  </p>
                )}
                {lead.preferredDate && (
                  <p className="mt-1">
                    Preferencia: {formatDate(lead.preferredDate)}
                    {lead.preferredTime ? ` · ${lead.preferredTime} h` : ''} <span className="text-ink-muted">(sin confirmar)</span>
                  </p>
                )}
                {lead.message && <p className="mt-3 whitespace-pre-line text-ink-muted">{lead.message}</p>}
                <p className="mt-3 text-xs text-ink-muted">Recibida {formatDateTime(lead.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="propietarios-title">
        <h2 id="propietarios-title" className="font-serif text-[2.25rem]">
          Propietarios ({owners.length})
        </h2>
        {owners.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">No hay inmuebles inscritos todavía.</p>
        ) : (
          <ul className="mt-6 space-y-4" data-testid="admin-owners">
            {owners.map((owner) => (
              <li key={owner.id} className="border border-line bg-surface p-5 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow text-bronze-deep">
                      {PROPERTY_TYPE_LABELS[owner.propertyType]} · {owner.neighborhood}, {MUNICIPALITY_LABELS[owner.municipality]}
                    </p>
                    <p className="mt-2 font-semibold">{owner.fullName}</p>
                    <p className="text-ink-muted">
                      {owner.email} · {owner.phone}
                    </p>
                  </div>
                  <StatusForm id={owner.id} status={owner.status} source="propietario" />
                </div>
                <p className="mt-3">
                  {owner.areaM2} m² · {owner.bedrooms} habitaciones · canon esperado {formatCOP(owner.expectedRent)}
                </p>
                {owner.message && <p className="mt-3 whitespace-pre-line text-ink-muted">{owner.message}</p>}
                <p className="mt-3 text-xs text-ink-muted">Recibida {formatDateTime(owner.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
