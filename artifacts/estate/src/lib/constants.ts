import { PropertyType, ListingType, Finishing, VerifiedStatus, PriceStatus, ListingStatus, RequestStatus, ReportStatus, NotificationType } from "@workspace/api-client-react";

export const PROPERTY_TYPE_AR: Record<PropertyType, string> = {
  [PropertyType.APARTMENT]: "شقة",
  [PropertyType.VILLA]: "فيلا",
  [PropertyType.DUPLEX]: "دوبلكس",
  [PropertyType.PENTHOUSE]: "بنتهاوس",
  [PropertyType.STUDIO]: "استوديو",
  [PropertyType.TOWNHOUSE]: "تاون هاوس",
  [PropertyType.CHALET]: "شاليه",
  [PropertyType.LAND]: "أرض",
  [PropertyType.OFFICE]: "مكتب",
  [PropertyType.SHOP]: "محل تجاري",
  [PropertyType.WAREHOUSE]: "مخزن",
};

export const LISTING_TYPE_AR: Record<ListingType, string> = {
  [ListingType.SALE]: "للبيع",
  [ListingType.RENT]: "للإيجار",
};

export const FINISHING_AR: Record<Finishing, string> = {
  [Finishing.SUPER_LUX]: "سوبر لوكس",
  [Finishing.LUX]: "لوكس",
  [Finishing.SEMI_FINISHED]: "نصف تشطيب",
  [Finishing.CORE_AND_SHELL]: "على المحارة",
  [Finishing.UNFINISHED]: "بدون تشطيب",
};

export const VERIFIED_STATUS_AR: Record<VerifiedStatus, string> = {
  [VerifiedStatus.VERIFIED]: "موثق",
  [VerifiedStatus.PENDING]: "قيد المراجعة",
  [VerifiedStatus.UNVERIFIED]: "غير موثق",
};

export const PRICE_STATUS_AR: Record<PriceStatus, string> = {
  [PriceStatus.FIXED]: "نهائي",
  [PriceStatus.NEGOTIABLE]: "قابل للتفاوض",
  [PriceStatus.REDUCED]: "تم تخفيض السعر",
};

export const LISTING_STATUS_AR: Record<ListingStatus, string> = {
  [ListingStatus.DRAFT]: "مسودة",
  [ListingStatus.PUBLISHED]: "منشور",
  [ListingStatus.UNPUBLISHED]: "غير منشور",
  [ListingStatus.SOLD]: "تم البيع",
  [ListingStatus.RENTED]: "تم الإيجار",
};

export const REQUEST_STATUS_AR: Record<RequestStatus, string> = {
  [RequestStatus.OPEN]: "مفتوح",
  [RequestStatus.MATCHED]: "تمت المطابقة",
  [RequestStatus.CLOSED]: "مغلق",
};

export const REPORT_STATUS_AR: Record<ReportStatus, string> = {
  [ReportStatus.PENDING]: "قيد المراجعة",
  [ReportStatus.REVIEWED]: "تمت المراجعة",
  [ReportStatus.RESOLVED]: "تم الحل",
  [ReportStatus.DISMISSED]: "مرفوض",
};

export const NOTIFICATION_TYPE_AR: Record<NotificationType, string> = {
  [NotificationType.NEW_MATCH]: "مطابقة جديدة",
  [NotificationType.PRICE_DROP]: "انخفاض في السعر",
  [NotificationType.SAVED_SEARCH_ALERT]: "تنبيه بحث محفوظ",
  [NotificationType.SYSTEM]: "نظام",
  [NotificationType.REPORT_UPDATE]: "تحديث بلاغ",
};
