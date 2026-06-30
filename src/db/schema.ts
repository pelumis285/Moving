import { pgTable, serial, text, varchar, timestamp, integer, numeric } from "drizzle-orm/pg-core";

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  loadSize: varchar("load_size", { length: 60 }).notNull(),
  moveDate: varchar("move_date", { length: 40 }).notNull(),
  distanceKm: integer("distance_km").default(0),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }).default("0"),
  finalCost: numeric("final_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  status: varchar("status", { length: 30 }).default("new").notNull(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  confirmationEmailSentAt: timestamp("confirmation_email_sent_at", { withTimezone: true }),
  rescheduleToken: varchar("reschedule_token", { length: 80 }),
  rescheduleTokenExpiresAt: timestamp("reschedule_token_expires_at", { withTimezone: true }),
  lastRescheduledAt: timestamp("last_rescheduled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
