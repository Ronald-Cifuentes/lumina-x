import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDatabase } from '@/db/client';
import { requireAdmin } from '@/features/admin/auth.server';
import { findAdminProperty } from '@/features/admin/repository';
import { propertyIdSchema } from '@/features/admin/schemas';
import { PropertyEditForm } from '@/features/admin/ui/PropertyEditForm';
import { ZONE_LABELS } from '@/features/properties/domain';
import { propertyReference } from '@/shared/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminPropertyEditPage({ params }: PageProps<'/admin/propiedades/[id]'>) {
  await requireAdmin();
  const { id } = await params;
  const parsed = propertyIdSchema.safeParse(id);
  if (!parsed.success) notFound();
  const property = await findAdminProperty(getDatabase(), parsed.data);
  if (!property) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/propiedades" className="text-sm underline underline-offset-4">
        ← Propiedades
      </Link>
      <p className="eyebrow mt-8 text-bronze-deep">
        {propertyReference(property.id)} · {ZONE_LABELS[property.zone]} · {property.neighborhood}
      </p>
      <h1 className="display mt-3 text-[2.75rem] font-light">{property.name}</h1>
      {property.published && (
        <Link href={`/propiedades/${property.slug}`} className="mt-2 inline-block text-sm text-bronze-deep underline underline-offset-4">
          Ver ficha pública
        </Link>
      )}
      <div className="mt-10">
        <PropertyEditForm property={property} />
      </div>
    </div>
  );
}
