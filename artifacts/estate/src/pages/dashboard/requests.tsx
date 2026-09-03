import { useListRequests, useUpdateRequest } from "@workspace/api-client-react";
import { RequestStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, CheckCircle2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate } from "@/lib/format";
import { PROPERTY_TYPE_AR, LISTING_TYPE_AR, REQUEST_STATUS_AR } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useGetCurrentAuthUser } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardRequests() {
  const { data: authEnv, isLoading: isAuthLoading } = useGetCurrentAuthUser();
  const userId = authEnv?.user?.id;
  
  // Actually we should filter by userId if the backend supports it. 
  // Let's assume the API returns all, and we filter client side for now.
  const { data: allRequests, isLoading: isRequestsLoading, refetch } = useListRequests();
  const myRequests = allRequests?.filter(r => r.userId === userId) || [];

  const updateRequest = useUpdateRequest();
  const { toast } = useToast();

  if (isAuthLoading || isRequestsLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const handleStatusChange = (id: string, status: RequestStatus) => {
    updateRequest.mutate({
      id,
      data: { status }
    }, {
      onSuccess: () => {
        toast({ title: "تم تحديث حالة الطلب" });
        refetch();
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Inbox className="w-6 h-6 text-primary" />
          طلباتي العقارية
        </h1>
        <p className="text-muted-foreground mt-1">إدارة الطلبات التي قمت بنشرها للمكاتب العقارية.</p>
      </div>

      {!myRequests || myRequests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">لم تقم بإضافة أي طلبات بعد.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myRequests.map(req => (
            <Card key={req.id} className="overflow-hidden hover:border-primary/30 transition-colors">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-primary">{req.title}</h3>
                    <Badge variant={req.status === 'OPEN' ? 'default' : req.status === 'MATCHED' ? 'success' : 'secondary'}>
                      {REQUEST_STATUS_AR[req.status]}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{LISTING_TYPE_AR[req.listingType]}</Badge>
                    <Badge variant="outline">{PROPERTY_TYPE_AR[req.propertyType]}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      <MapPin className="w-3.5 h-3.5" />
                      {req.city}، {req.governorate}
                    </div>
                  </div>

                  {req.budgetMax && (
                    <div className="text-sm font-medium mb-3">
                      الميزانية القصوى: {formatNumber(req.budgetMax)} ج.م
                    </div>
                  )}

                  {req.notes && (
                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded mt-2">
                      {req.notes}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground mt-4">
                    تاريخ النشر: {formatDate(req.createdAt)}
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t sm:border-t-0 sm:border-r w-full sm:w-64 flex flex-col justify-center gap-4">
                  <div className="text-center mb-2">
                    <div className="text-3xl font-bold text-primary">{req.matchedCount}</div>
                    <div className="text-sm text-muted-foreground">عروض مطابقة</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">تحديث حالة الطلب:</label>
                    <Select 
                      value={req.status} 
                      onValueChange={(val) => handleStatusChange(req.id, val as RequestStatus)}
                    >
                      <SelectTrigger className="bg-white h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REQUEST_STATUS_AR).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
