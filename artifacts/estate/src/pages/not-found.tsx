import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center border-dashed">
        <CardContent className="pt-12 pb-12">
          <ShieldAlert className="w-16 h-16 mx-auto text-muted-foreground mb-6 opacity-20" />
          <h1 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h1>
          <p className="text-muted-foreground mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
          <Button asChild>
            <Link href="/">العودة للرئيسية</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
