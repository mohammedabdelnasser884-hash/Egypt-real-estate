import { useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { Role } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User } from "lucide-react";

const ROLE_AR: Record<Role, string> = {
  [Role.USER]: "مستخدم عادي",
  [Role.OFFICE_ADMIN]: "مدير مكتب عقاري",
  [Role.PLATFORM_ADMIN]: "مدير النظام",
};

export default function DashboardProfile() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      data: formData
    }, {
      onSuccess: () => {
        toast({ title: "تم تحديث البيانات بنجاح" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الملف الشخصي</h1>
          <p className="text-muted-foreground mt-1">إدارة معلومات حسابك الشخصي.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البيانات الأساسية</CardTitle>
          <CardDescription>قم بتحديث معلوماتك الشخصية للظهور بشكل صحيح على المنصة.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-8 pb-8 border-b">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="font-bold text-lg mb-2">{profile.firstName} {profile.lastName}</div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="font-normal">
                  {ROLE_AR[profile.role]}
                </Badge>
                {profile.role === 'OFFICE_ADMIN' && profile.officeId && (
                  <Badge variant="success" className="gap-1 font-normal">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    مكتب معتمد
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم الأول</label>
                <Input 
                  value={formData.firstName}
                  onChange={e => setFormData(s => ({...s, firstName: e.target.value}))}
                  placeholder="الاسم الأول"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم العائلة</label>
                <Input 
                  value={formData.lastName}
                  onChange={e => setFormData(s => ({...s, lastName: e.target.value}))}
                  placeholder="اسم العائلة"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <Input 
                value={profile.email || ""}
                disabled
                className="bg-muted"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني حالياً.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">رقم الهاتف</label>
              <Input 
                value={formData.phone}
                onChange={e => setFormData(s => ({...s, phone: e.target.value}))}
                placeholder="رقم الهاتف"
                dir="ltr"
                className="text-right"
              />
            </div>

            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
