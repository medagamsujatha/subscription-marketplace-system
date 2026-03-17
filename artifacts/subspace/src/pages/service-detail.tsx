import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Check, Star, Users, ExternalLink, ArrowLeft, Shield } from "lucide-react";
import { useGetSubscription, useCreateUserSubscription, getListUserSubscriptionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ServiceDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const { data: service, isLoading, error } = useGetSubscription(Number(id));
  
  const { mutate: subscribe, isPending } = useCreateUserSubscription({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Subscribed Successfully! 🎉",
          description: `You are now subscribed to ${service?.name}.`,
        });
        queryClient.invalidateQueries({ queryKey: getListUserSubscriptionsQueryKey() });
        setLocation("/my-subscriptions");
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Subscription Failed",
          description: err.message || "Something went wrong.",
        });
      }
    }
  });

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (error || !service) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-destructive">Service Not Found</h2>
        <button onClick={() => setLocation("/")} className="mt-4 text-primary hover:underline">Return to Marketplace</button>
      </div>
    );
  }

  const currentPrice = billingCycle === "monthly" ? service.priceMonthly : (service.priceAnnual || service.priceMonthly * 12);
  const hasAnnualDiscount = service.priceAnnual && service.priceAnnual < (service.priceMonthly * 12);
  const discountPercent = hasAnnualDiscount ? Math.round((1 - (service.priceAnnual! / (service.priceMonthly * 12))) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <button 
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to browse
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white shadow-md border border-border p-4 shrink-0">
              <img 
                src={service.logo} 
                alt={service.name} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random`;
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {service.categoryName}
                </span>
                {service.isFeatured && (
                  <span className="text-sm font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-600" /> Featured
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-display font-bold text-foreground mb-3">{service.name}</h1>
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-foreground">{service.rating.toFixed(1)}</span>
                  <span>({service.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-5 h-5" />
                  <span className="font-bold text-foreground">{service.subscriberCount.toLocaleString()}</span>
                  <span>active users</span>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h3 className="text-xl font-bold">About {service.name}</h3>
            <p className="text-lg leading-relaxed text-muted-foreground">{service.description}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Key Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {service.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {service.tags.map((tag, i) => (
                <span key={i} className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Sidebar */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="sticky top-28 bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl shadow-black/5"
          >
            <div className="flex justify-center mb-8">
              <div className="bg-secondary p-1 rounded-xl flex items-center relative">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`relative px-6 py-2 rounded-lg text-sm font-bold z-10 transition-colors ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`relative px-6 py-2 rounded-lg text-sm font-bold z-10 transition-colors flex items-center gap-2 ${billingCycle === "annual" ? "text-foreground" : "text-muted-foreground"}`}
                >
                  Annually
                  {hasAnnualDiscount && (
                    <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      Save {discountPercent}%
                    </span>
                  )}
                </button>
                {/* Sliding indicator */}
                <div 
                  className={`absolute top-1 bottom-1 w-1/2 bg-card rounded-lg shadow-sm border border-border/50 transition-transform duration-300 ease-out z-0`}
                  style={{ transform: billingCycle === "annual" ? "translateX(100%)" : "translateX(0)" }}
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="flex justify-center items-baseline mb-2">
                <span className="text-5xl font-display font-bold text-foreground">${currentPrice}</span>
                <span className="text-muted-foreground font-medium ml-1">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {billingCycle === "annual" ? `Billed $${currentPrice} yearly` : "Billed monthly. Cancel anytime."}
              </p>
            </div>

            <button
              disabled={isPending}
              onClick={() => subscribe({ data: { serviceId: service.id, planType: billingCycle } })}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mb-4"
            >
              {isPending ? "Processing..." : "Subscribe Now"}
            </button>

            {service.website && (
              <a href={service.website} target="_blank" rel="noreferrer" className="w-full py-3 rounded-xl border-2 border-border text-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
                Visit Website <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Secure, 1-click cancellation</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
