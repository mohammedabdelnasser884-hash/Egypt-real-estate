import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { db, listingsTable, officesTable, usersTable } from "@workspace/db";
import {
  ListListingsQueryParams,
  ListListingsResponse,
  CreateListingBody,
  CreateListingResponse,
  ListFeaturedListingsQueryParams,
  ListFeaturedListingsResponse,
  ListDailyFeedListingsQueryParams,
  ListDailyFeedListingsResponse,
  GetListingParams,
  GetListingResponse,
  UpdateListingParams,
  UpdateListingBody,
  UpdateListingResponse,
  DeleteListingParams,
  ListSimilarListingsParams,
  ListSimilarListingsResponse,
} from "@workspace/api-zod";
import { slugify } from "../lib/slugify";
import { toListingResponse } from "../lib/serializers";

const router: IRouter = Router();

router.get("/listings", async (req, res): Promise<void> => {
  const parsed = ListListingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const q = parsed.data;

  const conditions = [eq(listingsTable.status, "PUBLISHED")];
  if (q.search) conditions.push(ilike(listingsTable.title, `%${q.search}%`));
  if (q.governorate) conditions.push(eq(listingsTable.governorate, q.governorate));
  if (q.city) conditions.push(eq(listingsTable.city, q.city));
  if (q.area) conditions.push(eq(listingsTable.area, q.area));
  if (q.propertyType) conditions.push(eq(listingsTable.propertyType, q.propertyType));
  if (q.listingType) conditions.push(eq(listingsTable.listingType, q.listingType));
  if (q.priceMin != null) conditions.push(gte(listingsTable.price, q.priceMin));
  if (q.priceMax != null) conditions.push(lte(listingsTable.price, q.priceMax));
  if (q.roomsMin != null) conditions.push(gte(listingsTable.rooms, q.roomsMin));
  if (q.bathroomsMin != null) conditions.push(gte(listingsTable.bathrooms, q.bathroomsMin));
  if (q.sizeMin != null) conditions.push(gte(listingsTable.size, q.sizeMin));
  if (q.furnished != null) conditions.push(eq(listingsTable.furnished, q.furnished));
  if (q.installmentAvailable != null)
    conditions.push(eq(listingsTable.installmentAvailable, q.installmentAvailable));
  if (q.immediateDelivery != null)
    conditions.push(eq(listingsTable.immediateDelivery, q.immediateDelivery));
  if (q.verifiedOnly) conditions.push(eq(listingsTable.verifiedStatus, "VERIFIED"));
  if (q.officeId) conditions.push(eq(listingsTable.officeId, q.officeId));
  if (q.ownerId) conditions.push(eq(listingsTable.ownerId, q.ownerId));

  const orderBy =
    q.sort === "price_asc"
      ? asc(listingsTable.price)
      : q.sort === "price_desc"
        ? desc(listingsTable.price)
        : q.sort === "size_desc"
          ? desc(listingsTable.size)
          : desc(listingsTable.createdAt);

  const where = and(...conditions);

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({ listing: listingsTable, office: officesTable })
      .from(listingsTable)
      .leftJoin(officesTable, eq(listingsTable.officeId, officesTable.id))
      .where(where)
      .orderBy(orderBy)
      .limit(q.pageSize)
      .offset((q.page - 1) * q.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(listingsTable).where(where),
  ]);

  res.json(
    ListListingsResponse.parse({
      items: rows.map((r) => toListingResponse(r.listing, r.office)),
      total: count,
      page: q.page,
      pageSize: q.pageSize,
    }),
  );
});

router.get("/listings/featured", async (req, res): Promise<void> => {
  const parsed = ListFeaturedListingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db
    .select({ listing: listingsTable, office: officesTable })
    .from(listingsTable)
    .leftJoin(officesTable, eq(listingsTable.officeId, officesTable.id))
    .where(and(eq(listingsTable.status, "PUBLISHED"), eq(listingsTable.verifiedStatus, "VERIFIED")))
    .orderBy(desc(listingsTable.favoritesCount), desc(listingsTable.createdAt))
    .limit(parsed.data.limit);

  res.json(ListFeaturedListingsResponse.parse(rows.map((r) => toListingResponse(r.listing, r.office))));
});

