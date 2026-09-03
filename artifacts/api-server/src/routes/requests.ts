import { Router, type IRouter } from "express";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db, requestsTable, listingsTable, officesTable, usersTable } from "@workspace/db";
import {
  ListRequestsResponse,
  CreateRequestBody,
  CreateRequestResponse,
  UpdateRequestParams,
  UpdateRequestBody,
  UpdateRequestResponse,
  ListRequestMatchesParams,
  ListRequestMatchesResponse,
} from "@workspace/api-zod";
import { toListingResponse } from "../lib/serializers";

const router: IRouter = Router();

router.get("/requests", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Office admins see all open requests to respond to; everyone else sees their own.
  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
  const where =
    dbUser?.role === "OFFICE_ADMIN" || dbUser?.role === "PLATFORM_ADMIN"
      ? eq(requestsTable.status, "OPEN")
      : eq(requestsTable.userId, req.user.id);

  const rows = await db.select().from(requestsTable).where(where).orderBy(desc(requestsTable.createdAt));
  res.json(ListRequestsResponse.parse(rows));
});

router.post("/requests", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [request] = await db
    .insert(requestsTable)
    .values({ ...parsed.data, userId: req.user.id })
    .returning();

  res.status(201).json(CreateRequestResponse.parse(request));
});

router.patch("/requests/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = UpdateRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(requestsTable).where(eq(requestsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  if (existing.userId !== req.user.id) {
    res.status(403).json({ error: "You do not have access to this request" });
    return;
  }

  const [request] = await db
    .update(requestsTable)
    .set(parsed.data)
    .where(eq(requestsTable.id, params.data.id))
    .returning();

  res.json(UpdateRequestResponse.parse(request));
});

router.get("/requests/:id/matches", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = ListRequestMatchesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, params.data.id));
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  const conditions = [
    eq(listingsTable.status, "PUBLISHED"),
    eq(listingsTable.propertyType, request.propertyType),
    eq(listingsTable.listingType, request.listingType),
    eq(listingsTable.governorate, request.governorate),
    eq(listingsTable.city, request.city),
  ];
  if (request.budgetMax != null) conditions.push(lte(listingsTable.price, request.budgetMax));
  if (request.budgetMin != null) conditions.push(gte(listingsTable.price, request.budgetMin));
  if (request.sizeMin != null) conditions.push(gte(listingsTable.size, request.sizeMin));
  if (request.roomsMin != null) conditions.push(gte(listingsTable.rooms, request.roomsMin));

  const rows = await db
    .select({ listing: listingsTable, office: officesTable })
    .from(listingsTable)
    .leftJoin(officesTable, eq(listingsTable.officeId, officesTable.id))
    .where(and(...conditions))
    .orderBy(desc(listingsTable.createdAt))
    .limit(20);

  res.json(ListRequestMatchesResponse.parse(rows.map((r) => toListingResponse(r.listing, r.office))));
});

export default router;
