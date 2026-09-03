import { useGetProfile, useListReports, useUpdateReport } from "@workspace/api-client-react";
import { ReportStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { REPORT_STATUS_AR } from "@/lib/constants";
import { Link } from "wouter";

export default function DashboardReports() {
  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const { data: reports, isLoading: isReportsLoading, refetch } = useListReports();
  const updateReport = useUpdateReport();
  const { toast } = useToast();

  if (isProfileLoading || isReportsLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // Double check authorization on client
  if (profile?.role !== 'PLATFORM_ADMIN') {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">غير مصرح</h1>
        <p className="text-muted-foreground">هذه الصفحة مخصصة لمديري النظام فقط.</p>
      </div>
    );
  }

  const handleStatusChange = (id: string, status: ReportStatus) => {
    updateReport.mutate({
      id,
      data: { status }
    }, {
      onSuccess: () => {
        toast({ title: "تم تحديث حالة البلاغ" });
        refetch();
      }
    });
  };

  const getStatusBadgeVariant = (status: ReportStatus) => {
    switch(status) {
      case 'PENDING': return 'destructive';
      case 'REVIEWED': return 'warning';
      case 'RESOLVED': return 'success';
      case 'DISMISSED': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            إدارة البلاغات
          </h1>
          <p className="text-muted-foreground mt-1">مراجعة ومعالجة البلاغات المقدمة من المستخدمين.</p>
        </div>
      </div>

      {!reports || reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
            <p className="text-lg">لا توجد بلاغات مسجلة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <Card key={report.id} className={`overflow-hidden ${report.status === 'PENDING' ? 'border-l-4 border-l-destructive' : ''}`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1 bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(report.status)}>
                          {REPORT_STATUS_AR[report.status]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</span>
                      </div>
                      <div className="text-sm font-bold bg-muted px-2 py-1 rounded">
                        السبب: {report.reason}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">تفاصيل البلاغ:</h4>
                      <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                        {report.details || "لا توجد تفاصيل إضافية"}
                      </p>
                    </div>

                    <div className="flex gap-4 text-sm font-medium">
                      {report.listingId && (
                        <Link href={`/listing/${report.listingId}`} className="text-primary hover:underline">
                          عرض العقار المبلغ عنه
                        </Link>
                      )}
                      {report.officeId && (
                        <Link href={`/office/${report.officeId}`} className="text-primary hover:underline">
                          عرض المكتب المبلغ عنه
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gray-50 md:w-64 border-t md:border-t-0 md:border-r flex flex-col justify-center gap-3">
                    <div className="text-sm font-bold mb-1">تحديث الحالة:</div>
                    <Select 
                      value={report.status} 
                      onValueChange={(val) => handleStatusChange(report.id, val as ReportStatus)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REPORT_STATUS_AR).map(([k, v]) => (
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
