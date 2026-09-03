import type { Listing, Office } from "@workspace/db";

/** Trims an Office row down to the OfficeSummary shape embedded in listings/requests responses. */
export function toOfficeSummary(office: Office | null | undefined) {
  if (!office) return null;
  return {
    id: office.id,
    name: office.name,
    slug: office.slug,
    logoUrl: office.logoUrl,
    verifiedStatus: office.verifiedStatus,
    ratingAvg: office.ratingAvg,
    responseSpeed: office.responseSpeed,
    phone: office.phone,
    whatsapp: office.whatsapp,
  };
}

/** Merges a Listing row with its (optional) joined Office row into the API Listing shape. */
export function toListingResponse(listing: Listing, office: Office | null | undefined) {
  return {
    ...listing,
    office: toOfficeSummary(office),
  };
}
