import { asc, count, desc, eq } from 'drizzle-orm';
import type { Database } from '@/db/client';
import { inquiries, ownerSubmissions, properties } from '@/db/schema';
import { buildSearchText } from '@/db/seed/build';
import type { LeadStatus } from '@/features/leads/domain';
import type { Availability } from '@/features/properties/domain';
import { toProperty } from '@/features/properties/server/queries';
import type { PropertyUpdate } from './schemas';

export const listAdminProperties = (db: Database) =>
  db
    .select({
      id: properties.id,
      slug: properties.slug,
      name: properties.name,
      type: properties.type,
      zone: properties.zone,
      neighborhood: properties.neighborhood,
      monthlyRent: properties.monthlyRent,
      availability: properties.availability,
      featured: properties.featured,
      published: properties.published,
      updatedAt: properties.updatedAt,
    })
    .from(properties)
    .orderBy(asc(properties.id));

export const findAdminProperty = async (db: Database, id: string) => {
  const [row] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return row ? toProperty(row) : null;
};

export const updateAdminProperty = async (db: Database, id: string, update: PropertyUpdate, now = new Date()) => {
  const [current] = await db
    .select({ neighborhood: properties.neighborhood, zone: properties.zone, type: properties.type })
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);
  if (!current) return false;
  await db
    .update(properties)
    .set({
      ...update,
      searchText: buildSearchText({ ...current, name: update.name }),
      updatedAt: now,
    })
    .where(eq(properties.id, id));
  return true;
};

export const setPropertyAvailability = (db: Database, id: string, availability: Availability, now = new Date()) =>
  db.update(properties).set({ availability, updatedAt: now }).where(eq(properties.id, id));

export const setPropertyFlag = (
  db: Database,
  id: string,
  flag: 'featured' | 'published',
  value: boolean,
  now = new Date(),
) => db.update(properties).set({ [flag]: value, updatedAt: now }).where(eq(properties.id, id));

export const listInquiries = (db: Database, limit = 200) =>
  db
    .select({
      id: inquiries.id,
      kind: inquiries.kind,
      fullName: inquiries.fullName,
      email: inquiries.email,
      phone: inquiries.phone,
      message: inquiries.message,
      preferredDate: inquiries.preferredDate,
      preferredTime: inquiries.preferredTime,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
      propertyName: properties.name,
      propertySlug: properties.slug,
    })
    .from(inquiries)
    .leftJoin(properties, eq(inquiries.propertyId, properties.id))
    .orderBy(desc(inquiries.createdAt))
    .limit(limit);

export const listOwnerSubmissions = (db: Database, limit = 200) =>
  db.select().from(ownerSubmissions).orderBy(desc(ownerSubmissions.createdAt)).limit(limit);

export const setInquiryStatus = (db: Database, id: string, status: LeadStatus) =>
  db.update(inquiries).set({ status }).where(eq(inquiries.id, id));

export const setOwnerSubmissionStatus = (db: Database, id: string, status: LeadStatus) =>
  db.update(ownerSubmissions).set({ status }).where(eq(ownerSubmissions.id, id));

export const getDashboardStats = async (db: Database) => {
  const [byAvailability, inquiryStatus, ownerStatus] = await Promise.all([
    db
      .select({ availability: properties.availability, total: count() })
      .from(properties)
      .groupBy(properties.availability),
    db.select({ status: inquiries.status, total: count() }).from(inquiries).groupBy(inquiries.status),
    db.select({ status: ownerSubmissions.status, total: count() }).from(ownerSubmissions).groupBy(ownerSubmissions.status),
  ]);
  const sum = (rows: { total: number }[]) => rows.reduce((total, row) => total + row.total, 0);
  return {
    properties: sum(byAvailability),
    byAvailability: Object.fromEntries(byAvailability.map((row) => [row.availability, row.total])) as Partial<
      Record<Availability, number>
    >,
    inquiries: sum(inquiryStatus),
    newInquiries: inquiryStatus.find((row) => row.status === 'nuevo')?.total ?? 0,
    ownerSubmissions: sum(ownerStatus),
    newOwnerSubmissions: ownerStatus.find((row) => row.status === 'nuevo')?.total ?? 0,
  };
};
