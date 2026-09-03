import { sql } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { officesTable, verifiedStatusEnum } from './offices';
import { usersTable } from './auth';

export const listingTypeEnum = pgEnum('listing_type', ['SALE', 'RENT']);
export const propertyTypeEnum = pgEnum('property_type', [
  'APARTMENT',
  'VILLA',
  'DUPLEX',
  'PENTHOUSE',
  'STUDIO',
  'TOWNHOUSE',
  'CHALET',
  'LAND',
  'OFFICE',
  'SHOP',
  'WAREHOUSE',
]);
export const finishingEnum = pgEnum('finishing', [
  'SUPER_LUX',
  'LUX',
  'SEMI_FINISHED',
  'CORE_AND_SHELL',
  'UNFINISHED',
]);
export const priceStatusEnum = pgEnum('price_status', ['FIXED', 'NEGOTIABLE', 'REDUCED']);
export const listingStatusEnum = pgEnum('listing_status', [
  'DRAFT',
  'PUBLISHED',
  'UNPUBLISHED',
  'SOLD',
  'RENTED',
]);

export const listingsTable = pgTable('listings', {
  id: varchar('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar('title').notNull(),
  slug: varchar('slug').notNull().unique(),
  description: text('description'),
  price: doublePrecision('price').notNull(),
  currency: varchar('currency').notNull().default('EGP'),
  propertyType: propertyTypeEnum('property_type').notNull(),
  listingType: listingTypeEnum('listing_type').notNull(),
  governorate: varchar('governorate').notNull(),
  city: varchar('city').notNull(),
  area: varchar('area'),
  neighborhood: varchar('neighborhood'),
  street: varchar('street'),
  size: doublePrecision('size'),
  rooms: integer('rooms'),
  bathrooms: integer('bathrooms'),
  finishing: finishingEnum('finishing'),
  floor: varchar('floor'),
  hasElevator: boolean('has_elevator').notNull().default(false),
  hasGarage: boolean('has_garage').notNull().default(false),
  hasGarden: boolean('has_garden').notNull().default(false),
  hasPool: boolean('has_pool').notNull().default(false),
  furnished: boolean('furnished').notNull().default(false),
  installmentAvailable: boolean('installment_available').notNull().default(false),
  immediateDelivery: boolean('immediate_delivery').notNull().default(false),
  kitchen: varchar('kitchen'),
  orientation: varchar('orientation'),
  constructionYear: integer('construction_year'),
  images: text('images').array().notNull().default(sql`'{}'::text[]`),
  videoUrl: varchar('video_url'),
  mapLat: doublePrecision('map_lat'),
  mapLng: doublePrecision('map_lng'),
  officeId: varchar('office_id').references(() => officesTable.id),
  ownerId: varchar('owner_id').references(() => usersTable.id),
  verifiedStatus: verifiedStatusEnum('verified_status').notNull().default('PENDING'),
  priceStatus: priceStatusEnum('price_status').notNull().default('FIXED'),
  status: listingStatusEnum('status').notNull().default('PUBLISHED'),
  viewsCount: integer('views_count').notNull().default(0),
  favoritesCount: integer('favorites_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  id: true,
  slug: true,
  officeId: true,
  ownerId: true,
  verifiedStatus: true,
  viewsCount: true,
  favoritesCount: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
