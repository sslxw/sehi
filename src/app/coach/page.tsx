import { ChatInterface } from "@/components/ChatInterface";
import { CoachHeader } from "@/components/CoachHeader";

export default function CoachPage() {
  return (
    <div className="flex flex-col h-dvh min-h-0 overflow-hidden">
      <CoachHeader />
      <ChatInterface />
    </div>
  );
}
