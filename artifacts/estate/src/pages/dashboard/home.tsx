import { useGetDashboardSummary, useGetProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Inbox, Search as SearchIcon, Bell, Activity } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DashboardHome() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: profile } = useGetProfile();

  if (isLoadingSummary) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl mt-8" />
      </div>
    );
  }

  const statCards = [
    { title: "المفضلة", value: summary?.favoritesCount || 0, icon: Heart, color: "text-red-500", bg: "bg-red-50", link: "/search" },
    { title: "الطلبات النشطة", value: summary?.activeRequestsCount || 0, icon: Inbox, color: "text-blue-500", bg: "bg-blue-50", link: "/dashboard/requests" },
    { title: "عمليات البحث المحفوظة", value: summary?.savedSearchesCount || 0, icon: SearchIcon, color: "text-amber-500", bg: "bg-amber-50", link: "/dashboard/saved-searches" },
    { title: "إشعارات غير مقروءة", value: summary?.unreadNotificationsCount || 0, icon: Bell, color: "text-primary", bg: "bg-primary/10", link: "/dashboard/notifications" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">مرحباً بك، {profile?.firstName || "في لوحة التحكم"}</h1>
        <p className="text-muted-foreground mt-1">نظرة عامة على نشاطك في المنصة.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Link key={idx} href={stat.link}>
            <Card className="hover:border-primary/40 transition-colors cursor-pointer border-border/60 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Favorites */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              أحدث المفضلة
            </h2>
          </div>
          
          {!summary?.recentFavorites || summary.recentFavorites.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>لم تقم بإضافة أي عقارات للمفضلة بعد.</p>
                <Button variant="link" asChild className="mt-2 text-primary">
                  <Link href="/search">تصفح العقارات</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.recentFavorites.map(listing => (
                <ListingCard key={listing.id} listing={listing} showOffice={false} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              أحدث الإشعارات
            </h2>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/dashboard/notifications">عرض الكل</Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0 divide-y">
              {!summary?.recentNotifications || summary.recentNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  لا توجد إشعارات حديثة.
                </div>
              ) : (
                summary.recentNotifications.map(notification => (
                  <div key={notification.id} className={`p-4 text-sm ${!notification.read ? 'bg-primary/5' : ''}`}>
                    <div className="font-bold mb-1 flex items-center gap-2">
                      {!notification.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      {notification.title}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
