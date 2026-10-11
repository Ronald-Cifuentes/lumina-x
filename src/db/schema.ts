import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  AVAILABILITY,
  MUNICIPALITIES,
  PROPERTY_TYPES,
  type PropertyImage,
  ZONES,
} from '../features/properties/domain';
import { INQUIRY_KINDS, LEAD_STATUSES } from '../features/leads/domain';

const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date());

export const properties = sqliteTable(
  'properties',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    type: text('type', { enum: PROPERTY_TYPES }).notNull(),
    municipality: text('municipality', { enum: MUNICIPALITIES }).notNull(),
    zone: text('zone', { enum: ZONES }).notNull(),
    neighborhood: text('neighborhood').notNull(),
    layout: text('layout').notNull(),
    areaM2: integer('area_m2').notNull(),
    bedrooms: integer('bedrooms').notNull(),
    bathrooms: integer('bathrooms').notNull(),
    parking: integer('parking').notNull(),
    stratum: integer('stratum').notNull(),
    floor: integer('floor'),
    monthlyRent: integer('monthly_rent').notNull(),
    administrationFee: integer('administration_fee'),
    furnished: integer('furnished', { mode: 'boolean' }).notNull(),
    petsAllowed: integer('pets_allowed', { mode: 'boolean' }).notNull(),
    availability: text('availability', { enum: AVAILABILITY }).notNull(),
    amenities: text('amenities', { mode: 'json' }).$type<string[]>().notNull(),
    images: text('images', { mode: 'json' }).$type<PropertyImage[]>().notNull(),
    summary: text('summary').notNull(),
    description: text('description').notNull(),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    published: integer('published', { mode: 'boolean' }).notNull().default(true),
    searchText: text('search_text').notNull(),
    publishedAt: text('published_at').notNull(),
    createdAt: createdAt(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('properties_zone_idx').on(table.zone),
    index('properties_type_idx').on(table.type),
    index('properties_rent_idx').on(table.monthlyRent),
    index('properties_published_at_idx').on(table.publishedAt),
  ],
);

export const inquiries = sqliteTable(
  'inquiries',
  {
    id: text('id').primaryKey(),
    kind: text('kind', { enum: INQUIRY_KINDS }).notNull(),
    propertyId: text('property_id').references(() => properties.id, { onDelete: 'set null' }),
    fullName: text('full_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    message: text('message'),
    preferredDate: text('preferred_date'),
    preferredTime: text('preferred_time'),
    status: text('status', { enum: LEAD_STATUSES }).notNull().default('nuevo'),
    consentAt: integer('consent_at', { mode: 'timestamp_ms' }).notNull(),
    consentVersion: text('consent_version').notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index('inquiries_created_at_idx').on(table.createdAt),
    index('inquiries_property_idx').on(table.propertyId),
  ],
);

export const ownerSubmissions = sqliteTable(
  'owner_submissions',
  {
    id: text('id').primaryKey(),
    fullName: text('full_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    propertyType: text('property_type', { enum: PROPERTY_TYPES }).notNull(),
    municipality: text('municipality', { enum: MUNICIPALITIES }).notNull(),
    neighborhood: text('neighborhood').notNull(),
    areaM2: integer('area_m2').notNull(),
    bedrooms: integer('bedrooms').notNull(),
    expectedRent: integer('expected_rent').notNull(),
    message: text('message'),
    status: text('status', { enum: LEAD_STATUSES }).notNull().default('nuevo'),
    consentAt: integer('consent_at', { mode: 'timestamp_ms' }).notNull(),
    consentVersion: text('consent_version').notNull(),
    createdAt: createdAt(),
  },
  (table) => [index('owner_submissions_created_at_idx').on(table.createdAt)],
);

export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  windowStartedAt: integer('window_started_at').notNull(),
});

export const adminSessions = sqliteTable(
  'admin_sessions',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [index('admin_sessions_expires_at_idx').on(table.expiresAt)],
);

export type PropertyRow = typeof properties.$inferSelect;
export type NewPropertyRow = typeof properties.$inferInsert;
export type InquiryRow = typeof inquiries.$inferSelect;
export type OwnerSubmissionRow = typeof ownerSubmissions.$inferSelect;
