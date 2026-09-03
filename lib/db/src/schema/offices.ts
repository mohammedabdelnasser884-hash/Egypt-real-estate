import { sql } from 'drizzle-orm';
import { doublePrecision, integer, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

export const verifiedStatusEnum = pgEnum('verified_status', ['VERIFIED', 'PENDING', 'UNVERIFIED']);

export const officesTable = pgTable('offices', {
  id: varchar('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar('name').notNull(),
  slug: varchar('slug').notNull().unique(),
  logoUrl: varchar('logo_url'),
  phone: varchar('phone').notNull(),
  whatsapp: varchar('whatsapp'),
  email: varchar('email'),
  website: varchar('website'),
  address: text('address'),
  governorate: varchar('governorate').notNull(),
  city: varchar('city').notNull(),
  yearsOfExperience: integer('years_of_experience'),
  responseSpeed: varchar('response_speed'),
  ratingAvg: doublePrecision('rating_avg'),
  verifiedStatus: verifiedStatusEnum('verified_status').notNull().default('UNVERIFIED'),
  dealsCount: integer('deals_count').notNull().default(0),
  activeListingsCount: integer('active_listings_count').notNull().default(0),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertOfficeSchema = createInsertSchema(officesTable).omit({
  id: true,
  dealsCount: true,
  activeListingsCount: true,
  ratingAvg: true,
  verifiedStatus: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOffice = z.infer<typeof insertOfficeSchema>;
export type Office = typeof officesTable.$inferSelect;
