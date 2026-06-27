import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh min-h-dvh flex overflow-hidden ambient-bg ltr:flex-row rtl:flex-row-reverse">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-y-auto overscroll-contain">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
