import { Router, type IRouter } from "express";
import { desc, eq, inArray } from "drizzle-orm";
import { db, comparisonsTable, listingsTable, officesTable } from "@workspace/db";
import {
  ListComparisonsResponse,
  CreateComparisonBody,
  CreateComparisonResponse,
  DeleteComparisonParams,
} from "@workspace/api-zod";
import { toListingResponse } from "../lib/serializers";

const router: IRouter = Router();

async function hydrateComparisons(rows: (typeof comparisonsTable.$inferSelect)[]) {
  const allListingIds = [...new Set(rows.flatMap((r) => r.listingIds))];
  const listingRows = allListingIds.length
    ? await db
        .select({ listing: listingsTable, office: officesTable })
        .from(listingsTable)
        .leftJoin(officesTable, eq(listingsTable.officeId, officesTable.id))
        .where(inArray(listingsTable.id, allListingIds))
    : [];
  const byId = new Map(listingRows.map((r) => [r.listing.id, toListingResponse(r.listing, r.office)]));

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    listingIds: r.listingIds,
    listings: r.listingIds.map((id) => byId.get(id)).filter((l): l is NonNullable<typeof l> => l != null),
    createdAt: r.createdAt,
  }));
}

router.get("/comparisons", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rows = await db
    .select()
    .from(comparisonsTable)
    .where(eq(comparisonsTable.userId, req.user.id))
    .orderBy(desc(comparisonsTable.createdAt));

  res.json(ListComparisonsResponse.parse(await hydrateComparisons(rows)));
});

router.post("/comparisons", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateComparisonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [comparison] = await db
    .insert(comparisonsTable)
    .values({ userId: req.user.id, listingIds: parsed.data.listingIds })
    .returning();

  const [hydrated] = await hydrateComparisons([comparison]);
  res.status(201).json(CreateComparisonResponse.parse(hydrated));
});

router.delete("/comparisons/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeleteComparisonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(comparisonsTable).where(eq(comparisonsTable.id, params.data.id));
  if (!existing || existing.userId !== req.user.id) {
    res.status(404).json({ error: "Comparison not found" });
    return;
  }

  await db.delete(comparisonsTable).where(eq(comparisonsTable.id, params.data.id));
  res.status(204).send();
});

export default router;
