import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, reportsTable, usersTable } from "@workspace/db";
import {
  ListReportsResponse,
  CreateReportBody,
  CreateReportResponse,
  UpdateReportParams,
  UpdateReportBody,
  UpdateReportResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function requirePlatformAdmin(userId: string) {
  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return dbUser?.role === "PLATFORM_ADMIN";
}

router.get("/reports", async (req, res): Promise<void> => {
  if (!req.isAuthenticated() || !(await requirePlatformAdmin(req.user.id))) {
    res.status(403).json({ error: "Platform admin access required" });
    return;
  }

  const rows = await db.select().from(reportsTable).orderBy(desc(reportsTable.createdAt));
  res.json(ListReportsResponse.parse(rows));
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [report] = await db
    .insert(reportsTable)
    .values({ ...parsed.data, userId: req.isAuthenticated() ? req.user.id : null })
    .returning();

  res.status(201).json(CreateReportResponse.parse(report));
});

router.patch("/reports/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated() || !(await requirePlatformAdmin(req.user.id))) {
    res.status(403).json({ error: "Platform admin access required" });
    return;
  }

  const params = UpdateReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [report] = await db
    .update(reportsTable)
    .set(parsed.data)
    .where(eq(reportsTable.id, params.data.id))
    .returning();

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(UpdateReportResponse.parse(report));
});

export default router;
