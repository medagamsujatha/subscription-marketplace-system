import { Link } from "wouter";
import { Star, Users, ArrowRight } from "lucide-react";
import type { SubscriptionService } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  service: SubscriptionService;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`} className="group block h-full">
      <div className="bg-card h-full rounded-2xl p-6 border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col relative overflow-hidden">
        
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-border/50 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
            {/* If no real logo, use an icon or initials based on name */}
            <img 
              src={service.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random`} 
              alt={service.name} 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random`;
              }}
            />
          </div>
          {service.isFeatured && (
            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-none shadow-md text-white font-semibold">
              Featured
            </Badge>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {service.categoryName}
            </span>
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {service.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
            {service.description}
          </p>

          <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">${service.priceMonthly}</span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">/mo</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-medium text-foreground">{service.rating.toFixed(1)}</span>
                <span className="text-xs">({service.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Users className="w-3.5 h-3.5" />
                <span>{service.subscriberCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button that slides up on hover */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
          <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 flex items-center justify-center gap-2 hover:bg-primary/90">
            View Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
