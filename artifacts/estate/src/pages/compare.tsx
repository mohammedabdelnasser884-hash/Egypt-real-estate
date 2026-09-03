import { useListComparisons, useDeleteComparison } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PROPERTY_TYPE_AR, LISTING_TYPE_AR, FINISHING_AR } from "@/lib/constants";
import { formatEGP, formatNumber } from "@/lib/format";
import { Scale, Trash2, Check, Minus, Building2, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useToast } from "@/hooks/use-toast";

export default function Compare() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: comparisons, isLoading, refetch } = useListComparisons({ query: { enabled: isAuthenticated } as any });
  const deleteComparison = useDeleteComparison();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Scale className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">سجل الدخول للمقارنة</h1>
        <p className="text-muted-foreground mb-6">يجب تسجيل الدخول لإضافة وحفظ العقارات في قائمة المقارنة.</p>
        <Button onClick={() => setLocation("/")}>العودة للرئيسية</Button>
      </div>
    );
  }

  const comparison = comparisons?.[0]; // Currently supporting 1 active comparison group
  const listings = comparison?.listings || [];

  const handleClear = () => {
    if (comparison) {
      deleteComparison.mutate({ id: comparison.id }, {
        onSuccess: () => {
          toast({ title: "تم تفريغ قائمة المقارنة" });
          refetch();
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-[600px] rounded-xl" />
          <Skeleton className="h-[600px] rounded-xl" />
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Scale className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-3">لا توجد عقارات للمقارنة</h1>
        <p className="text-muted-foreground mb-8">تصفح العقارات المتاحة وأضف ما يصل إلى 3 عقارات للمقارنة بين مواصفاتها جنباً إلى جنب.</p>
        <Button asChild size="lg" className="w-full">
          <Link href="/search">تصفح العقارات</Link>
        </Button>
      </div>
    );
  }

  const features = [
    { key: 'propertyType', label: 'النوع', format: (l: any) => PROPERTY_TYPE_AR[l.propertyType as keyof typeof PROPERTY_TYPE_AR] },
    { key: 'listingType', label: 'حالة العرض', format: (l: any) => LISTING_TYPE_AR[l.listingType as keyof typeof LISTING_TYPE_AR] },
    { key: 'size', label: 'المساحة', format: (l: any) => l.size ? `${formatNumber(l.size)} م²` : '-' },
    { key: 'rooms', label: 'الغرف', format: (l: any) => l.rooms || '-' },
    { key: 'bathrooms', label: 'الحمامات', format: (l: any) => l.bathrooms || '-' },
    { key: 'finishing', label: 'التشطيب', format: (l: any) => l.finishing ? FINISHING_AR[l.finishing as keyof typeof FINISHING_AR] : '-' },
    { key: 'floor', label: 'الطابق', format: (l: any) => l.floor || '-' },
    { key: 'hasElevator', label: 'مصعد', boolean: true },
    { key: 'hasGarage', label: 'جراج', boolean: true },
    { key: 'hasGarden', label: 'حديقة', boolean: true },
    { key: 'hasPool', label: 'مسبح', boolean: true },
    { key: 'furnished', label: 'مفروش', boolean: true },
    { key: 'installmentAvailable', label: 'تقسيط', boolean: true },
    { key: 'immediateDelivery', label: 'استلام فوري', boolean: true },
  ];

  return (
    <div className="bg-white min-h-screen pb-20 pt-8">
      <div className="container mx-auto px-4 overflow-x-auto">
        <div className="flex items-center justify-between mb-8 min-w-[800px]">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            مقارنة العقارات ({listings.length}/3)
          </h1>
          <Button variant="outline" onClick={handleClear} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 ml-2" />
            تفريغ القائمة
          </Button>
        </div>

        <div className="min-w-[800px] border rounded-xl overflow-hidden bg-white shadow-sm">
          {/* Header Row (Images & Basic Info) */}
          <div className="grid grid-cols-[200px_1fr] divide-x divide-x-reverse border-b bg-gray-50/50">
            <div className="p-4 flex items-center justify-center font-bold text-muted-foreground">
              المواصفات
            </div>
            <div className={`grid grid-cols-${listings.length} divide-x divide-x-reverse`}>
              {listings.map(listing => (
                <div key={listing.id} className="p-4 flex flex-col h-full">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 relative bg-muted">
                    {listing.images[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 m-auto h-full text-muted-foreground/30" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm line-clamp-2 mb-2 min-h-[40px]">
                    <Link href={`/listing/${listing.id}`} className="hover:text-primary transition-colors">
                      {listing.title}
                    </Link>
                  </h3>
                  <div className="text-xl font-bold text-primary mb-2 mt-auto">
                    {formatEGP(listing.price)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                    <MapPin className="w-3 h-3" />
                    {listing.city}
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/listing/${listing.id}`}>عرض التفاصيل</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Features Rows */}
          {features.map((feature, idx) => (
            <div key={feature.key} className={`grid grid-cols-[200px_1fr] divide-x divide-x-reverse border-b last:border-b-0 hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
              <div className="p-4 font-medium text-sm text-foreground flex items-center">
                {feature.label}
              </div>
              <div className={`grid grid-cols-${listings.length} divide-x divide-x-reverse`}>
                {listings.map(listing => (
                  <div key={listing.id} className="p-4 flex items-center justify-center text-sm">
                    {feature.boolean ? (
                      (listing as any)[feature.key] ? 
                        <Check className="w-5 h-5 text-green-500" /> : 
                        <Minus className="w-5 h-5 text-muted-foreground/30" />
                    ) : (
                      <span className="font-medium">
                        {feature.format ? feature.format(listing) : (listing as any)[feature.key] || '-'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
