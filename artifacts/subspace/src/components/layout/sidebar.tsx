import { Link, useLocation } from "wouter";
import { LayoutGrid, Compass, Layers, Settings, LogOut, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Marketplace", href: "/", icon: Compass },
  { name: "My Subscriptions", href: "/my-subscriptions", icon: LayoutGrid },
  { name: "Categories", href: "/categories", icon: Layers },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ease-in-out border-r border-sidebar-border hidden md:flex">
      <div className="h-20 flex items-center px-6 border-b border-sidebar-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Hexagon className="w-6 h-6 fill-current" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">SubSpace</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
        <div className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-4 px-2">
          Discover
        </div>
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
              )} />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border/50">
        <button className="flex items-center gap-3 px-3 py-3 w-full rounded-xl font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group">
          <LogOut className="w-5 h-5 text-sidebar-foreground/50 group-hover:text-destructive transition-transform group-hover:-translate-x-1" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
