import { useLocation } from "wouter";
import { useGetOffice, useListListings, useCreateReport } from "@workspace/api-client-react";
import { ListingSort } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/listing-card";
import { Building2, MapPin, Phone, Mail, Globe, MessageCircle, ShieldCheck, Star, Clock, FileText, Flag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@workspace/replit-auth-web";
import { useToast } from "@/hooks/use-toast";

export default function OfficeProfile({ params }: { params: { id: string } }) {
  const officeId = params.id;
  const { data: office, isLoading: isOfficeLoading } = useGetOffice(officeId, { query: { enabled: !!officeId } as any });
  const { data: listings, isLoading: isListingsLoading } = useListListings({ officeId, sort: ListingSort.newest, pageSize: 20 }, { query: { enabled: !!officeId } as any });
  
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const createReport = useCreateReport();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  if (isOfficeLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="w-full h-64 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Skeleton className="md:col-span-1 h-96 rounded-xl" />
          <Skeleton className="md:col-span-3 h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">المكتب غير موجود</h1>
      </div>
    );
  }

  const handleReport = () => {
    if (!isAuthenticated) return login();
    if (!reportReason) {
      toast({ title: "يجب اختيار سبب البلاغ", variant: "destructive" });
      return;
    }
    createReport.mutate({
      data: { officeId: office.id, reason: reportReason, details: reportDetails }
    }, {
      onSuccess: () => {
        toast({ title: "تم إرسال البلاغ", description: "سنقوم بمراجعة المكتب" });
        setIsReportOpen(false);
      }
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Office Header Cover */}
      <div className="h-48 md:h-64 bg-primary relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Card Overlay */}
        <div className="relative -mt-20 mb-8 z-10">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white border-4 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                {office.logoUrl ? (
                  <img src={office.logoUrl} alt={office.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-12 h-12 text-primary/30" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {office.name}
                  </h1>
                  {office.verifiedStatus === 'VERIFIED' && (
                    <Badge variant="success" className="gap-1 px-3 py-1 text-sm shrink-0 self-start md:self-center">
                      <ShieldCheck className="w-4 h-4" />
                      مكتب معتمد وموثق
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-muted-foreground mt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{office.city}، {office.governorate}</span>
                  </div>
                  {office.yearsOfExperience && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{office.yearsOfExperience} سنوات خبرة</span>
                    </div>
                  )}
                  {office.ratingAvg && (
                    <div className="flex items-center gap-1.5 text-yellow-600 font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{office.ratingAvg} / 5.0</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border text-center">
                <div className="text-2xl font-bold text-primary mb-1">{office.activeListingsCount}</div>
                <div className="text-xs text-muted-foreground">عقار نشط</div>
              </div>
              <div className="bg-white rounded-xl p-4 border text-center">
                <div className="text-2xl font-bold text-primary mb-1">{office.dealsCount}</div>
                <div className="text-xs text-muted-foreground">صفقة مكتملة</div>
              </div>
            </div>

            {/* Contact */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-lg mb-4 border-b pb-2">التواصل</h3>
                
                <a href={`tel:${office.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="font-medium" dir="ltr">{office.phone}</span>
                </a>
                
                {office.whatsapp && (
                  <a href={`https://wa.me/${office.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-[#25D366] transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/5 flex items-center justify-center group-hover:bg-[#25D366]/10">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="font-medium" dir="ltr">{office.whatsapp}</span>
                  </a>
                )}
                
                {office.email && (
                  <a href={`mailto:${office.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="font-medium break-all">{office.email}</span>
                  </a>
                )}
                
                {office.website && (
                  <a href={office.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="font-medium break-all text-sm">{office.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </CardContent>
            </Card>

            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 gap-2">
                  <Flag className="w-4 h-4" />
                  الإبلاغ عن المكتب
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>الإبلاغ عن مخالفة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">السبب (مطلوب)</label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    >
                      <option value="">اختر السبب...</option>
                      <option value="scam">مكتب وهمي / احتيال</option>
                      <option value="unprofessional">سلوك غير احترافي / تضليل</option>
                      <option value="fake_listings">إعلانات وهمية متعددة</option>
                      <option value="other">سبب آخر</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">تفاصيل إضافية</label>
                    <Textarea 
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReportOpen(false)}>إلغاء</Button>
                  <Button onClick={handleReport} disabled={createReport.isPending} variant="destructive">إرسال</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="listings" className="w-full" dir="rtl">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
                <TabsTrigger value="listings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-semibold text-base">
                  العقارات المتاحة
                </TabsTrigger>
                <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-semibold text-base">
                  عن المكتب
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="listings" className="mt-0 outline-none">
                {isListingsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
                  </div>
                ) : !listings || listings.items.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <h3 className="font-medium text-lg">لا توجد عقارات متاحة حالياً</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listings.items.map(listing => (
                      <ListingCard key={listing.id} listing={listing} showOffice={false} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about" className="mt-0 outline-none">
                <Card>
                  <CardContent className="p-8 prose prose-slate max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {office.bio ? office.bio : "لم يقم المكتب بإضافة نبذة تعريفية بعد."}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
        </div>
      </div>
    </div>
  );
}
