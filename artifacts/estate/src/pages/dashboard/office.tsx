import { useState, useEffect } from "react";
import { useGetProfile, useGetOffice, useCreateOffice, useUpdateOffice, useListGovernorates } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building2, PlusCircle, ShieldAlert } from "lucide-react";

export default function DashboardOffice() {
  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const officeId = profile?.officeId;
  const { data: office, isLoading: isOfficeLoading, refetch: refetchOffice } = useGetOffice(officeId as string, { query: { enabled: !!officeId } as any });
  const { data: govData } = useListGovernorates();
  
  const createOffice = useCreateOffice();
  const updateOffice = useUpdateOffice();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address: "",
    governorate: "",
    city: "",
    yearsOfExperience: "",
    bio: "",
  });

  const selectedGov = govData?.find(g => g.name === formData.governorate);
  const cities = selectedGov ? selectedGov.cities : [];

  useEffect(() => {
    if (office) {
      setFormData({
        name: office.name || "",
        logoUrl: office.logoUrl || "",
        phone: office.phone || "",
        whatsapp: office.whatsapp || "",
        email: office.email || "",
        website: office.website || "",
        address: office.address || "",
        governorate: office.governorate || "",
        city: office.city || "",
        yearsOfExperience: office.yearsOfExperience?.toString() || "",
        bio: office.bio || "",
      });
    }
  }, [office]);

  if (isProfileLoading || isOfficeLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.governorate || !formData.city) {
      toast({ title: "الرجاء إكمال الحقول المطلوبة", variant: "destructive" });
      return;
    }

    const payload = {
      name: formData.name,
      logoUrl: formData.logoUrl || undefined,
      phone: formData.phone,
      whatsapp: formData.whatsapp || undefined,
      email: formData.email || undefined,
      website: formData.website || undefined,
      address: formData.address || undefined,
      governorate: formData.governorate,
      city: formData.city,
      yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
      bio: formData.bio || undefined,
    };

    if (office) {
      updateOffice.mutate({ id: office.id, data: payload }, {
        onSuccess: () => {
          toast({ title: "تم تحديث بيانات المكتب بنجاح" });
          refetchOffice();
        }
      });
    } else {
      createOffice.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "تم إنشاء المكتب بنجاح" });
          window.location.reload(); // Hard reload to fetch new profile with officeId
        }
      });
    }
  };

  const isPending = createOffice.isPending || updateOffice.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            {office ? "إدارة ملف المكتب" : "إنشاء مكتب جديد"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {office ? "تحديث المعلومات التي تظهر للعملاء في صفحة مكتبك." : "قم بإدخال بيانات مكتبك للبدء في إضافة العقارات."}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-bold text-lg">البيانات الأساسية</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم المكتب (مطلوب)</label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData(s => ({...s, name: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف الأساسي (مطلوب)</label>
                  <Input 
                    value={formData.phone}
                    onChange={e => setFormData(s => ({...s, phone: e.target.value}))}
                    dir="ltr" className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">رابط الشعار (Logo URL)</label>
                  <Input 
                    value={formData.logoUrl}
                    onChange={e => setFormData(s => ({...s, logoUrl: e.target.value}))}
                    dir="ltr" className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الواتساب</label>
                  <Input 
                    value={formData.whatsapp}
                    onChange={e => setFormData(s => ({...s, whatsapp: e.target.value}))}
                    dir="ltr" className="text-right"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-b pb-6">
              <h3 className="font-bold text-lg">الموقع والمقر</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">المحافظة (مطلوب)</label>
                  <Select 
                    value={formData.governorate} 
                    onValueChange={(val) => setFormData(s => ({ ...s, governorate: val, city: "" }))}
                  >
                    <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                    <SelectContent>
                      {govData?.map(g => <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">المدينة (مطلوب)</label>
                  <Select 
                    value={formData.city} 
                    disabled={!formData.governorate}
                    onValueChange={(val) => setFormData(s => ({ ...s, city: val }))}
                  >
                    <SelectTrigger><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                    <SelectContent>
                      {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">العنوان التفصيلي</label>
                  <Input 
                    value={formData.address}
                    onChange={e => setFormData(s => ({...s, address: e.target.value}))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-b pb-6">
              <h3 className="font-bold text-lg">معلومات إضافية</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني للمكتب</label>
                  <Input 
                    value={formData.email}
                    onChange={e => setFormData(s => ({...s, email: e.target.value}))}
                    dir="ltr" className="text-right" type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الموقع الإلكتروني</label>
                  <Input 
                    value={formData.website}
                    onChange={e => setFormData(s => ({...s, website: e.target.value}))}
                    dir="ltr" className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">سنوات الخبرة</label>
                  <Input 
                    value={formData.yearsOfExperience}
                    onChange={e => setFormData(s => ({...s, yearsOfExperience: e.target.value}))}
                    type="number"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">نبذة عن المكتب</label>
                  <Textarea 
                    value={formData.bio}
                    onChange={e => setFormData(s => ({...s, bio: e.target.value}))}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
              {isPending ? "جاري الحفظ..." : office ? "حفظ التحديثات" : "إنشاء المكتب"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
