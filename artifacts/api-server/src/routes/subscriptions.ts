import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  subscriptionServicesTable,
  categoriesTable,
  userSubscriptionsTable,
} from "@workspace/db";
import { eq, and, gte, lte, ilike, sql, or } from "drizzle-orm";
import {
  ListSubscriptionsQueryParams,
  CreateSubscriptionBody,
  GetSubscriptionParams,
  CreateUserSubscriptionBody,
  CancelUserSubscriptionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/subscriptions", async (req, res) => {
  try {
    const query = ListSubscriptionsQueryParams.parse(req.query);

    let conditions: ReturnType<typeof eq>[] = [];

    if (query.category) {
      const cat = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.slug, query.category))
        .limit(1);
      if (cat.length > 0) {
        conditions.push(eq(subscriptionServicesTable.categoryId, cat[0].id));
      }
    }

    const services = await db
      .select({
        id: subscriptionServicesTable.id,
        name: subscriptionServicesTable.name,
        description: subscriptionServicesTable.description,
        logo: subscriptionServicesTable.logo,
        categoryId: subscriptionServicesTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        priceMonthly: subscriptionServicesTable.priceMonthly,
        priceAnnual: subscriptionServicesTable.priceAnnual,
        currency: subscriptionServicesTable.currency,
        rating: subscriptionServicesTable.rating,
        reviewCount: subscriptionServicesTable.reviewCount,
        subscriberCount: subscriptionServicesTable.subscriberCount,
        features: subscriptionServicesTable.features,
        tags: subscriptionServicesTable.tags,
        isFeatured: subscriptionServicesTable.isFeatured,
        website: subscriptionServicesTable.website,
        createdAt: subscriptionServicesTable.createdAt,
      })
      .from(subscriptionServicesTable)
      .innerJoin(categoriesTable, eq(subscriptionServicesTable.categoryId, categoriesTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    let filtered = services;

    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(
        (svc) =>
          svc.name.toLowerCase().includes(s) ||
          svc.description.toLowerCase().includes(s) ||
          svc.tags.some((t) => t.toLowerCase().includes(s))
      );
    }

    if (query.minPrice !== undefined) {
      filtered = filtered.filter((svc) => Number(svc.priceMonthly) >= query.minPrice!);
    }
    if (query.maxPrice !== undefined) {
      filtered = filtered.filter((svc) => Number(svc.priceMonthly) <= query.maxPrice!);
    }

    if (query.sortBy === "price") {
      filtered.sort((a, b) => Number(a.priceMonthly) - Number(b.priceMonthly));
    } else if (query.sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (query.sortBy === "rating") {
      filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (query.sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const result = filtered.map((svc) => ({
      ...svc,
      priceMonthly: Number(svc.priceMonthly),
      priceAnnual: svc.priceAnnual ? Number(svc.priceAnnual) : null,
      rating: Number(svc.rating),
      createdAt: svc.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: String(err) });
  }
});

router.post("/subscriptions", async (req, res) => {
  try {
    const body = CreateSubscriptionBody.parse(req.body);
    const [service] = await db
      .insert(subscriptionServicesTable)
      .values({
        name: body.name,
        description: body.description,
        logo: body.logo,
        categoryId: body.categoryId,
        priceMonthly: String(body.priceMonthly),
        priceAnnual: body.priceAnnual ? String(body.priceAnnual) : null,
        currency: body.currency,
        features: body.features,
        tags: body.tags,
        website: body.website ?? null,
      })
      .returning();

    await db
      .update(categoriesTable)
      .set({ serviceCount: sql`${categoriesTable.serviceCount} + 1` })
      .where(eq(categoriesTable.id, service.categoryId));

    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, service.categoryId));

    res.status(201).json({
      ...service,
      categoryName: cat.name,
      categorySlug: cat.slug,
      priceMonthly: Number(service.priceMonthly),
      priceAnnual: service.priceAnnual ? Number(service.priceAnnual) : null,
      rating: Number(service.rating),
      createdAt: service.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: String(err) });
  }
});

router.get("/subscriptions/:id", async (req, res) => {
  try {
    const { id } = GetSubscriptionParams.parse({ id: Number(req.params.id) });
    const [service] = await db
      .select({
        id: subscriptionServicesTable.id,
        name: subscriptionServicesTable.name,
        description: subscriptionServicesTable.description,
        logo: subscriptionServicesTable.logo,
        categoryId: subscriptionServicesTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        priceMonthly: subscriptionServicesTable.priceMonthly,
        priceAnnual: subscriptionServicesTable.priceAnnual,
        currency: subscriptionServicesTable.currency,
        rating: subscriptionServicesTable.rating,
        reviewCount: subscriptionServicesTable.reviewCount,
        subscriberCount: subscriptionServicesTable.subscriberCount,
        features: subscriptionServicesTable.features,
        tags: subscriptionServicesTable.tags,
        isFeatured: subscriptionServicesTable.isFeatured,
        website: subscriptionServicesTable.website,
        createdAt: subscriptionServicesTable.createdAt,
      })
      .from(subscriptionServicesTable)
      .innerJoin(categoriesTable, eq(subscriptionServicesTable.categoryId, categoriesTable.id))
      .where(eq(subscriptionServicesTable.id, id));

    if (!service) {
      return res.status(404).json({ error: "Not found", message: "Subscription service not found" });
    }

    res.json({
      ...service,
      priceMonthly: Number(service.priceMonthly),
      priceAnnual: service.priceAnnual ? Number(service.priceAnnual) : null,
      rating: Number(service.rating),
      createdAt: service.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: String(err) });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error", message: String(err) });
  }
});

