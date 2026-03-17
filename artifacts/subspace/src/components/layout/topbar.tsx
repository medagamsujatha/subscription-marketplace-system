import { useGetMarketplaceStats } from "@workspace/api-client-react";
import { Bell, Search, TrendingUp, Users, Box, Star } from "lucide-react";
import { useWebsocketUpdates } from "@/hooks/use-websocket";

export function Topbar() {
  const { data: stats } = useGetMarketplaceStats();
  const { isConnected } = useWebsocketUpdates();

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-6 hidden lg:flex">
        {stats && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Box className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{stats.totalServices}</span> Services
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-foreground">{stats.totalSubscribers.toLocaleString()}</span> Users
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-foreground">{stats.avgRating.toFixed(1)}</span> Avg Rating
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2 text-xs font-medium bg-secondary px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            )}
          </span>
          {isConnected ? 'Live' : 'Connecting...'}
        </div>
        
        <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-background" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-400 to-primary flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-all">
          JD
        </div>
      </div>
    </header>
  );
}
