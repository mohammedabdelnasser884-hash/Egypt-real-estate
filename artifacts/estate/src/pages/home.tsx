import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Search, Building2, TrendingUp, Sparkles, MapPin, Search as SearchIcon } from "lucide-react";
import { useListFeaturedListings, useListDailyFeedListings, useListTrendingAreas } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing-card";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PROPERTY_TYPE_AR, LISTING_TYPE_AR } from "@/lib/constants";
import { formatEGP } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: featured, isLoading: isLoadingFeatured } = useListFeaturedListings({ limit: 6 });
  const { data: feed, isLoading: isLoadingFeed } = useListDailyFeedListings({ limit: 12 });
  const { data: areas, isLoading: isLoadingAreas } = useListTrendingAreas({ limit: 5 });

  const [searchParams, setSearchParams] = useState({
    listingType: "SALE",
    search: ""
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.listingType) params.append("listingType", searchParams.listingType);
    if (searchParams.search) params.append("search", searchParams.search);
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 mix-blend-multiply z-10" />
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            className="w-full h-full object-cover opacity-40"
            alt="Hero Background"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
          <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 border-white/30 backdrop-blur-sm px-4 py-1">
            <ShieldCheck className="w-4 h-4 ml-2" />
            المنصة العقارية الأكثر ثقة في مصر
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl tracking-tight">
            ابحث عن عقارك المثالي <br/> بثقة وأمان
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl leading-relaxed">
            جميع العقارات والمكاتب موثقة ومراجعة. لا وسطاء مجهولين، فقط مكاتب محترفة وملاك حقيقيون.
          </p>

          <Card className="w-full max-w-4xl p-2 bg-white/95 backdrop-blur shadow-2xl rounded-2xl border-white/40">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <div className="w-full md:w-48 shrink-0">
                <Select 
                  value={searchParams.listingType} 
                  onValueChange={(val) => setSearchParams(s => ({...s, listingType: val}))}
                >
                  <SelectTrigger className="h-12 border-0 bg-transparent shadow-none focus:ring-0 font-medium">
                    <SelectValue placeholder="نوع العقار" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="SALE">شراء</SelectItem>
                    <SelectItem value="RENT">إيجار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden md:block w-px bg-border my-2" />
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                </div>
                <Input 
                  placeholder="ابحث بالمنطقة، المحافظة، أو اسم المشروع..." 
                  className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0 pr-10 text-base"
                  value={searchParams.search}
                  onChange={(e) => setSearchParams(s => ({...s, search: e.target.value}))}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 rounded-xl shrink-0 font-bold text-base shadow-md">
                <SearchIcon className="w-5 h-5 ml-2" />
                ابحث الآن
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                عقارات مميزة
              </h2>
              <p className="text-muted-foreground">أفضل العقارات الموثقة والمختارة بعناية</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/search">عرض الكل</Link>
            </Button>
          </div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured?.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Areas */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              المناطق الأكثر طلباً
            </h2>
            <Button variant="ghost" asChild>
              <Link href="/areas">تصفح الدليل</Link>
            </Button>
          </div>

          {isLoadingAreas ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-64 rounded-xl shrink-0" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {areas?.map((area, idx) => (
                <Link key={idx} href={`/search?governorate=${encodeURIComponent(area.governorate)}&city=${encodeURIComponent(area.city)}&area=${encodeURIComponent(area.area)}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
                    <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">{area.area}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{area.city}، {area.governorate}</p>
                      <Badge variant="secondary" className="mt-auto">
                        {area.listingsCount} عقار متاح
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Daily Feed */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">أحدث العقارات المضافة</h2>
            <p className="text-muted-foreground text-lg">
              يتم تحديث هذه القائمة يومياً بأحدث العقارات المعروضة للبيع والإيجار من مكاتبنا المعتمدة.
            </p>
          </div>

          {isLoadingFeed ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {feed?.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Button size="lg" asChild className="rounded-full px-8 shadow-md">
              <Link href="/search">تصفح جميع العقارات</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">لماذا عقار ثقة؟</h2>
            <p className="text-primary-foreground/80 text-lg mb-6 leading-relaxed">
              نحن نؤمن بأن البحث عن عقار يجب أن يكون شفافاً وآمناً. لذلك، نتحقق من كل مكتب وكل إعلان قبل نشره على منصتنا.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-lg backdrop-blur">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span className="font-medium">مكاتب معتمدة</span>
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-lg backdrop-blur">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span className="font-medium">أسعار حقيقية</span>
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-lg backdrop-blur">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">جودة عالية</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex gap-4">
            <Button variant="outline" className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary h-12 px-6">
              سجل كمكتب
            </Button>
            <Button className="bg-white text-primary hover:bg-gray-100 h-12 px-6 shadow-xl" asChild>
              <Link href="/requests">اطلب عقارك الآن</Link>
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl"></div>
      </section>
    </div>
  );
}

