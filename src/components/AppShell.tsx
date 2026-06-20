import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh h-dvh lg:h-auto lg:min-h-screen ambient-bg flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden lg:overflow-visible">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