router.get("/listings/daily-feed", async (req, res): Promise<void> => {
  const parsed = ListDailyFeedListingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db
    .select({ listing: listingsTable, office: officesTable })
    .from(listingsTable)
    .leftJoin(officesTable, eq(listingsTable.officeId, officesTable.id))
    .where(eq(listingsTable.status, "PUBLISHED"))
    .orderBy(desc(listingsTable.createdAt))
    .limit(parsed.data.limit);

  res.json(ListDailyFeedListingsResponse.parse(rows.map((r) => toListingResponse(r.listing, r.office))));
});

router.post("/listings", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
  if (!dbUser || (dbUser.role !== "OFFICE_ADMIN" && dbUser.role !== "PLATFORM_ADMIN")) {
    res.status(403).json({ error: "Only office admins can create listings" });
    return;
  }
  if (!dbUser.officeId) {
    res.status(400).json({ error: "Create an office profile before publishing listings" });
    return;
  }

  const duplicate = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.officeId, dbUser.officeId),
        ilike(listingsTable.title, parsed.data.title),
        eq(listingsTable.price, parsed.data.price),
      ),
    )
    .limit(1);
  if (duplicate.length > 0) {
    res.status(409).json({ error: "A very similar listing already exists" });
    return;
  }

  const [listing] = await db
    .insert(listingsTable)
    .values({
      ...parsed.data,
      slug: slugify(parsed.data.title),
      officeId: dbUser.officeId,
      ownerId: dbUser.id,
    })
    .returning();

  res.status(201).json(CreateListingResponse.parse(toListingResponse(listing, null)));
});

router.get("/listings/:id", async (req, res): Promise<void> => {
  const params = GetListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({ listing: listingsTable, office: officesTable })
    .from(listingsTable)
    .leftJoin(officesTable, eq(listingsTable.officeId, officesTable.id))
    .where(eq(listingsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  await db
    .update(listingsTable)
    .set({ viewsCount: row.listing.viewsCount + 1 })
    .where(eq(listingsTable.id, params.data.id));

  res.json(GetListingResponse.parse(toListingResponse({ ...row.listing, viewsCount: row.listing.viewsCount + 1 }, row.office)));
});

router.patch("/listings/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = UpdateListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
  const isOwner = dbUser?.officeId && dbUser.officeId === existing.officeId;
  if (!dbUser || (!isOwner && dbUser.role !== "PLATFORM_ADMIN")) {
    res.status(403).json({ error: "You do not have access to this listing" });
    return;
  }

  const [listing] = await db
    .update(listingsTable)
    .set(parsed.data)
    .where(eq(listingsTable.id, params.data.id))
    .returning();

  const office = listing.officeId
    ? (await db.select().from(officesTable).where(eq(officesTable.id, listing.officeId)))[0]
    : null;

  res.json(UpdateListingResponse.parse(toListingResponse(listing, office)));
});

router.delete("/listings/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeleteListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
  const isOwner = dbUser?.officeId && dbUser.officeId === existing.officeId;
  if (!dbUser || (!isOwner && dbUser.role !== "PLATFORM_ADMIN")) {
    res.status(403).json({ error: "You do not have access to this listing" });
    return;
  }

  await db.delete(listingsTable).where(eq(listingsTable.id, params.data.id));
  res.status(204).send();
});

router.get("/listings/:id/similar", async (req, res): Promise<void> => {
  const params = ListSimilarListingsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const rows = await db
    .select({ listing: listingsTable, office: officesTable })
    .from(listingsTable)
    .leftJoin(officesTable, eq(listingsTable.officeId, officesTable.id))
    .where(
      and(
        eq(listingsTable.status, "PUBLISHED"),
        eq(listingsTable.propertyType, existing.propertyType),
        eq(listingsTable.city, existing.city),
        sql`${listingsTable.id} != ${existing.id}`,
        gte(listingsTable.price, existing.price * 0.7),
        lte(listingsTable.price, existing.price * 1.3),
      ),
    )
    .orderBy(desc(listingsTable.createdAt))
    .limit(6);

  res.json(ListSimilarListingsResponse.parse(rows.map((r) => toListingResponse(r.listing, r.office))));
});

export default router;
