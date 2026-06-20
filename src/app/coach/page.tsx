import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";

export default function CoachPage() {
  return (
    <main className="pb-28 lg:pb-0 flex flex-col lg:h-[calc(100vh-2rem)]">
      <Header title="Sehi Coach" subtitle="AI guidance powered by your data, journal, and energy curve" />
      <ChatInterface />
    </main>
  );
}
