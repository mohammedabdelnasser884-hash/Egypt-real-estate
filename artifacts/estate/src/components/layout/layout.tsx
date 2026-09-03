import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { User, LogOut, Home, Search, Building2, MapPin, Inbox, ShieldCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useGetProfile } from "@workspace/api-client-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { data: profile } = useGetProfile({ query: { enabled: isAuthenticated } as any });

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-primary tracking-tight">عقار ثقة</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Search className="w-4 h-4" />
                بحث العقارات
              </Link>
              <Link href="/areas" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                المناطق
              </Link>
              <Link href="/requests" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                طلبات العقارات
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 hover:bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                      {profile?.profileImageUrl ? (
                        <img src={profile.profileImageUrl} alt={profile.firstName || ""} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <span className="hidden sm:inline-block font-medium">
                      {profile?.firstName || user?.email || "حسابي"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer w-full flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      لوحة التحكم
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'OFFICE_ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/office" className="cursor-pointer w-full flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        مكتبي
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={login} variant="default" className="font-semibold shadow-sm">
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="bg-white border-t py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl text-primary">عقار ثقة</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              المنصة الأولى الموثوقة للعقارات في مصر. نربط الباحثين الجادين بأفضل المكاتب العقارية المعتمدة، لضمان تجربة سلسة وآمنة وشفافة.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="text-muted-foreground hover:text-primary transition-colors">بحث العقارات</Link></li>
              <li><Link href="/areas" className="text-muted-foreground hover:text-primary transition-colors">المناطق الرائجة</Link></li>
              <li><Link href="/requests" className="text-muted-foreground hover:text-primary transition-colors">الطلبات المفتوحة</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">دعم العملاء</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">تواصل معنا</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">الشروط والأحكام</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">سياسة الخصوصية</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} عقار ثقة. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
