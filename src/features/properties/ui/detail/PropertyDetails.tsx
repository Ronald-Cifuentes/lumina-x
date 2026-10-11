import { Bath, BedDouble, Car, ChevronDown, Layers, Ruler } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatArea, formatCOP, formatDate, propertyReference } from '@/shared/lib/format';
import { AVAILABILITY_LABELS, type Property, PROPERTY_TYPE_LABELS } from '../../domain';

export function KeyFacts({ property }: { property: Property }) {
  const facts = [
    { icon: Ruler, label: 'Área', value: formatArea(property.areaM2) },
    { icon: BedDouble, label: 'Habitaciones', value: String(property.bedrooms) },
    { icon: Bath, label: 'Baños', value: String(property.bathrooms) },
    { icon: Car, label: 'Parqueaderos', value: property.parking === 0 ? 'Sin parqueadero' : String(property.parking) },
    {
      icon: Layers,
      label: property.floor ? 'Piso' : 'Tipo',
      value: property.floor ? String(property.floor) : PROPERTY_TYPE_LABELS[property.type],
    },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-5" data-testid="key-facts">
      {facts.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-ivory p-4 sm:p-5">
          <dt className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            <Icon aria-hidden="true" className="size-4 text-bronze" strokeWidth={1.5} />
            {label}
          </dt>
          <dd className="mt-2 font-serif text-[1.75rem] leading-none">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Disclosure({ title, children, open = false, testId }: { title: string; children: ReactNode; open?: boolean; testId: string }) {
  return (
    <details open={open} className="group border-t border-line" data-testid={testId}>
      <summary className="flex min-h-16 items-center justify-between gap-4 py-5 font-serif text-[1.75rem] leading-tight">
        {title}
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.4}
          className="size-6 shrink-0 text-bronze transition-transform duration-500 group-open:rotate-180"
        />
      </summary>
      <div className="pb-8">{children}</div>
    </details>
  );
}

export function PropertyDisclosures({ property }: { property: Property }) {
  const rows: [string, string][] = [
    ['Referencia', propertyReference(property.id)],
    ['Tipo de inmueble', PROPERTY_TYPE_LABELS[property.type]],
    ['Distribución', property.layout],
    ['Área privada', formatArea(property.areaM2)],
    ['Estrato', String(property.stratum)],
    ['Piso', property.floor ? String(property.floor) : 'No aplica'],
    ['Canon mensual', formatCOP(property.monthlyRent)],
    ['Administración', property.administrationFee ? `${formatCOP(property.administrationFee)} al mes` : 'No tiene'],
    ['Amoblado', property.furnished ? 'Sí' : 'No'],
    ['Mascotas', property.petsAllowed ? 'Se aceptan' : 'No se aceptan'],
    ['Disponibilidad', AVAILABILITY_LABELS[property.availability]],
    ['Publicado', formatDate(property.publishedAt)],
  ];

  return (
    <div className="border-b border-line">
      <Disclosure title="Características y amenidades" open testId="amenities">
        <ul className="grid gap-x-8 gap-y-3 text-[0.95rem] sm:grid-cols-2">
          {property.amenities.map((amenity) => (
            <li key={amenity} className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-4 bg-bronze" />
              {amenity}
            </li>
          ))}
        </ul>
      </Disclosure>
      <Disclosure title="Información detallada" testId="details">
        <dl className="grid gap-x-10 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-[0.9rem]">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </Disclosure>
    </div>
  );
}
