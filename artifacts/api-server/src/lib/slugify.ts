import { randomBytes } from "crypto";

/**
 * Builds a URL-safe slug from Arabic/English text plus a short random suffix
 * to guarantee uniqueness without a DB round-trip.
 */
export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = randomBytes(3).toString("hex");
  return base ? `${base}-${suffix}` : suffix;
}
