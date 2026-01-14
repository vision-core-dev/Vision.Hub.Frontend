import ChatSidebar from "@/components/Pages/Chat/ChatSidebar.tsx";
import ChatContent from "@/components/Pages/Chat/ChatContent.tsx";

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
