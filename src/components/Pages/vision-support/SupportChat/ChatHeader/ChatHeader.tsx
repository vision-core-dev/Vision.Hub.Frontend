import Button from "../../../../basic/Button/Button.tsx";
import styles from "./ChatHeader.module.css";
import { Menu } from "lucide-react";

interface ChatHeaderProps {
    userId: string | undefined;
    // blocked: boolean;
    // onBlock: () => void;
    showMenu?: boolean;
    onMenuClick?: () => void;
}

function ChatHeader({ userId, showMenu, onMenuClick }: ChatHeaderProps) {
    return (
        <div className={styles.header}>
            <div>
                {showMenu && (
                    <Button onClick={onMenuClick} variant="secondary">
                        <Menu />
                    </Button>
                )}
                
                <strong>#{userId}</strong>
            </div>

            <Button variant={"danger"}>Заблокувати</Button>

            {/* <Button
                variant={blocked ? "secondary" : "danger"}
                onClick={onBlock}
            >
                {blocked ? "Розблокувати" : "Заблокувати"}
            </Button> */}
        </div>
    );
}

export default ChatHeader;