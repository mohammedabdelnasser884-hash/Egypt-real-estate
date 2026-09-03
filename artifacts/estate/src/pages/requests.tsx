import { useState } from "react";
import { useListRequests, useCreateRequest } from "@workspace/api-client-react";
import { PropertyType, ListingType, RequestStatus } from "@workspace/api-client-react";
import { PROPERTY_TYPE_AR, LISTING_TYPE_AR, REQUEST_STATUS_AR } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Inbox, PlusCircle, Search, Filter } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Requests() {
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const { data: requests, isLoading, refetch } = useListRequests();
  const createRequest = useCreateRequest();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.APARTMENT);
  const [listingType, setListingType] = useState<ListingType>(ListingType.SALE);
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return login();
    if (!title || !governorate || !city) {
      toast({ title: "الرجاء إكمال الحقول المطلوبة", variant: "destructive" });
      return;
    }

    createRequest.mutate({
      data: {
        title,
        propertyType,
        listingType,
        governorate,
        city,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        notes: notes || undefined
      }
    }, {
      onSuccess: () => {
        toast({ title: "تم نشر طلبك بنجاح", description: "ستتواصل معك المكاتب المطابقة قريباً" });
        setIsCreateOpen(false);
        refetch();
        // Reset form
        setTitle(""); setGovernorate(""); setCity(""); setBudgetMax(""); setNotes("");
      }
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <Inbox className="w-6 h-6 text-primary" />
              سوق الطلبات العقارية
            </h1>
            <p className="text-muted-foreground">
              لا تجد ما تبحث عنه؟ انشر طلبك هنا وسيقوم وكلاؤنا المعتمدون بالرد عليك بعروض مطابقة.
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shrink-0 gap-2 shadow-md">
                <PlusCircle className="w-5 h-5" />
                أضف طلب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة طلب عقاري جديد</DialogTitle>
                <DialogDescription>
                  وضح تفاصيل العقار الذي تبحث عنه بأكبر قدر من الدقة.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">عنوان الطلب (مطلوب)</label>
                  <Input placeholder="مثال: مطلوب شقة 3 غرف في التجمع الخامس" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">نوع الطلب</label>
                    <Select value={listingType} onValueChange={(v) => setListingType(v as ListingType)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {Object.entries(LISTING_TYPE_AR).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">نوع العقار</label>
                    <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyType)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PROPERTY_TYPE_AR).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">المحافظة (مطلوب)</label>
                    <Input value={governorate} onChange={e => setGovernorate(e.target.value)} placeholder="القاهرة" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">المدينة (مطلوب)</label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="التجمع الخامس" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">الحد الأقصى للميزانية (اختياري)</label>
                  <Input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder="مثال: 3000000" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">تفاصيل إضافية</label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="اذكر أي شروط خاصة (طابق معين، تشطيب، طرق سداد...)" />
                </div>
                <Button type="submit" className="w-full mt-4" disabled={createRequest.isPending}>
                  {createRequest.isPending ? "جاري النشر..." : "نشر الطلب"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">لا توجد طلبات مفتوحة حالياً</h3>
            <p className="text-muted-foreground">كن أول من يضيف طلباً جديداً لتتلقى عروض المكاتب.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <Card key={req.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-primary mb-2">{req.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">{LISTING_TYPE_AR[req.listingType]}</Badge>
                        <Badge variant="outline">{PROPERTY_TYPE_AR[req.propertyType]}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          <MapPin className="w-3.5 h-3.5" />
                          {req.city}، {req.governorate}
                        </div>
                      </div>
                    </div>
                    {req.budgetMax && (
                      <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold text-sm shrink-0 border border-green-100">
                        ميزانية تصل إلى: {formatNumber(req.budgetMax)} ج.م
                      </div>
                    )}
                  </div>
                  
                  {req.notes && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-2 bg-gray-50 p-3 rounded-lg">
                      {req.notes}
                    </p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">تاريخ الطلب: {new Date(req.createdAt).toLocaleDateString('ar-EG')}</span>
                    <Badge variant={req.status === 'OPEN' ? 'default' : 'secondary'}>
                      {REQUEST_STATUS_AR[req.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
