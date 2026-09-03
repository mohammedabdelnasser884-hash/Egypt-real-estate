import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, officesTable } from "@workspace/db";
import { GetProfileResponse, UpdateProfileBody, UpdateProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profile", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const office = user.officeId
    ? (await db.select().from(officesTable).where(eq(officesTable.id, user.officeId)))[0]
    : null;

  res.json(
    GetProfileResponse.parse({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      phone: user.phone,
      role: user.role,
      officeId: user.officeId,
      office: office ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }),
  );
});

router.patch("/profile", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, req.user.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const office = user.officeId
    ? (await db.select().from(officesTable).where(eq(officesTable.id, user.officeId)))[0]
    : null;

  res.json(
    UpdateProfileResponse.parse({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      phone: user.phone,
      role: user.role,
      officeId: user.officeId,
      office: office ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }),
  );
});

export default router;
