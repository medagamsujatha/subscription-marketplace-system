import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden relative">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
          {children}
        </main>
      </div>
    </div>
  );
}
