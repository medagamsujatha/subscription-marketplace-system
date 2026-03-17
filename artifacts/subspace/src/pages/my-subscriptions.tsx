import { useListUserSubscriptions, useCancelUserSubscription, getListUserSubscriptionsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Calendar, CreditCard, ExternalLink, XCircle, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function MySubscriptions() {
  const { data: subscriptions, isLoading } = useListUserSubscriptions();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: cancelSub, isPending: isCancelling } = useCancelUserSubscription({
    mutation: {
      onSuccess: () => {
        toast({ title: "Subscription Cancelled" });
        queryClient.invalidateQueries({ queryKey: getListUserSubscriptionsQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Failed to cancel subscription" });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-10 w-64 bg-card animate-pulse rounded-lg" />
        <div className="grid gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-card animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const activeSubs = subscriptions?.filter(s => s.status === 'active') || [];
  const cancelledSubs = subscriptions?.filter(s => s.status === 'cancelled') || [];
  const totalMonthlyCost = activeSubs.reduce((acc, sub) => {
    return acc + (sub.planType === 'monthly' ? sub.price : sub.price / 12);
  }, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">My Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Manage your active plans and billing</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 text-primary px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="bg-primary p-2 rounded-xl text-white">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium opacity-80">Estimated Monthly Cost</div>
            <div className="text-2xl font-bold">${totalMonthlyCost.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {subscriptions?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutGrid className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No active subscriptions</h2>
          <p className="text-muted-foreground mb-6">You aren't subscribed to any services yet.</p>
          <Link href="/" className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors inline-block shadow-lg shadow-primary/20">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Subscriptions */}
          {activeSubs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Active Plans
              </h2>
              <div className="grid gap-4">
                {activeSubs.map((sub) => (
                  <motion.div 
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-secondary p-2 shrink-0 border border-border/50">
                        <img src={sub.serviceLogo} alt={sub.serviceName} className="w-full h-full object-contain rounded-lg" 
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.serviceName)}&background=random`; }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/services/${sub.serviceId}`} className="text-lg font-bold hover:text-primary transition-colors">
                            {sub.serviceName}
                          </Link>
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-md font-medium text-muted-foreground">
                            {sub.categoryName}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Started {format(new Date(sub.startedAt), 'MMM d, yyyy')}</span>
                          {sub.renewsAt && (
                            <span className="flex items-center gap-1.5 text-primary"><CreditCard className="w-4 h-4" /> Renews {format(new Date(sub.renewsAt), 'MMM d')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/3">
                      <div className="text-right">
                        <div className="text-xl font-bold">${sub.price}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{sub.planType}</div>
                      </div>
                      
                      <button
                        disabled={isCancelling}
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel your ${sub.serviceName} subscription?`)) {
                            cancelSub({ id: sub.id });
                          }
                        }}
                        className="px-4 py-2 text-sm font-bold text-destructive bg-destructive/10 hover:bg-destructive hover:text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Subscriptions */}
          {cancelledSubs.length > 0 && (
            <div className="space-y-4 opacity-75">
              <h2 className="text-xl font-bold flex items-center gap-2 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
                Cancelled Plans
              </h2>
              <div className="grid gap-4">
                {cancelledSubs.map((sub) => (
                  <div key={sub.id} className="bg-card/50 border border-border p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary p-1 grayscale">
                         <img src={sub.serviceLogo} alt={sub.serviceName} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{sub.serviceName}</div>
                        <div className="text-xs text-muted-foreground">
                          Cancelled on {sub.cancelledAt ? format(new Date(sub.cancelledAt), 'MMM d, yyyy') : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                    <Link href={`/services/${sub.serviceId}`} className="text-sm font-medium text-primary hover:underline">
                      Resubscribe
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Quick import hack for icon used in empty state
import { LayoutGrid } from "lucide-react";
