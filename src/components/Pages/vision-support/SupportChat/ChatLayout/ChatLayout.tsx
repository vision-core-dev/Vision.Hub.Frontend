import { useParams } from "react-router-dom";
import styles from "./ChatLayout.module.css";
import ChatHeader from "../ChatHeader/ChatHeader.tsx";
import ChatMessages from "../ChatMessages/ChatMessages.tsx";
import ChatFooter from "../ChatFooter/ChatFooter.tsx";
import {api} from "../../../../../utils/api.ts";

function SupportChat() {
    const { telegramUserId } = useParams();

    const sendAnswer = async (text: string | null, files: File[]) => {
        const form = new FormData();

        form.append("telegram_user_id", String(telegramUserId));
        if (text) form.append("text", text);

        files.forEach(f => form.append("files", f));

        await api.post("/v1/VisionSupport/SendAnswer", form);
    };

    return (
        <div className={styles.chat}>
            <ChatHeader userId={telegramUserId} blocked={false} onBlock={() => {}} />
            <ChatMessages userId={telegramUserId} />
            <ChatFooter onSend={sendAnswer} />
        </div>
    );
}

export default SupportChat;