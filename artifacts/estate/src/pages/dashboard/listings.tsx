import { useGetProfile, useListListings, useDeleteListing } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, PlusCircle, Building2, MapPin, Edit, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { formatEGP, formatDate } from "@/lib/format";
import { LISTING_TYPE_AR, PROPERTY_TYPE_AR, LISTING_STATUS_AR } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export default function DashboardListings() {
  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const officeId = profile?.officeId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: listingsData, isLoading: isListingsLoading, refetch } = useListListings({ officeId: officeId || "dummy", pageSize: 50 }, { query: { enabled: !!officeId } as any });
  const deleteListing = useDeleteListing();

  if (isProfileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (profile?.role !== 'OFFICE_ADMIN') {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">غير مصرح</h1>
        <p className="text-muted-foreground">هذه الصفحة مخصصة لمديري المكاتب فقط.</p>
      </div>
    );
  }

  if (!officeId) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border">
        <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">لا يوجد مكتب</h1>
        <p className="text-muted-foreground mb-6">يجب إعداد ملف المكتب أولاً قبل إضافة العقارات.</p>
        <Button asChild>
          <Link href="/dashboard/office">إعداد ملف المكتب</Link>
        </Button>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.")) {
      deleteListing.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم حذف العقار بنجاح" });
          refetch();
        }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            عقارات المكتب
          </h1>
          <p className="text-muted-foreground mt-1">إدارة العقارات المضافة بواسطة مكتبك.</p>
        </div>
        <Button onClick={() => setLocation("/dashboard/listings/new")} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          إضافة عقار جديد
        </Button>
      </div>

      {isListingsLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : !listingsData || listingsData.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">لم تقم بإضافة أي عقارات بعد.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listingsData.items.map(listing => (
            <Card key={listing.id} className="overflow-hidden hover:border-primary/40 transition-colors">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-48 h-48 sm:h-auto bg-muted shrink-0 relative">
                  {listing.images[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 m-auto h-full text-muted-foreground/30" />
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Badge className="bg-black/60 text-white border-0 shadow-sm">{LISTING_TYPE_AR[listing.listingType]}</Badge>
                    <Badge variant={listing.status === 'PUBLISHED' ? 'success' : 'secondary'} className="shadow-sm">
                      {LISTING_STATUS_AR[listing.status]}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2">{listing.title}</h3>
                    <div className="font-bold text-primary text-xl whitespace-nowrap">{formatEGP(listing.price)}</div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5 mb-4">
                    <MapPin className="w-4 h-4" />
                    {listing.city}، {listing.governorate}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                    <Badge variant="outline" className="bg-gray-50">{PROPERTY_TYPE_AR[listing.propertyType]}</Badge>
                    <div className="text-xs text-muted-foreground flex items-center bg-gray-50 px-2 rounded-md border">
                      مشاهدات: {listing.viewsCount}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center bg-gray-50 px-2 rounded-md border">
                      تاريخ الإضافة: {formatDate(listing.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" asChild className="flex-1 max-w-[120px]">
                      <Link href={`/listing/${listing.id}`}>عرض</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1 max-w-[120px]">
                      {/* Using the same route for edit but passing ID would be standard. For this exercise we'll just alert */}
                      <a href="#" onClick={(e) => { e.preventDefault(); toast({ title: "ميزة التعديل غير مفعلة في هذه النسخة" }); }}>
                        <Edit className="w-4 h-4 ml-2" /> تعديل
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => handleDelete(listing.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
