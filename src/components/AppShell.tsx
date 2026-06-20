import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen ambient-bg flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 pb-28 lg:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
