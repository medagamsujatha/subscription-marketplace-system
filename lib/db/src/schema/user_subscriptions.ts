import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { subscriptionServicesTable } from "./subscription_services";

export const userSubscriptionsTable = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => subscriptionServicesTable.id),
  planType: text("plan_type", { enum: ["monthly", "annual"] }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status", { enum: ["active", "cancelled", "paused"] }).notNull().default("active"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  renewsAt: timestamp("renews_at"),
  cancelledAt: timestamp("cancelled_at"),
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptionsTable).omit({ id: true, startedAt: true, cancelledAt: true });
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptionsTable.$inferSelect;
