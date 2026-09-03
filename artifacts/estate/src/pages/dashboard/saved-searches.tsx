import { useListSavedSearches, useUpdateSavedSearch, useDeleteSavedSearch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Bell, BellOff, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function DashboardSavedSearches() {
  const { data: searches, isLoading, refetch } = useListSavedSearches();
  const updateSearch = useUpdateSavedSearch();
  const deleteSearch = useDeleteSavedSearch();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const handleToggleAlerts = (id: string, currentVal: boolean) => {
    updateSearch.mutate({
      id,
      data: { alertsEnabled: !currentVal }
    }, {
      onSuccess: () => {
        toast({ title: !currentVal ? "تم تفعيل التنبيهات" : "تم إيقاف التنبيهات" });
        refetch();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا البحث؟")) {
      deleteSearch.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم حذف البحث المحفوظ" });
          refetch();
        }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            عمليات البحث المحفوظة
          </h1>
          <p className="text-muted-foreground mt-1">تلقى تنبيهات فورية عند توفر عقارات تطابق معاييرك.</p>
        </div>
        <Button asChild>
          <Link href="/search">بحث جديد</Link>
        </Button>
      </div>

      {!searches || searches.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">لم تقم بحفظ أي عمليات بحث بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searches.map(s => {
            // Build the URL to resume search
            const params = new URLSearchParams();
            if (s.filtersJson) {
              Object.entries(s.filtersJson).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== "") {
                  params.append(k, String(v));
                }
              });
            }
            const searchUrl = `/search?${params.toString()}`;

            return (
              <Card key={s.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1 flex-1 ml-4" title={s.name}>
                      {s.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`w-8 h-8 rounded-full ${s.alertsEnabled ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                        onClick={() => handleToggleAlerts(s.id, s.alertsEnabled)}
                        title={s.alertsEnabled ? "إيقاف التنبيهات" : "تفعيل التنبيهات"}
                      >
                        {s.alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(s.id)}
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-6">
                    تم الحفظ في: {formatDate(s.createdAt)}
                  </div>
                  
                  <Button asChild variant="outline" className="w-full mt-auto">
                    <Link href={searchUrl}>عرض النتائج الحالية</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
