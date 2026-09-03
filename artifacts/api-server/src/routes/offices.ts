import { Router, type IRouter } from "express";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db, officesTable, usersTable } from "@workspace/db";
import {
  ListOfficesQueryParams,
  ListOfficesResponse,
  CreateOfficeBody,
  CreateOfficeResponse,
  GetOfficeParams,
  GetOfficeResponse,
  UpdateOfficeParams,
  UpdateOfficeBody,
  UpdateOfficeResponse,
} from "@workspace/api-zod";
import { slugify } from "../lib/slugify";

const router: IRouter = Router();

router.get("/offices", async (req, res): Promise<void> => {
  const parsed = ListOfficesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const q = parsed.data;

  const conditions = [];
  if (q.verifiedOnly) conditions.push(eq(officesTable.verifiedStatus, "VERIFIED"));
  if (q.governorate) conditions.push(eq(officesTable.governorate, q.governorate));
  if (q.search) conditions.push(ilike(officesTable.name, `%${q.search}%`));

  const rows = await db
    .select()
    .from(officesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(officesTable.ratingAvg), desc(officesTable.dealsCount))
    .limit(q.limit);

  res.json(ListOfficesResponse.parse(rows));
});

router.post("/offices", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateOfficeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
  if (dbUser?.officeId) {
    res.status(409).json({ error: "You already manage an office" });
    return;
  }

  const [office] = await db
    .insert(officesTable)
    .values({ ...parsed.data, slug: slugify(parsed.data.name) })
    .returning();

  await db
    .update(usersTable)
    .set({ officeId: office.id, role: "OFFICE_ADMIN" })
    .where(eq(usersTable.id, req.user.id));

  res.status(201).json(CreateOfficeResponse.parse(office));
});

router.get("/offices/:id", async (req, res): Promise<void> => {
  const params = GetOfficeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [office] = await db.select().from(officesTable).where(eq(officesTable.id, params.data.id));
  if (!office) {
    res.status(404).json({ error: "Office not found" });
    return;
  }

  res.json(GetOfficeResponse.parse(office));
});

router.patch("/offices/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = UpdateOfficeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOfficeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
  if (!dbUser || (dbUser.officeId !== params.data.id && dbUser.role !== "PLATFORM_ADMIN")) {
    res.status(403).json({ error: "You do not have access to this office" });
    return;
  }

  // Only a platform admin may change verification status.
  const updates = { ...parsed.data };
  if (dbUser.role !== "PLATFORM_ADMIN") delete updates.verifiedStatus;

  const [office] = await db
    .update(officesTable)
    .set(updates)
    .where(eq(officesTable.id, params.data.id))
    .returning();

  if (!office) {
    res.status(404).json({ error: "Office not found" });
    return;
  }

  res.json(UpdateOfficeResponse.parse(office));
});

export default router;
