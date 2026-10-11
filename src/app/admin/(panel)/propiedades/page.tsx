import Link from 'next/link';
import { getDatabase } from '@/db/client';
import { setAvailabilityAction, toggleFlagAction } from '@/features/admin/actions';
import { requireAdmin } from '@/features/admin/auth.server';
import { listAdminProperties } from '@/features/admin/repository';
import { AVAILABILITY, AVAILABILITY_LABELS, ZONE_LABELS } from '@/features/properties/domain';
import { formatCOP, propertyReference } from '@/shared/lib/format';

export const dynamic = 'force-dynamic';

function FlagToggle({ id, flag, value, label }: { id: string; flag: 'featured' | 'published'; value: boolean; label: string }) {
  return (
    <form action={toggleFlagAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="flag" value={flag} />
      <input type="hidden" name="value" value={String(!value)} />
      <button
        type="submit"
        aria-pressed={value}
        className="min-w-16 border border-line-strong px-2.5 py-1.5 text-xs aria-pressed:bg-charcoal aria-pressed:text-ivory"
      >
        {value ? 'Sí' : 'No'}
        <span className="sr-only"> · cambiar {label}</span>
      </button>
    </form>
  );
}

export default async function AdminPropertiesPage() {
  await requireAdmin();
  const rows = await listAdminProperties(getDatabase());

  return (
    <div>
      <h1 className="display text-[3rem] font-light">Propiedades</h1>
      <p className="mt-2 text-sm text-ink-muted">{rows.length} registros. Los cambios se reflejan de inmediato en el sitio público.</p>
      <div className="mt-8 overflow-x-auto border border-line bg-surface">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <caption className="sr-only">Listado de propiedades</caption>
          <thead className="border-b border-line text-[0.6875rem] uppercase tracking-[0.14em] text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Ref.</th>
              <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
              <th scope="col" className="px-4 py-3 font-semibold">Zona</th>
              <th scope="col" className="px-4 py-3 font-semibold">Canon</th>
              <th scope="col" className="px-4 py-3 font-semibold">Disponibilidad</th>
              <th scope="col" className="px-4 py-3 font-semibold">Destacada</th>
              <th scope="col" className="px-4 py-3 font-semibold">Publicada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} data-testid={`admin-row-${row.slug}`}>
                <td className="px-4 py-3 text-xs text-ink-muted">{propertyReference(row.id)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/propiedades/${row.id}`} className="font-medium underline-offset-4 hover:underline">
                    {row.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{ZONE_LABELS[row.zone]}</td>
                <td className="px-4 py-3 tabular-nums">{formatCOP(row.monthlyRent)}</td>
                <td className="px-4 py-3">
                  <form action={setAvailabilityAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={row.id} />
                    <label htmlFor={`availability-${row.id}`} className="sr-only">
                      Disponibilidad de {row.name}
                    </label>
                    <select
                      id={`availability-${row.id}`}
                      name="availability"
                      defaultValue={row.availability}
                      className="select-chevron border border-line-strong bg-surface px-2 py-1.5 pr-7 text-xs"
                    >
                      {AVAILABILITY.map((value) => (
                        <option key={value} value={value}>
                          {AVAILABILITY_LABELS[value]}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="border border-charcoal px-2.5 py-1.5 text-xs font-semibold">
                      Guardar
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <FlagToggle id={row.id} flag="featured" value={row.featured} label="destacada" />
                </td>
                <td className="px-4 py-3">
                  <FlagToggle id={row.id} flag="published" value={row.published} label="publicada" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
