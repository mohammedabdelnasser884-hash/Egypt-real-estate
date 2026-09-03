import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, savedSearchesTable } from "@workspace/db";
import {
  ListSavedSearchesResponse,
  CreateSavedSearchBody,
  CreateSavedSearchResponse,
  UpdateSavedSearchParams,
  UpdateSavedSearchBody,
  UpdateSavedSearchResponse,
  DeleteSavedSearchParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/saved-searches", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rows = await db
    .select()
    .from(savedSearchesTable)
    .where(eq(savedSearchesTable.userId, req.user.id))
    .orderBy(desc(savedSearchesTable.createdAt));

  res.json(ListSavedSearchesResponse.parse(rows));
});

router.post("/saved-searches", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateSavedSearchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [savedSearch] = await db
    .insert(savedSearchesTable)
    .values({ ...parsed.data, userId: req.user.id })
    .returning();

  res.status(201).json(CreateSavedSearchResponse.parse(savedSearch));
});

router.patch("/saved-searches/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = UpdateSavedSearchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSavedSearchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(savedSearchesTable)
    .where(eq(savedSearchesTable.id, params.data.id));
  if (!existing || existing.userId !== req.user.id) {
    res.status(404).json({ error: "Saved search not found" });
    return;
  }

  const [savedSearch] = await db
    .update(savedSearchesTable)
    .set(parsed.data)
    .where(eq(savedSearchesTable.id, params.data.id))
    .returning();

  res.json(UpdateSavedSearchResponse.parse(savedSearch));
});

router.delete("/saved-searches/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeleteSavedSearchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(savedSearchesTable)
    .where(eq(savedSearchesTable.id, params.data.id));
  if (!existing || existing.userId !== req.user.id) {
    res.status(404).json({ error: "Saved search not found" });
    return;
  }

  await db.delete(savedSearchesTable).where(eq(savedSearchesTable.id, params.data.id));
  res.status(204).send();
});

export default router;
