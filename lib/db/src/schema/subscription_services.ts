import { pgTable, text, serial, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const subscriptionServicesTable = pgTable("subscription_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  logo: text("logo").notNull(),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  priceMonthly: numeric("price_monthly", { precision: 10, scale: 2 }).notNull(),
  priceAnnual: numeric("price_annual", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  subscriberCount: integer("subscriber_count").notNull().default(0),
  features: text("features").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  isFeatured: boolean("is_featured").notNull().default(false),
  website: text("website"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionServiceSchema = createInsertSchema(subscriptionServicesTable).omit({ id: true, createdAt: true });
export type InsertSubscriptionService = z.infer<typeof insertSubscriptionServiceSchema>;
export type SubscriptionService = typeof subscriptionServicesTable.$inferSelect;
