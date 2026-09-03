import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useListListings, useListGovernorates, useCreateSavedSearch } from "@workspace/api-client-react";
import { ListingSort, PropertyType, ListingType, Finishing } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ListingCard } from "@/components/listing-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PROPERTY_TYPE_AR, LISTING_TYPE_AR, FINISHING_AR } from "@/lib/constants";
import { Filter, Search as SearchIcon, BellRing, SlidersHorizontal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@workspace/replit-auth-web";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Search() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, login } = useAuth();
  const createSavedSearch = useCreateSavedSearch();

  // Parse initial filters from URL
  const initialParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  
  const [filters, setFilters] = useState({
    search: initialParams.get("search") || "",
    listingType: (initialParams.get("listingType") as ListingType) || "",
    propertyType: (initialParams.get("propertyType") as PropertyType) || "",
    governorate: initialParams.get("governorate") || "",
    city: initialParams.get("city") || "",
    priceMin: initialParams.get("priceMin") ? Number(initialParams.get("priceMin")) : undefined as number | undefined,
    priceMax: initialParams.get("priceMax") ? Number(initialParams.get("priceMax")) : undefined as number | undefined,
    roomsMin: initialParams.get("roomsMin") ? Number(initialParams.get("roomsMin")) : undefined as number | undefined,
    sizeMin: initialParams.get("sizeMin") ? Number(initialParams.get("sizeMin")) : undefined as number | undefined,
    verifiedOnly: initialParams.get("verifiedOnly") === "true",
    sort: (initialParams.get("sort") as ListingSort) || ListingSort.newest,
    page: initialParams.get("page") ? Number(initialParams.get("page")) : 1,
  });

  const [savedSearchName, setSavedSearchName] = useState("");
  const [isSavedSearchOpen, setIsSavedSearchOpen] = useState(false);

  // Sync state with URL without full reload (update URL as state changes, debounce the API via TanStack Query)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.listingType) params.set("listingType", filters.listingType);
    if (filters.propertyType) params.set("propertyType", filters.propertyType);
    if (filters.governorate) params.set("governorate", filters.governorate);
    if (filters.city) params.set("city", filters.city);
    if (filters.priceMin) params.set("priceMin", filters.priceMin.toString());
    if (filters.priceMax) params.set("priceMax", filters.priceMax.toString());
    if (filters.roomsMin) params.set("roomsMin", filters.roomsMin.toString());
    if (filters.sizeMin) params.set("sizeMin", filters.sizeMin.toString());
    if (filters.verifiedOnly) params.set("verifiedOnly", "true");
    if (filters.sort && filters.sort !== ListingSort.newest) params.set("sort", filters.sort);
    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());

    setLocation(`/search?${params.toString()}`, { replace: true });
  }, [filters, setLocation]);

  const { data: govData } = useListGovernorates();
  const selectedGov = govData?.find(g => g.name === filters.governorate);
  const cities = selectedGov ? selectedGov.cities : [];

  // API query
  const queryParams = useMemo(() => {
    return {
      search: filters.search || undefined,
      listingType: filters.listingType || undefined,
      propertyType: filters.propertyType || undefined,
      governorate: filters.governorate || undefined,
      city: filters.city || undefined,
      priceMin: filters.priceMin || undefined,
      priceMax: filters.priceMax || undefined,
      roomsMin: filters.roomsMin || undefined,
      sizeMin: filters.sizeMin || undefined,
      verifiedOnly: filters.verifiedOnly || undefined,
      sort: filters.sort || undefined,
      page: filters.page,
      pageSize: 20
    };
  }, [filters]);

  const { data: listingsData, isLoading, isFetching } = useListListings(queryParams);

  const handleSaveSearch = () => {
    if (!isAuthenticated) {
      toast({ title: "يجب تسجيل الدخول", description: "قم بتسجيل الدخول لحفظ البحث" });
      login();
      return;
    }
    if (!savedSearchName.trim()) {
      toast({ title: "اسم البحث مطلوب", variant: "destructive" });
      return;
    }

    createSavedSearch.mutate({
      data: {
        name: savedSearchName,
        filtersJson: queryParams,
        alertsEnabled: true
      }
    }, {
      onSuccess: () => {
        toast({ title: "تم حفظ البحث بنجاح", description: "ستتلقى تنبيهات عند توفر عقارات مطابقة" });
        setIsSavedSearchOpen(false);
        setSavedSearchName("");
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      listingType: "" as ListingType,
      propertyType: "" as PropertyType,
      governorate: "",
      city: "",
      priceMin: undefined as number | undefined,
      priceMax: undefined as number | undefined,
      roomsMin: undefined as number | undefined,
      sizeMin: undefined as number | undefined,
      verifiedOnly: false,
      sort: ListingSort.newest,
      page: 1,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 lg:w-80 shrink-0">
          <div className="bg-white border rounded-xl p-5 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                تصفية النتائج
              </h2>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8 text-muted-foreground">
                مسح الكل
              </Button>
            </div>

            <div className="space-y-6">
              {/* Basic Search */}
              <div className="space-y-2">
                <Input 
                  placeholder="كلمة بحث..." 
                  value={filters.search}
                  onChange={(e) => setFilters(s => ({ ...s, search: e.target.value, page: 1 }))}
                />
              </div>

              <Accordion type="multiple" defaultValue={["location", "type", "price", "specs"]} className="w-full">
                
                {/* Location */}
                <AccordionItem value="location" className="border-0">
                  <AccordionTrigger className="py-2 hover:no-underline font-semibold">الموقع</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <Select value={filters.governorate} onValueChange={(val) => setFilters(s => ({ ...s, governorate: val === "all" ? "" : val, city: "", page: 1 }))}>
                      <SelectTrigger><SelectValue placeholder="المحافظة" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {govData?.map(g => <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    
                    <Select disabled={!filters.governorate} value={filters.city} onValueChange={(val) => setFilters(s => ({ ...s, city: val === "all" ? "" : val, page: 1 }))}>
                      <SelectTrigger><SelectValue placeholder="المدينة" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                {/* Type */}
                <AccordionItem value="type" className="border-0">
                  <AccordionTrigger className="py-2 hover:no-underline font-semibold">النوع</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <Select value={filters.listingType} onValueChange={(val) => setFilters(s => ({ ...s, listingType: val as ListingType, page: 1 }))}>
                      <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {Object.entries(LISTING_TYPE_AR).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    
                    <Select value={filters.propertyType} onValueChange={(val) => setFilters(s => ({ ...s, propertyType: val as PropertyType, page: 1 }))}>
                      <SelectTrigger><SelectValue placeholder="أي نوع عقار" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {Object.entries(PROPERTY_TYPE_AR).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                {/* Price */}
                <AccordionItem value="price" className="border-0">
                  <AccordionTrigger className="py-2 hover:no-underline font-semibold">السعر (جنيه)</AccordionTrigger>
                  <AccordionContent className="flex gap-2 pt-2 items-center">
                    <Input 
                      type="number" 
                      placeholder="من" 
                      value={filters.priceMin || ""}
                      onChange={(e) => setFilters(s => ({ ...s, priceMin: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input 
                      type="number" 
                      placeholder="إلى" 
                      value={filters.priceMax || ""}
                      onChange={(e) => setFilters(s => ({ ...s, priceMax: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Specs */}
                <AccordionItem value="specs" className="border-0">
                  <AccordionTrigger className="py-2 hover:no-underline font-semibold">المواصفات</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <Input 
                      type="number" 
                      placeholder="الحد الأدنى للغرف" 
                      value={filters.roomsMin || ""}
                      onChange={(e) => setFilters(s => ({ ...s, roomsMin: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    />
                    <Input 
                      type="number" 
                      placeholder="المساحة الأدنى (م²)" 
                      value={filters.sizeMin || ""}
                      onChange={(e) => setFilters(s => ({ ...s, sizeMin: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    />
                    
                    <div className="flex items-center space-x-2 space-x-reverse pt-2">
                      <Checkbox 
                        id="verifiedOnly" 
                        checked={filters.verifiedOnly}
                        onCheckedChange={(checked) => setFilters(s => ({ ...s, verifiedOnly: !!checked, page: 1 }))}
                      />
                      <label htmlFor="verifiedOnly" className="text-sm font-medium leading-none cursor-pointer">
                        عقارات موثقة فقط
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                نتائج البحث
                {listingsData && <span className="text-muted-foreground font-normal text-lg mr-2">({listingsData.total})</span>}
              </h1>
              {isFetching && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={filters.sort} onValueChange={(val) => setFilters(s => ({ ...s, sort: val as ListingSort, page: 1 }))}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ListingSort.newest}>الأحدث</SelectItem>
                  <SelectItem value={ListingSort.price_asc}>السعر: من الأقل للأعلى</SelectItem>
                  <SelectItem value={ListingSort.price_desc}>السعر: من الأعلى للأقل</SelectItem>
                  <SelectItem value={ListingSort.size_desc}>المساحة: الأكبر أولاً</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={isSavedSearchOpen} onOpenChange={setIsSavedSearchOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-white">
                    <BellRing className="w-4 h-4" />
                    احفظ البحث
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle>حفظ البحث وتلقي التنبيهات</DialogTitle>
                    <DialogDescription>
                      احفظ معايير البحث الحالية لتتلقى إشعارات عند توفر عقارات جديدة مطابقة.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium mb-2 block">اسم البحث</label>
                    <Input 
                      placeholder="مثال: شقق للشراء في التجمع..." 
                      value={savedSearchName}
                      onChange={(e) => setSavedSearchName(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSavedSearchOpen(false)}>إلغاء</Button>
                    <Button onClick={handleSaveSearch} disabled={createSavedSearch.isPending}>
                      {createSavedSearch.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                      حفظ البحث
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[380px] rounded-xl" />)}
            </div>
          ) : !listingsData || listingsData.items.length === 0 ? (
            <div className="bg-white border rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <SearchIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">لا توجد نتائج مطابقة</h3>
              <p className="text-muted-foreground mb-6">حاول تغيير معايير البحث أو مسح الفلاتر لعرض المزيد من العقارات.</p>
              <Button variant="outline" onClick={clearFilters}>مسح كل الفلاتر</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listingsData.items.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              
              {/* Pagination */}
              {listingsData.total > listingsData.pageSize && (
                <div className="flex justify-center mt-10 gap-2">
                  <Button 
                    variant="outline" 
                    disabled={filters.page === 1}
                    onClick={() => setFilters(s => ({ ...s, page: s.page - 1 }))}
                  >
                    السابق
                  </Button>
                  <div className="flex items-center px-4 font-medium text-sm">
                    صفحة {filters.page} من {Math.ceil(listingsData.total / listingsData.pageSize)}
                  </div>
                  <Button 
                    variant="outline" 
                    disabled={filters.page >= Math.ceil(listingsData.total / listingsData.pageSize)}
                    onClick={() => setFilters(s => ({ ...s, page: s.page + 1 }))}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
