import { pgTable, serial, text, varchar, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";

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
  fragileItems: integer("fragile_items").default(0).notNull(),
  heavyItems: integer("heavy_items").default(0).notNull(),
  stairFlights: integer("stair_flights").default(0).notNull(),
  elevatorAccess: boolean("elevator_access").default(false).notNull(),
  packingHelp: boolean("packing_help").default(false).notNull(),
  assemblyHelp: boolean("assembly_help").default(false).notNull(),
  longCarry: varchar("long_carry", { length: 20 }).default("standard").notNull(),
  buildingType: varchar("building_type", { length: 30 }).default("house-ground").notNull(),
  carryFloor: integer("carry_floor").default(0).notNull(),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }).default("0"),
  finalCost: numeric("final_cost", { precision: 10, scale: 2 }),
  targetBudget: numeric("target_budget", { precision: 10, scale: 2 }),
  negotiationNotes: text("negotiation_notes"),
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

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  location: varchar("location", { length: 160 }),
  rating: integer("rating").notNull(),
  review: text("review").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  adminNotes: text("admin_notes"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
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
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
