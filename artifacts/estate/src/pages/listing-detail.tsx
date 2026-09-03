import { useState } from "react";
import { useLocation } from "wouter";
import { useGetListing, useListSimilarListings, useCreateFavorite, useDeleteFavorite, useListFavorites, useGetCurrentAuthUser, useListComparisons, useCreateComparison, useCreateReport } from "@workspace/api-client-react";
import { formatEGP, formatNumber, formatDate } from "@/lib/format";
import { PROPERTY_TYPE_AR, LISTING_TYPE_AR, FINISHING_AR, VERIFIED_STATUS_AR, PRICE_STATUS_AR } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@workspace/replit-auth-web";
import { ListingCard } from "@/components/listing-card";
import { 
  Building2, MapPin, BedDouble, Bath, Maximize2, Layers, 
  Car, TreePine, Waves, Coffee, Compass, Calendar, 
  Heart, Phone, MessageCircle, Share2, Scale, Flag,
  ChevronRight, ChevronLeft, ShieldCheck, Video, Info,
  Sparkles
} from "lucide-react";

export default function ListingDetail({ params }: { params: { id: string } }) {
  const listingId = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, login } = useAuth();

  const { data: listing, isLoading } = useGetListing(listingId, { 
    query: { enabled: !!listingId } as any
  });

  const { data: similar } = useListSimilarListings(listingId, {
    query: { enabled: !!listing?.id } as any
  });

  const { data: favorites } = useListFavorites({ query: { enabled: isAuthenticated } as any });
  const { data: comparisons } = useListComparisons({ query: { enabled: isAuthenticated } as any });
  
  const createFavorite = useCreateFavorite();
  const deleteFavorite = useDeleteFavorite();
  const createComparison = useCreateComparison();
  const createReport = useCreateReport();

  const [activeImage, setActiveImage] = useState(0);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="w-full h-[500px] rounded-xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-2/3 h-10" />
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-full h-40" />
          </div>
          <div className="space-y-6">
            <Skeleton className="w-full h-64" />
            <Skeleton className="w-full h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">العقار غير موجود</h1>
        <Button onClick={() => setLocation("/search")}>العودة للبحث</Button>
      </div>
    );
  }

  const isFavorited = favorites?.some((f) => f.listingId === listing.id);
  const favoriteRecord = favorites?.find((f) => f.listingId === listing.id);

  const toggleFavorite = () => {
    if (!isAuthenticated) return login();
    if (isFavorited && favoriteRecord) {
      deleteFavorite.mutate({ id: favoriteRecord.id });
    } else {
      createFavorite.mutate({ data: { listingId: listing.id } });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `شاهد هذا العقار على عقار ثقة: ${listing.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "تم نسخ الرابط" });
    }
  };

  const handleCompare = () => {
    if (!isAuthenticated) return login();
    
    // Auto-add to an existing comparison or create a new one
    const existing = comparisons?.[0];
    if (existing) {
      if (existing.listingIds.includes(listing.id)) {
        toast({ title: "العقار موجود بالفعل في المقارنة" });
        setLocation("/compare");
        return;
      }
      if (existing.listingIds.length >= 3) {
        toast({ title: "الحد الأقصى للمقارنة هو 3 عقارات", variant: "destructive" });
        return;
      }
      // Assuming update Comparison endpoint exists, normally we'd update.
      // For this simplified version we'll just redirect if it exists.
      toast({ title: "يرجى إنشاء مقارنة جديدة (ميزة التحديث غير مدعومة هنا مؤقتاً)" });
    } else {
      createComparison.mutate({ data: { listingIds: [listing.id] } }, {
        onSuccess: () => {
          toast({ title: "تمت إضافته للمقارنة" });
          setLocation("/compare");
        }
      });
    }
  };

  const handleReport = () => {
    if (!isAuthenticated) return login();
    if (!reportReason) {
      toast({ title: "يجب اختيار سبب البلاغ", variant: "destructive" });
      return;
    }
    createReport.mutate({
      data: { listingId: listing.id, reason: reportReason, details: reportDetails }
    }, {
      onSuccess: () => {
        toast({ title: "تم إرسال البلاغ", description: "سنقوم بمراجعة العقار في أقرب وقت" });
        setIsReportOpen(false);
        setReportReason("");
        setReportDetails("");
      }
    });
  };

  const mainImage = listing.images[activeImage] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Gallery Section */}
      <div className="bg-black w-full h-[40vh] md:h-[60vh] relative group flex items-center justify-center">
        <img src={mainImage} alt={listing.title} className="max-w-full max-h-full object-contain" />
        
        {listing.images.length > 1 && (
          <>
            <button 
              onClick={() => setActiveImage(prev => prev === 0 ? listing.images.length - 1 : prev - 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setActiveImage(prev => prev === listing.images.length - 1 ? 0 : prev + 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur">
              {activeImage + 1} / {listing.images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {listing.images.length > 1 && (
        <div className="container mx-auto px-4 mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {listing.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-20 shrink-0 rounded-md overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{LISTING_TYPE_AR[listing.listingType]}</Badge>
                <Badge variant="outline">{PROPERTY_TYPE_AR[listing.propertyType]}</Badge>
                {listing.verifiedStatus === 'VERIFIED' && (
                  <Badge variant="success" className="gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    عقار موثق
                  </Badge>
                )}
                {listing.priceStatus !== 'FIXED' && (
                  <Badge variant="secondary">{PRICE_STATUS_AR[listing.priceStatus]}</Badge>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-snug">
                {listing.title}
              </h1>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatEGP(listing.price)}
                  </div>
                  <div className="flex items-center text-muted-foreground gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{[listing.street, listing.neighborhood, listing.area, listing.city, listing.governorate].filter(Boolean).join('، ')}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full w-10 h-10">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleCompare} className="rounded-full w-10 h-10">
                    <Scale className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={toggleFavorite} 
                    className={`rounded-full w-10 h-10 ${isFavorited ? 'border-destructive/30 bg-destructive/5' : ''}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                  </Button>
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
                {listing.rooms != null && (
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl">
                    <BedDouble className="w-6 h-6 text-primary/70 mb-2" />
                    <span className="text-lg font-bold">{listing.rooms}</span>
                    <span className="text-xs text-muted-foreground">غرف نوم</span>
                  </div>
                )}
                {listing.bathrooms != null && (
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl">
                    <Bath className="w-6 h-6 text-primary/70 mb-2" />
                    <span className="text-lg font-bold">{listing.bathrooms}</span>
                    <span className="text-xs text-muted-foreground">حمامات</span>
                  </div>
                )}
                {listing.size != null && (
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl">
                    <Maximize2 className="w-6 h-6 text-primary/70 mb-2" />
                    <span className="text-lg font-bold">{formatNumber(listing.size)}</span>
                    <span className="text-xs text-muted-foreground">متر مربع</span>
                  </div>
                )}
                {listing.floor != null && (
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl">
                    <Layers className="w-6 h-6 text-primary/70 mb-2" />
                    <span className="text-lg font-bold">{listing.floor}</span>
                    <span className="text-xs text-muted-foreground">الطابق</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                وصف العقار
              </h2>
              <div className="prose prose-sm md:prose-base prose-slate max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description || "لا يوجد وصف متاح."}
              </div>
            </div>

            {/* Features & Amenities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                المرافق والتفاصيل
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {listing.finishing && (
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-muted-foreground flex items-center gap-2"><Sparkles className="w-4 h-4"/> نوع التشطيب</span>
                    <span className="font-medium">{FINISHING_AR[listing.finishing]}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Compass className="w-4 h-4"/> الاتجاه</span>
                  <span className="font-medium">{listing.orientation || "غير محدد"}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4"/> سنة البناء</span>
                  <span className="font-medium">{listing.constructionYear || "غير محدد"}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Coffee className="w-4 h-4"/> مفروش</span>
                  <span className="font-medium">{listing.furnished ? "نعم" : "لا"}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Car className="w-4 h-4"/> جراج</span>
                  <span className="font-medium">{listing.hasGarage ? "متوفر" : "غير متوفر"}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Layers className="w-4 h-4"/> مصعد</span>
                  <span className="font-medium">{listing.hasElevator ? "متوفر" : "غير متوفر"}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><TreePine className="w-4 h-4"/> حديقة</span>
                  <span className="font-medium">{listing.hasGarden ? "متوفر" : "غير متوفر"}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Waves className="w-4 h-4"/> مسبح</span>
                  <span className="font-medium">{listing.hasPool ? "متوفر" : "غير متوفر"}</span>
                </div>
              </div>
            </div>

            {/* Video (if any) */}
            {listing.videoUrl && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  جولة فيديو
                </h2>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                  <iframe 
                    src={listing.videoUrl.replace("watch?v=", "embed/")} 
                    className="w-full h-full border-0"
                    allowFullScreen 
                    title="جولة فيديو للعقار"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Contact Card */}
            {listing.office ? (
              <Card className="sticky top-24 border-primary/20 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6 pb-6 border-b">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border">
                      {listing.office.logoUrl ? (
                        <img src={listing.office.logoUrl} alt={listing.office.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-primary/50" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-1 cursor-pointer hover:text-primary transition-colors" onClick={() => setLocation(`/office/${listing.office?.id}`)}>
                        {listing.office.name}
                      </h3>
                      {listing.office.verifiedStatus === 'VERIFIED' && (
                        <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                          <ShieldCheck className="w-4 h-4" />
                          مكتب معتمد
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Button className="w-full h-12 text-base gap-2 font-bold" asChild>
                      <a href={`tel:${listing.office.phone}`}>
                        <Phone className="w-5 h-5" />
                        اتصل الآن
                      </a>
                    </Button>
                    {listing.office.whatsapp && (
                      <Button variant="outline" className="w-full h-12 text-base gap-2 font-bold bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 hover:text-[#25D366] border-[#25D366]/30" asChild>
                        <a href={`https://wa.me/${listing.office.whatsapp.replace(/[^0-9]/g, '')}?text=مرحباً، أستفسر عن العقار: ${listing.title} (${window.location.href})`} target="_blank" rel="noreferrer">
                          <MessageCircle className="w-5 h-5" />
                          تواصل واتساب
                        </a>
                      </Button>
                    )}
                  </div>

                  <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setLocation(`/office/${listing.office?.id}`)}>
                    عرض ملف المكتب
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-24">
                <CardContent className="p-6 text-center text-muted-foreground">
                  معلومات الاتصال غير متوفرة
                </CardContent>
              </Card>
            )}

            {/* Additional Info box */}
            <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
              <div className="flex justify-between mb-2">
                <span>تاريخ النشر:</span>
                <span className="font-medium text-foreground">{formatDate(listing.createdAt)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>المشاهدات:</span>
                <span className="font-medium text-foreground">{formatNumber(listing.viewsCount)}</span>
              </div>
              <div className="flex justify-between">
                <span>مرات الحفظ:</span>
                <span className="font-medium text-foreground">{formatNumber(listing.favoritesCount)}</span>
              </div>
            </div>

            {/* Report Button */}
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 gap-2">
                  <Flag className="w-4 h-4" />
                  الإبلاغ عن هذا الإعلان
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>الإبلاغ عن إعلان مخالف</DialogTitle>
                  <DialogDescription>
                    تساعدنا بلاغاتكم في الحفاظ على جودة ومصداقية المنصة.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">سبب البلاغ (مطلوب)</label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    >
                      <option value="">اختر السبب...</option>
                      <option value="fake_price">السعر غير حقيقي أو خادع</option>
                      <option value="fake_photos">الصور غير مطابقة للواقع</option>
                      <option value="unavailable">العقار مباع أو غير متاح</option>
                      <option value="broker_claim">المالك اتضح أنه وسيط</option>
                      <option value="scam">احتيال أو نصب</option>
                      <option value="other">سبب آخر</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">تفاصيل إضافية (اختياري)</label>
                    <Textarea 
                      placeholder="يرجى كتابة أي تفاصيل قد تساعدنا في التحقق..."
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReportOpen(false)}>إلغاء</Button>
                  <Button onClick={handleReport} disabled={createReport.isPending} variant="destructive">
                    إرسال البلاغ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </div>

        {/* Similar Listings */}
        {similar && similar.length > 0 && (
          <div className="mt-16 pt-10 border-t">
            <h2 className="text-2xl font-bold mb-6">عقارات مشابهة قد تعجبك</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {similar.map(sim => (
                <ListingCard key={sim.id} listing={sim} showOffice={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
