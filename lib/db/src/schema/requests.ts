import { sql } from 'drizzle-orm';
import { doublePrecision, integer, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { usersTable } from './auth';
import { listingTypeEnum, propertyTypeEnum } from './listings';

export const requestStatusEnum = pgEnum('request_status', ['OPEN', 'MATCHED', 'CLOSED']);

export const requestsTable = pgTable('requests', {
  id: varchar('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar('user_id')
    .notNull()
    .references(() => usersTable.id),
  title: varchar('title').notNull(),
  propertyType: propertyTypeEnum('property_type').notNull(),
  listingType: listingTypeEnum('listing_type').notNull(),
  governorate: varchar('governorate').notNull(),
  city: varchar('city').notNull(),
  neighborhood: varchar('neighborhood'),
  budgetMin: doublePrecision('budget_min'),
  budgetMax: doublePrecision('budget_max'),
  sizeMin: doublePrecision('size_min'),
  roomsMin: integer('rooms_min'),
  notes: text('notes'),
  status: requestStatusEnum('status').notNull().default('OPEN'),
  matchedCount: integer('matched_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertRequestSchema = createInsertSchema(requestsTable).omit({
  id: true,
  userId: true,
  status: true,
  matchedCount: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type PropertyRequest = typeof requestsTable.$inferSelect;
