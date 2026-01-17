import ChatSidebar from "@/features/chat/ChatSidebar.tsx";
import ChatContent from "@/features/chat/ChatContent.tsx";

export default function ChatPage({ children }: { children?: React.ReactNode }) {
    return (
        <div className="flex h-full overflow-hidden">
            <ChatSidebar />
            <ChatContent>
                {children}
            </ChatContent>
        </div>
    );
}