router.get("/user-subscriptions", async (_req, res) => {
  try {
    const userSubs = await db
      .select({
        id: userSubscriptionsTable.id,
        serviceId: userSubscriptionsTable.serviceId,
        serviceName: subscriptionServicesTable.name,
        serviceLogo: subscriptionServicesTable.logo,
        planType: userSubscriptionsTable.planType,
        price: userSubscriptionsTable.price,
        currency: userSubscriptionsTable.currency,
        status: userSubscriptionsTable.status,
        startedAt: userSubscriptionsTable.startedAt,
        renewsAt: userSubscriptionsTable.renewsAt,
        cancelledAt: userSubscriptionsTable.cancelledAt,
        categoryName: categoriesTable.name,
      })
      .from(userSubscriptionsTable)
      .innerJoin(subscriptionServicesTable, eq(userSubscriptionsTable.serviceId, subscriptionServicesTable.id))
      .innerJoin(categoriesTable, eq(subscriptionServicesTable.categoryId, categoriesTable.id))
      .orderBy(userSubscriptionsTable.startedAt);

    res.json(
      userSubs.map((s) => ({
        ...s,
        price: Number(s.price),
        startedAt: s.startedAt.toISOString(),
        renewsAt: s.renewsAt ? s.renewsAt.toISOString() : null,
        cancelledAt: s.cancelledAt ? s.cancelledAt.toISOString() : null,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Server error", message: String(err) });
  }
});

router.post("/user-subscriptions", async (req, res) => {
  try {
    const body = CreateUserSubscriptionBody.parse(req.body);

    const [service] = await db
      .select()
      .from(subscriptionServicesTable)
      .where(eq(subscriptionServicesTable.id, body.serviceId));

    if (!service) {
      return res.status(404).json({ error: "Not found", message: "Subscription service not found" });
    }

    const price = body.planType === "annual" && service.priceAnnual
      ? Number(service.priceAnnual)
      : Number(service.priceMonthly);

    const now = new Date();
    const renewsAt = new Date(now);
    if (body.planType === "annual") {
      renewsAt.setFullYear(renewsAt.getFullYear() + 1);
    } else {
      renewsAt.setMonth(renewsAt.getMonth() + 1);
    }

    const [userSub] = await db
      .insert(userSubscriptionsTable)
      .values({
        serviceId: body.serviceId,
        planType: body.planType,
        price: String(price),
        currency: service.currency,
        status: "active",
        renewsAt,
      })
      .returning();

    await db
      .update(subscriptionServicesTable)
      .set({ subscriberCount: sql`${subscriptionServicesTable.subscriberCount} + 1` })
      .where(eq(subscriptionServicesTable.id, body.serviceId));

    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, service.categoryId));

    res.status(201).json({
      ...userSub,
      serviceName: service.name,
      serviceLogo: service.logo,
      categoryName: cat.name,
      price: Number(userSub.price),
      startedAt: userSub.startedAt.toISOString(),
      renewsAt: userSub.renewsAt ? userSub.renewsAt.toISOString() : null,
      cancelledAt: null,
    });
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: String(err) });
  }
});

router.delete("/user-subscriptions/:id", async (req, res) => {
  try {
    const { id } = CancelUserSubscriptionParams.parse({ id: Number(req.params.id) });

    const [existing] = await db
      .select()
      .from(userSubscriptionsTable)
      .where(eq(userSubscriptionsTable.id, id));

    if (!existing) {
      return res.status(404).json({ error: "Not found", message: "Subscription not found" });
    }

    const [cancelled] = await db
      .update(userSubscriptionsTable)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(eq(userSubscriptionsTable.id, id))
      .returning();

    await db
      .update(subscriptionServicesTable)
      .set({ subscriberCount: sql`GREATEST(${subscriptionServicesTable.subscriberCount} - 1, 0)` })
      .where(eq(subscriptionServicesTable.id, existing.serviceId));

    const [service] = await db
      .select()
      .from(subscriptionServicesTable)
      .where(eq(subscriptionServicesTable.id, existing.serviceId));

    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, service.categoryId));

    res.json({
      ...cancelled,
      serviceName: service.name,
      serviceLogo: service.logo,
      categoryName: cat.name,
      price: Number(cancelled.price),
      startedAt: cancelled.startedAt.toISOString(),
      renewsAt: cancelled.renewsAt ? cancelled.renewsAt.toISOString() : null,
      cancelledAt: cancelled.cancelledAt ? cancelled.cancelledAt.toISOString() : null,
    });
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: String(err) });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const [serviceCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptionServicesTable);
    const [categoryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(categoriesTable);
    const [subscriberSum] = await db
      .select({ total: sql<number>`coalesce(sum(subscriber_count), 0)` })
      .from(subscriptionServicesTable);
    const [avgRating] = await db
      .select({ avg: sql<number>`coalesce(avg(rating), 0)` })
      .from(subscriptionServicesTable);

    res.json({
      totalServices: Number(serviceCount.count),
      totalCategories: Number(categoryCount.count),
      totalSubscribers: Number(subscriberSum.total),
      avgRating: Math.round(Number(avgRating.avg) * 10) / 10,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: String(err) });
  }
});

export default router;
