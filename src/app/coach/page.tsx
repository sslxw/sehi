import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";

export default function CoachPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <Header
        title="Sehi Coach"
        subtitle="AI guidance powered by your data, journal, and energy curve"
        compact
      />
      <ChatInterface />
    </div>
  );
}
