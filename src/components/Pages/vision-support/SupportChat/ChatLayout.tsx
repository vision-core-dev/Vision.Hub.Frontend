import { useParams, useOutletContext } from "react-router-dom";
import ChatHeader from "./ChatHeader.tsx";
import {api} from "@/utils/api.ts";
import {ChatMessagesProvider} from "@/components/Pages/vision-support/SupportChat/ChatMessagesProvider.tsx";
import {ChatComposer} from "@/components/Pages/vision-support/SupportChat/ChatComposer.tsx";

type LayoutCtx = {
    isMobile: boolean;
    openSidebar: () => void;
};

function SupportChat() {
    const { telegramUserId } = useParams();
    const { isMobile, openSidebar } = useOutletContext<LayoutCtx>();

    const sendAnswer = async (text: string | null, files: File[]) => {
        const form = new FormData();

        form.append("telegram_user_id", String(telegramUserId));
        if (text) form.append("text", text);
        files.forEach(f => form.append("files", f));

        await api.post("/v1/VisionSupport/SendAnswer", form);
    };

    return (
        <div className="flex h-full w-full flex-col">
            <ChatHeader
                userId={telegramUserId}
                showMenu={isMobile}
                onMenuClick={openSidebar}
            />

            <ChatMessagesProvider telegramUserId={telegramUserId} />

            <ChatComposer onSend={sendAnswer} />
        </div>
    );
}


export default SupportChat;