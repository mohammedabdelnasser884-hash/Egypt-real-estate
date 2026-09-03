import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, CheckCircle2, Clock } from "lucide-react";
import { formatDate } from "@/lib/format";
import { NOTIFICATION_TYPE_AR } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export default function DashboardNotifications() {
  const { data: notifications, isLoading, refetch } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleMarkAll = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => refetch()
    });
  };

  const handleMarkOne = (id: string) => {
    markRead.mutate({ id }, {
      onSuccess: () => {
        // Optimistic update could go here, but refetch is fine
        refetch();
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            الإشعارات
            {unreadCount > 0 && (
              <Badge className="mr-2 px-2 py-0.5 rounded-full">{unreadCount} جديد</Badge>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={markAllRead.isPending}>
            <CheckCircle2 className="w-4 h-4 ml-2" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">لا توجد إشعارات حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <Card key={notif.id} className={`transition-colors ${!notif.read ? 'border-primary/30 bg-primary/5' : 'bg-white'}`}>
              <CardContent className="p-4 sm:p-5 flex gap-4">
                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center mt-1 ${!notif.read ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`font-bold ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs text-muted-foreground font-normal bg-white">
                      {NOTIFICATION_TYPE_AR[notif.type]}
                    </Badge>
                    {!notif.read && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => handleMarkOne(notif.id)}>
                        <Check className="w-3.5 h-3.5 ml-1" />
                        تحديد كمقروء
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
