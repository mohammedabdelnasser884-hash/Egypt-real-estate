import { Link } from "wouter";
import { Listing } from "@workspace/api-client-react";
import { formatEGP, formatNumber } from "@/lib/format";
import { PROPERTY_TYPE_AR, LISTING_TYPE_AR, VERIFIED_STATUS_AR } from "@/lib/constants";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, BedDouble, Bath, Maximize2, MapPin, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateFavorite, useDeleteFavorite, useListFavorites } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useToast } from "@/hooks/use-toast";

interface ListingCardProps {
  listing: Listing;
  showOffice?: boolean;
}

export function ListingCard({ listing, showOffice = true }: ListingCardProps) {
  const { isAuthenticated, login } = useAuth();
  const { data: favorites } = useListFavorites({ query: { enabled: isAuthenticated } as any });
  const createFavorite = useCreateFavorite();
  const deleteFavorite = useDeleteFavorite();
  const { toast } = useToast();

  const isFavorited = favorites?.some((f) => f.listingId === listing.id);
  const favoriteRecord = favorites?.find((f) => f.listingId === listing.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: "يجب تسجيل الدخول", description: "قم بتسجيل الدخول لإضافة العقار للمفضلة" });
      login();
      return;
    }

    if (isFavorited && favoriteRecord) {
      deleteFavorite.mutate({ id: favoriteRecord.id });
    } else {
      createFavorite.mutate({ data: { listingId: listing.id } });
    }
  };

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:shadow-lg flex flex-col h-full bg-white relative">
        {listing.verifiedStatus === 'VERIFIED' && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="success" className="gap-1 shadow-md font-medium text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              عقار موثق
            </Badge>
          </div>
        )}
        <div className="absolute top-3 left-3 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="w-8 h-8 rounded-full shadow-md bg-white/90 hover:bg-white text-muted-foreground"
            onClick={toggleFavorite}
          >
            <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-destructive text-destructive' : ''}`} />
          </Button>
        </div>

        <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
          {listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Building2 className="w-12 h-12 opacity-20" />
            </div>
          )}
          <div className="absolute bottom-3 right-3 flex gap-2">
            <Badge className="bg-black/60 hover:bg-black/70 backdrop-blur-sm text-white border-0">
              {LISTING_TYPE_AR[listing.listingType]}
            </Badge>
            <Badge className="bg-black/60 hover:bg-black/70 backdrop-blur-sm text-white border-0">
              {PROPERTY_TYPE_AR[listing.propertyType]}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-primary line-clamp-1 group-hover:text-primary/80 transition-colors" title={listing.title}>
              {formatEGP(listing.price)}
            </h3>
          </div>
          <p className="text-foreground font-medium text-sm line-clamp-2 mb-3 h-10">
            {listing.title}
          </p>
          
          <div className="flex items-center text-muted-foreground text-xs mb-4 gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{listing.city}، {listing.governorate}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-border/50 text-muted-foreground">
            {listing.rooms != null && (
              <div className="flex flex-col items-center justify-center gap-1 bg-muted/30 p-2 rounded-md">
                <BedDouble className="w-4 h-4 text-primary/70" />
                <span className="text-xs font-semibold">{listing.rooms} غرف</span>
              </div>
            )}
            {listing.bathrooms != null && (
              <div className="flex flex-col items-center justify-center gap-1 bg-muted/30 p-2 rounded-md">
                <Bath className="w-4 h-4 text-primary/70" />
                <span className="text-xs font-semibold">{listing.bathrooms} حمام</span>
              </div>
            )}
            {listing.size != null && (
              <div className="flex flex-col items-center justify-center gap-1 bg-muted/30 p-2 rounded-md">
                <Maximize2 className="w-4 h-4 text-primary/70" />
                <span className="text-xs font-semibold" dir="ltr">{formatNumber(listing.size)} m²</span>
              </div>
            )}
          </div>
        </CardContent>

        {showOffice && listing.office && (
          <CardFooter className="p-3 border-t bg-muted/10">
            <div className="flex items-center gap-2 w-full">
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {listing.office.logoUrl ? (
                  <img src={listing.office.logoUrl} alt={listing.office.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-3 h-3 text-primary" />
                )}
              </div>
              <span className="text-xs font-medium text-muted-foreground line-clamp-1 flex-1">
                {listing.office.name}
              </span>
              {listing.office.verifiedStatus === 'VERIFIED' && (
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
