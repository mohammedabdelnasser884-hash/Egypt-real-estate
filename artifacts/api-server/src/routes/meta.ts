import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, favoritesTable, requestsTable, savedSearchesTable, notificationsTable, listingsTable, officesTable } from "@workspace/db";
import {
  ListTrendingAreasQueryParams,
  ListTrendingAreasResponse,
  ListGovernoratesResponse,
  GetDashboardSummaryResponse,
} from "@workspace/api-zod";
import { toListingResponse } from "../lib/serializers";

const router: IRouter = Router();

// Static reference data: Egypt's governorates and their major cities.
const GOVERNORATES = [
  { name: "القاهرة", cities: ["مدينة نصر", "المعادي", "التجمع الخامس", "مصر الجديدة", "الزمالك", "المقطم"] },
  { name: "الجيزة", cities: ["6 أكتوبر", "الشيخ زايد", "الحصري", "الدقي", "المهندسين", "فيصل"] },
  { name: "الإسكندرية", cities: ["سيدي بشر", "سموحة", "المنتزه", "برج العرب", "العجمي"] },
  { name: "الساحل الشمالي", cities: ["مراسي", "مارينا", "الساحل الشمالي الجديد"] },
  { name: "البحر الأحمر", cities: ["الغردقة", "مرسى علم", "سهل حشيش"] },
  { name: "جنوب سيناء", cities: ["شرم الشيخ", "دهب", "طابا"] },
  { name: "القليوبية", cities: ["بنها", "شبرا الخيمة", "القناطر الخيرية"] },
  { name: "الدقهلية", cities: ["المنصورة", "طلخا"] },
];

router.get("/governorates", async (_req, res): Promise<void> => {
  res.json(ListGovernoratesResponse.parse(GOVERNORATES));
});

router.get("/areas/trending", async (req, res): Promise<void> => {
  const parsed = ListTrendingAreasQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db
    .select({
      governorate: listingsTable.governorate,
      city: listingsTable.city,
      area: listingsTable.area,
      listingsCount: sql<number>`count(*)::int`,
      averagePrice: sql<number | null>`avg(${listingsTable.price})`,
    })
    .from(listingsTable)
    .where(and(eq(listingsTable.status, "PUBLISHED"), sql`${listingsTable.area} is not null`))
    .groupBy(listingsTable.governorate, listingsTable.city, listingsTable.area)
    .orderBy(desc(sql`count(*)`))
    .limit(parsed.data.limit);

  res.json(
    ListTrendingAreasResponse.parse(
      rows.map((r) => ({
        governorate: r.governorate,
        city: r.city,
        area: r.area as string,
        listingsCount: r.listingsCount,
        averagePrice: r.averagePrice != null ? Number(r.averagePrice) : null,
      })),
    ),
  );
});

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;

  const [[favCount], [reqCount], [searchCount], [unreadCount], recentFavRows, recentNotifs] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(favoritesTable).where(eq(favoritesTable.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(requestsTable)
      .where(and(eq(requestsTable.userId, userId), eq(requestsTable.status, "OPEN"))),
    db.select({ count: sql<number>`count(*)::int` }).from(savedSearchesTable).where(eq(savedSearchesTable.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false))),
    db
      .select({ listing: listingsTable, office: officesTable })
      .from(favoritesTable)
      .innerJoin(listingsTable, eq(favoritesTable.listingId, listingsTable.id))
      .leftJoin(officesTable, eq(listingsTable.officeId, officesTable.id))
      .where(eq(favoritesTable.userId, userId))
      .orderBy(desc(favoritesTable.createdAt))
      .limit(5),
    db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(5),
  ]);

  res.json(
    GetDashboardSummaryResponse.parse({
      favoritesCount: favCount.count,
      activeRequestsCount: reqCount.count,
      savedSearchesCount: searchCount.count,
      unreadNotificationsCount: unreadCount.count,
      recentFavorites: recentFavRows.map((r) => toListingResponse(r.listing, r.office)),
      recentNotifications: recentNotifs,
    }),
  );
});

export default router;
