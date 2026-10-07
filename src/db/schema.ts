import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(), // Firebase Auth UID
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  role: text('role').notNull().default('user'), // 'user' | 'admin'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }).defaultNow(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  reason: text('reason').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'), // 'new' | 'read' | 'replied' | 'archived'
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  notifiedAt: timestamp('notified_at', { withTimezone: true }),
  notificationError: text('notification_error'),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const profilesRelations = relations(profiles, ({ many }) => ({
  messages: many(contactMessages),
}));

export const contactMessagesRelations = relations(contactMessages, ({ one }) => ({
  user: one(profiles, {
    fields: [contactMessages.userId],
    references: [profiles.id],
  }),
}));
