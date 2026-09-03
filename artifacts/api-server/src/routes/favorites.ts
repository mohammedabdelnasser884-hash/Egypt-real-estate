import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, favoritesTable, listingsTable, officesTable } from "@workspace/db";
import { ListFavoritesResponse, CreateFavoriteBody, CreateFavoriteResponse, DeleteFavoriteParams } from "@workspace/api-zod";
import { toListingResponse } from "../lib/serializers";

const router: IRouter = Router();

router.get("/favorites", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rows = await db
    .select({ favorite: favoritesTable, listing: listingsTable, office: officesTable })
    .from(favoritesTable)
    .innerJoin(listingsTable, eq(favoritesTable.listingId, listingsTable.id))
    .leftJoin(officesTable, eq(listingsTable.officeId, officesTable.id))
    .where(eq(favoritesTable.userId, req.user.id))
    .orderBy(desc(favoritesTable.createdAt));

  res.json(
    ListFavoritesResponse.parse(
      rows.map((r) => ({
        id: r.favorite.id,
        userId: r.favorite.userId,
        listingId: r.favorite.listingId,
        listing: toListingResponse(r.listing, r.office),
        createdAt: r.favorite.createdAt,
      })),
    ),
  );
});

router.post("/favorites", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateFavoriteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, parsed.data.listingId));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const existing = await db
    .select()
    .from(favoritesTable)
    .where(and(eq(favoritesTable.userId, req.user.id), eq(favoritesTable.listingId, parsed.data.listingId)));
  if (existing.length > 0) {
    res.status(409).json({ error: "Already favorited" });
    return;
  }

  const [favorite] = await db
    .insert(favoritesTable)
    .values({ userId: req.user.id, listingId: parsed.data.listingId })
    .returning();

  await db
    .update(listingsTable)
    .set({ favoritesCount: listing.favoritesCount + 1 })
    .where(eq(listingsTable.id, listing.id));

  const office = listing.officeId
    ? (await db.select().from(officesTable).where(eq(officesTable.id, listing.officeId)))[0]
    : null;

  res.status(201).json(
    CreateFavoriteResponse.parse({
      id: favorite.id,
      userId: favorite.userId,
      listingId: favorite.listingId,
      listing: toListingResponse(listing, office),
      createdAt: favorite.createdAt,
    }),
  );
});

router.delete("/favorites/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeleteFavoriteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(favoritesTable).where(eq(favoritesTable.id, params.data.id));
  if (!existing || existing.userId !== req.user.id) {
    res.status(404).json({ error: "Favorite not found" });
    return;
  }

  await db.delete(favoritesTable).where(eq(favoritesTable.id, params.data.id));

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, existing.listingId));
  if (listing) {
    await db
      .update(listingsTable)
      .set({ favoritesCount: Math.max(0, listing.favoritesCount - 1) })
      .where(eq(listingsTable.id, listing.id));
  }

  res.status(204).send();
});

export default router;
