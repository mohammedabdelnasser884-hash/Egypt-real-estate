/**
 * Seeds realistic Arabic/Egyptian demo data for the Aqar Thiqa (عقار ثقة) real estate platform.
 *
 * Run with: pnpm --filter @workspace/scripts run seed:estate
 *
 * Note: `favorites`, `requests`, `savedSearches`, `notifications`, `comparisons` and one demo
 * `report` are attached to a couple of demo user rows inserted directly into `usersTable` for
 * seeding purposes only — they are not real Replit Auth accounts and cannot log in. This is
 * intentional: it lets the dashboard/office pages show believable data before anyone signs in.
 */
import { eq } from "drizzle-orm";
import {
  db,
  usersTable,
  officesTable,
  listingsTable,
  requestsTable,
  savedSearchesTable,
  favoritesTable,
  comparisonsTable,
  notificationsTable,
  reportsTable,
} from "@workspace/db";

function slug(input: string, suffix: string) {
  return `${input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")}-${suffix}`;
}

async function main() {
  console.log("Seeding Aqar Thiqa demo data...");

  // --- Demo users (office admins + one regular seeker) ---
  await db
    .insert(usersTable)
    .values([
      { id: "seed-admin-nile-realty", email: "sales@nile-realty.example", firstName: "أحمد", lastName: "الجندي", role: "OFFICE_ADMIN", phone: "01012345678" },
      { id: "seed-admin-marasem", email: "info@marasem-props.example", firstName: "منى", lastName: "شوقي", role: "OFFICE_ADMIN", phone: "01098765432" },
      { id: "seed-user-seeker", email: "seeker@example.com", firstName: "كريم", lastName: "عبد الله", role: "USER", phone: "01111222333" },
    ])
    .onConflictDoNothing();

  // --- Offices ---
  const officesData = [
    {
      id: "seed-office-nile-realty",
      name: "النيل العقارية",
      slug: slug("النيل العقارية", "nr1"),
      phone: "01012345678",
      whatsapp: "01012345678",
      email: "sales@nile-realty.example",
      website: "https://nile-realty.example",
      address: "شارع التسعين، التجمع الخامس",
      governorate: "القاهرة",
      city: "التجمع الخامس",
      yearsOfExperience: 12,
      responseSpeed: "يرد عادة خلال ساعة",
      bio: "مكتب عقاري موثّق متخصص في التجمع الخامس والمستقبل، بخبرة تتجاوز 12 عامًا في السوق المصري.",
    },
    {
      id: "seed-office-marasem",
      name: "مراسم العقارية",
      slug: slug("مراسم العقارية", "mp1"),
      phone: "01098765432",
      whatsapp: "01098765432",
      email: "info@marasem-props.example",
      website: "https://marasem-props.example",
      address: "شارع الشيخ زايد الرئيسي",
      governorate: "الجيزة",
      city: "الشيخ زايد",
      yearsOfExperience: 7,
      responseSpeed: "يرد عادة خلال 3 ساعات",
      bio: "متخصصون في الشيخ زايد و6 أكتوبر، نوفر وحدات سكنية وتجارية موثّقة بالكامل.",
    },
    {
      id: "seed-office-coastal",
      name: "الساحل للتسويق العقاري",
      slug: slug("الساحل للتسويق العقاري", "cm1"),
      phone: "01055566677",
      whatsapp: "01055566677",
      email: "contact@coastal-marketing.example",
      website: null,
      address: "الساحل الشمالي، الكيلو 120",
      governorate: "الساحل الشمالي",
      city: "الساحل الشمالي الجديد",
      yearsOfExperience: 5,
      responseSpeed: "يرد عادة خلال يوم",
      bio: "شاليهات وفيلات على البحر مباشرة في أفضل قرى الساحل الشمالي.",
    },
  ];

  await db.insert(officesTable).values(officesData).onConflictDoNothing();

  // Backfill ratings/verification/counts (not part of insert schema defaults we want to override)
  await db.update(officesTable).set({ verifiedStatus: "VERIFIED", ratingAvg: 4.7, dealsCount: 340, activeListingsCount: 3 }).where(eq(officesTable.id, "seed-office-nile-realty"));
  await db.update(officesTable).set({ verifiedStatus: "VERIFIED", ratingAvg: 4.4, dealsCount: 156, activeListingsCount: 2 }).where(eq(officesTable.id, "seed-office-marasem"));
  await db.update(officesTable).set({ verifiedStatus: "PENDING", ratingAvg: 4.1, dealsCount: 42, activeListingsCount: 1 }).where(eq(officesTable.id, "seed-office-coastal"));

  await db.update(usersTable).set({ officeId: "seed-office-nile-realty" }).where(eq(usersTable.id, "seed-admin-nile-realty"));
  await db.update(usersTable).set({ officeId: "seed-office-marasem" }).where(eq(usersTable.id, "seed-admin-marasem"));

  // --- Listings ---
  const listingsData = [
    {
      id: "seed-listing-1",
      title: "شقة راقية للبيع في التجمع الخامس",
      slug: slug("شقة راقية للبيع في التجمع الخامس", "l1"),
      description: "شقة 180م تشطيب سوبر لوكس، 3 غرف نوم وصالتين، إطلالة مفتوحة، قريبة من الجامعة الأمريكية.",
      price: 4200000,
      currency: "EGP",
      propertyType: "APARTMENT" as const,
      listingType: "SALE" as const,
      governorate: "القاهرة",
      city: "التجمع الخامس",
      area: "الشيخ زايد",
      neighborhood: "الحي الأول",
      street: "شارع التسعين الجنوبي",
      size: 180,
      rooms: 3,
      bathrooms: 2,
      finishing: "SUPER_LUX" as const,
      floor: "4",
      hasElevator: true,
      hasGarage: true,
      hasGarden: false,
      hasPool: false,
      furnished: false,
      installmentAvailable: true,
      immediateDelivery: true,
      constructionYear: 2019,
      images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750"],
      mapLat: 30.0131,
      mapLng: 31.4269,
      officeId: "seed-office-nile-realty",
      ownerId: "seed-admin-nile-realty",
      priceStatus: "FIXED" as const,
      status: "PUBLISHED" as const,
      viewsCount: 340,
      favoritesCount: 18,
    },
    {
      id: "seed-listing-2",
      title: "فيلا مستقلة للإيجار في الشيخ زايد",
      slug: slug("فيلا مستقلة للإيجار في الشيخ زايد", "l2"),
      description: "فيلا مستقلة 400م على قطعة أرض 600م، حديقة خاصة ومسبح، تشطيب فاخر بالكامل.",
      price: 85000,
      currency: "EGP",
      propertyType: "VILLA" as const,
      listingType: "RENT" as const,
      governorate: "الجيزة",
      city: "الشيخ زايد",
      area: "بيفرلي هيلز",
      neighborhood: "كمبوند بيفرلي هيلز",
      street: "المحور المركزي",
      size: 400,
      rooms: 5,
      bathrooms: 4,
      finishing: "SUPER_LUX" as const,
      floor: null,
      hasElevator: false,
      hasGarage: true,
      hasGarden: true,
      hasPool: true,
      furnished: true,
      installmentAvailable: false,
      immediateDelivery: true,
      constructionYear: 2021,
      images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227"],
      mapLat: 30.0771,
      mapLng: 30.9757,
      officeId: "seed-office-marasem",
      ownerId: "seed-admin-marasem",
      priceStatus: "FIXED" as const,
      status: "PUBLISHED" as const,
      viewsCount: 512,
      favoritesCount: 27,
    },
    {
      id: "seed-listing-3",
      title: "شاليه على البحر مباشرة بالساحل الشمالي",
      slug: slug("شاليه على البحر مباشرة بالساحل الشمالي", "l3"),
      description: "شاليه 120م دور أرضي مع حديقة، على البحر مباشرة، تشطيب لوكس، متاح للحجز الصيف القادم.",
      price: 6500000,
      currency: "EGP",
      propertyType: "CHALET" as const,
      listingType: "SALE" as const,
      governorate: "الساحل الشمالي",
      city: "الساحل الشمالي الجديد",
      area: "مراسي",
      neighborhood: "مراسي",
      street: "الكيلو 120 طريق إسكندرية مطروح",
      size: 120,
      rooms: 2,
      bathrooms: 2,
      finishing: "LUX" as const,
      floor: "0",
      hasElevator: false,
      hasGarage: true,
      hasGarden: true,
      hasPool: true,
      furnished: true,
      installmentAvailable: true,
      immediateDelivery: false,
      constructionYear: 2023,
      images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2"],
      mapLat: 31.0409,
      mapLng: 28.5847,
      officeId: "seed-office-coastal",
      ownerId: "seed-admin-nile-realty",
      priceStatus: "NEGOTIABLE" as const,
      status: "PUBLISHED" as const,
      viewsCount: 205,
      favoritesCount: 9,
    },
    {
      id: "seed-listing-4",
      title: "مكتب إداري للإيجار في القاهرة الجديدة",
      slug: slug("مكتب إداري للإيجار في القاهرة الجديدة", "l4"),
      description: "مكتب 90م في برج إداري متكامل الخدمات، مؤثث بالكامل وجاهز للاستخدام الفوري.",
      price: 25000,
      currency: "EGP",
      propertyType: "OFFICE" as const,
      listingType: "RENT" as const,
      governorate: "القاهرة",
      city: "القاهرة الجديدة",
      area: "التجمع الخامس",
      neighborhood: "التجمع الخامس",
      street: "برج بيزنس بارك",
      size: 90,
      rooms: 3,
      bathrooms: 1,
      finishing: "SUPER_LUX" as const,
      floor: "7",
      hasElevator: true,
      hasGarage: true,
      hasGarden: false,
      hasPool: false,
      furnished: true,
      installmentAvailable: false,
      immediateDelivery: true,
      constructionYear: 2018,
      images: ["https://images.unsplash.com/photo-1497366216548-37526070297c"],
      mapLat: 30.0286,
      mapLng: 31.4922,
      officeId: "seed-office-nile-realty",
      ownerId: "seed-admin-nile-realty",
      priceStatus: "FIXED" as const,
      status: "PUBLISHED" as const,
      viewsCount: 98,
      favoritesCount: 4,
    },
    {
      id: "seed-listing-5",
      title: "دوبلكس للبيع في مدينة 6 أكتوبر",
      slug: slug("دوبلكس للبيع في مدينة 6 أكتوبر", "l5"),
      description: "دوبلكس 250م تشطيب سوبر لوكس، حديقة خاصة صغيرة، في كمبوند مغلق بخدمات متكاملة.",
      price: 5100000,
      currency: "EGP",
      propertyType: "DUPLEX" as const,
      listingType: "SALE" as const,
      governorate: "الجيزة",
      city: "6 أكتوبر",
      area: "الحي المتميز",
      neighborhood: "كمبوند بالم هيلز",
      street: "المحور المركزي",
      size: 250,
      rooms: 4,
      bathrooms: 3,
      finishing: "SUPER_LUX" as const,
      floor: "0",
      hasElevator: false,
      hasGarage: true,
      hasGarden: true,
      hasPool: false,
      furnished: false,
      installmentAvailable: true,
      immediateDelivery: false,
      constructionYear: 2022,
      images: ["https://images.unsplash.com/photo-1560184897-ae75f418493e"],
      mapLat: 29.9761,
      mapLng: 30.9494,
      officeId: "seed-office-marasem",
      ownerId: "seed-admin-marasem",
      priceStatus: "NEGOTIABLE" as const,
      status: "PUBLISHED" as const,
      viewsCount: 274,
      favoritesCount: 15,
    },
    {
      id: "seed-listing-6",
      title: "استوديو للإيجار قريب من الجامعة الأمريكية",
      slug: slug("استوديو للإيجار قريب من الجامعة الأمريكية", "l6"),
      description: "استوديو 55م مفروش بالكامل، مناسب للطلاب والموظفين، قريب جدًا من AUC.",
      price: 12000,
      currency: "EGP",
      propertyType: "STUDIO" as const,
      listingType: "RENT" as const,
      governorate: "القاهرة",
      city: "التجمع الخامس",
      area: "الشباب",
      neighborhood: "بجوار الجامعة الأمريكية",
      street: "شارع التسعين",
      size: 55,
      rooms: 1,
      bathrooms: 1,
      finishing: "LUX" as const,
      floor: "2",
      hasElevator: true,
      hasGarage: false,
      hasGarden: false,
      hasPool: false,
      furnished: true,
      installmentAvailable: false,
      immediateDelivery: true,
      constructionYear: 2020,
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
      mapLat: 30.0192,
      mapLng: 31.4998,
      officeId: "seed-office-nile-realty",
      ownerId: "seed-admin-nile-realty",
      priceStatus: "FIXED" as const,
      status: "PUBLISHED" as const,
      viewsCount: 431,
      favoritesCount: 22,
    },
  ];

  await db.insert(listingsTable).values(listingsData).onConflictDoNothing();

  // Backfill verifiedStatus (omitted from insert schema by design)
  await db
    .update(listingsTable)
    .set({ verifiedStatus: "VERIFIED" })
    .where(eq(listingsTable.id, "seed-listing-1"));
  for (const id of ["seed-listing-2", "seed-listing-4", "seed-listing-5", "seed-listing-6"]) {
    await db.update(listingsTable).set({ verifiedStatus: "VERIFIED" }).where(eq(listingsTable.id, id));
  }
  await db.update(listingsTable).set({ verifiedStatus: "PENDING" }).where(eq(listingsTable.id, "seed-listing-3"));

  // --- Property requests ---
  await db
    .insert(requestsTable)
    .values([
      {
        id: "seed-request-1",
        userId: "seed-user-seeker",
        title: "بحث عن شقة للإيجار في مدينة نصر",
        listingType: "RENT",
        propertyType: "APARTMENT",
        governorate: "القاهرة",
        city: "مدينة نصر",
        budgetMin: 8000,
        budgetMax: 15000,
        sizeMin: 100,
        roomsMin: 2,
        notes: "أفضل قريب من مترو، الدور الأول أو الثاني.",
        status: "OPEN",
        matchedCount: 0,
      },
      {
        id: "seed-request-2",
        userId: "seed-user-seeker",
        title: "بحث عن فيلا للبيع في الساحل الشمالي",
        listingType: "SALE",
        propertyType: "VILLA",
        governorate: "الساحل الشمالي",
        city: "الساحل الشمالي الجديد",
        budgetMin: 5000000,
        budgetMax: 9000000,
        sizeMin: 300,
        roomsMin: 4,
        notes: "يفضل قريب من البحر مباشرة.",
        status: "OPEN",
        matchedCount: 0,
      },
    ])
    .onConflictDoNothing();

  // --- Saved searches ---
  await db
    .insert(savedSearchesTable)
    .values([
      {
        id: "seed-search-1",
        userId: "seed-user-seeker",
        name: "شقق للإيجار في التجمع الخامس",
        filtersJson: { listingType: "RENT", propertyType: "APARTMENT", governorate: "القاهرة", city: "التجمع الخامس" },
        alertsEnabled: true,
      },
      {
        id: "seed-search-2",
        userId: "seed-user-seeker",
        name: "شاليهات للبيع في الساحل الشمالي",
        filtersJson: { listingType: "SALE", propertyType: "CHALET", governorate: "الساحل الشمالي" },
        alertsEnabled: false,
      },
    ])
    .onConflictDoNothing();

  // --- Favorites ---
  await db
    .insert(favoritesTable)
    .values([
      { id: "seed-fav-1", userId: "seed-user-seeker", listingId: "seed-listing-2" },
      { id: "seed-fav-2", userId: "seed-user-seeker", listingId: "seed-listing-3" },
      { id: "seed-fav-3", userId: "seed-user-seeker", listingId: "seed-listing-6" },
    ])
    .onConflictDoNothing();

  // --- Comparison ---
  await db
    .insert(comparisonsTable)
    .values([{ id: "seed-comparison-1", userId: "seed-user-seeker", listingIds: ["seed-listing-2", "seed-listing-3", "seed-listing-5"] }])
    .onConflictDoNothing();

  // --- Notifications ---
  await db
    .insert(notificationsTable)
    .values([
      { id: "seed-notif-1", userId: "seed-user-seeker", type: "NEW_MATCH", title: "عقار جديد يطابق طلبك", message: "تم إضافة شقة جديدة تطابق طلبك في مدينة نصر.", read: false },
      { id: "seed-notif-2", userId: "seed-user-seeker", type: "PRICE_DROP", title: "انخفاض سعر", message: "تم تخفيض سعر شقة محفوظة في مفضلتك.", read: false },
      { id: "seed-notif-3", userId: "seed-user-seeker", type: "SAVED_SEARCH_ALERT", title: "نتائج جديدة لبحثك المحفوظ", message: 'توجد 3 نتائج جديدة لبحث "شقق للإيجار في التجمع الخامس".', read: true },
    ])
    .onConflictDoNothing();

  // --- Sample report ---
  await db
    .insert(reportsTable)
    .values([
      {
        id: "seed-report-1",
        userId: "seed-user-seeker",
        listingId: "seed-listing-4",
        officeId: null,
        reason: "معلومات غير دقيقة",
        details: "السعر المعروض يختلف عما تم تأكيده هاتفيًا.",
        status: "PENDING",
      },
    ])
    .onConflictDoNothing();

  console.log("Seed complete:", { offices: officesData.length, listings: listingsData.length });
}

main()
  .then(() => {
    console.log("Seeding finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
