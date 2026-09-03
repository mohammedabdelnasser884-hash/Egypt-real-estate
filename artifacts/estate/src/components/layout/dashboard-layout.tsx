import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetProfile } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  List,
  Heart,
  Inbox,
  Search as SearchIcon,
  Bell,
  User,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading, login, logout } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useGetProfile({
    query: { enabled: isAuthenticated } as any,
  });

  if (isAuthLoading || (isAuthenticated && isProfileLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4" dir="rtl">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-3 text-2xl font-bold">سجّل الدخول للوصول إلى لوحة التحكم</h1>
          <p className="mb-6 text-muted-foreground">
            تابع عقاراتك المفضلة وطلباتك وعمليات البحث المحفوظة من مكان واحد.
          </p>
          <Button onClick={login} className="w-full">تسجيل الدخول</Button>
        </div>
      </div>
    );
  }

  const isOfficeAdmin = profile?.role === 'OFFICE_ADMIN';
  const isPlatformAdmin = profile?.role === 'PLATFORM_ADMIN';

  const navItems = [
    { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/dashboard/saved-searches", label: "عمليات البحث", icon: SearchIcon },
    { href: "/dashboard/requests", label: "طلباتي", icon: Inbox },
    { href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
    { href: "/dashboard/profile", label: "حسابي", icon: User },
  ];

  if (isOfficeAdmin) {
    navItems.splice(1, 0,
      { href: "/dashboard/office", label: "ملف المكتب", icon: Building2 },
      { href: "/dashboard/listings", label: "عقارات المكتب", icon: List }
    );
  }

  if (isPlatformAdmin) {
    navItems.push({ href: "/dashboard/reports", label: "البلاغات", icon: ShieldAlert });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-gray-50/50" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-e shrink-0 flex flex-col">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl text-primary">عقار ثقة</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
