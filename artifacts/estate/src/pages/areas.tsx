import { useListTrendingAreas, useListGovernorates } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEGP } from "@/lib/format";
import { MapPin, TrendingUp, Search, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Areas() {
  const { data: areas, isLoading: isLoadingAreas } = useListTrendingAreas({ limit: 20 });
  const { data: governorates, isLoading: isLoadingGovs } = useListGovernorates();

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1 text-sm">دليل المناطق</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">اكتشف أفضل المناطق للاستثمار والسكن</h1>
          <p className="text-muted-foreground text-lg">
            تصفح الدليل الشامل للمناطق والمحافظات، واكتشف متوسط الأسعار وحجم المعروض في كل منطقة.
          </p>
        </div>

        {/* Trending Areas */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" />
            المناطق الأكثر نشاطاً (التريند)
          </h2>
          
          {isLoadingAreas ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {areas?.map((area, idx) => (
                <Link key={idx} href={`/search?governorate=${encodeURIComponent(area.governorate)}&city=${encodeURIComponent(area.city)}&area=${encodeURIComponent(area.area)}`}>
                  <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer h-full group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{area.area}</h3>
                        <Badge variant="secondary" className="font-mono">{area.listingsCount}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {area.city}، {area.governorate}
                      </div>
                      {area.averagePrice && (
                        <div className="text-sm border-t pt-3 mt-auto">
                          متوسط السعر: <span className="font-bold text-foreground">{formatEGP(area.averagePrice)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Full Directory */}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Building className="w-6 h-6 text-primary" />
            تصفح جميع المحافظات
          </h2>

          {isLoadingGovs ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {governorates?.map((gov) => (
                <Card key={gov.name} className="overflow-hidden">
                  <div className="bg-primary/5 p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg text-primary">{gov.name}</h3>
                    <Badge variant="outline" className="bg-white">{gov.cities.length} مدن</Badge>
                  </div>
                  <CardContent className="p-0">
                    <ul className="divide-y max-h-64 overflow-y-auto">
                      {gov.cities.map((city) => (
                        <li key={city}>
                          <Link 
                            href={`/search?governorate=${encodeURIComponent(gov.name)}&city=${encodeURIComponent(city)}`}
                            className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-sm"
                          >
                            <span className="font-medium text-foreground">{city}</span>
                            <Search className="w-4 h-4 text-muted-foreground opacity-50" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
