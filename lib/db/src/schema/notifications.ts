import { sql } from 'drizzle-orm';
import { boolean, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from './auth';

export const notificationTypeEnum = pgEnum('notification_type', [
  'NEW_MATCH',
  'PRICE_DROP',
  'SAVED_SEARCH_ALERT',
  'SYSTEM',
  'REPORT_UPDATE',
]);

export const notificationsTable = pgTable('notifications', {
  id: varchar('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar('user_id')
    .notNull()
    .references(() => usersTable.id),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
export type InsertNotification = typeof notificationsTable.$inferInsert;
