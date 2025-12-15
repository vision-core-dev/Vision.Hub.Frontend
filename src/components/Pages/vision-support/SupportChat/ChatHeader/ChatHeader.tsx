import Button from "../../../../basic/Button/Button.tsx";
import styles from "./ChatHeader.module.css";

interface ChatHeaderProps {
    userId: string | undefined;
    blocked: boolean;
    onBlock: () => void;
}

function ChatHeader({ userId, blocked, onBlock }: ChatHeaderProps) {
    return (
        <div className={styles.header}>
            <strong>Чат з користувачем #{userId}</strong>

            <Button
                variant={blocked ? "secondary" : "danger"}
                onClick={onBlock}
            >
                {blocked ? "Розблокувати" : "Заблокувати"}
            </Button>
        </div>
    );
}

export default ChatHeader;