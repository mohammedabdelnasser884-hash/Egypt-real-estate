import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { usersTable } from './auth';
import { listingsTable } from './listings';
import { officesTable } from './offices';

export const reportStatusEnum = pgEnum('report_status', ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED']);

export const reportsTable = pgTable('reports', {
  id: varchar('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar('user_id').references(() => usersTable.id),
  listingId: varchar('listing_id').references(() => listingsTable.id),
  officeId: varchar('office_id').references(() => officesTable.id),
  reason: varchar('reason').notNull(),
  details: text('details'),
  status: reportStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
