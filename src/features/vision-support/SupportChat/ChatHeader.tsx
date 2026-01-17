import { Menu } from "lucide-react";
import {Button} from "@/shared/ui/buttons/button.tsx";

interface ChatHeaderProps {
    userId: string | undefined;
    // blocked: boolean;
    // onBlock: () => void;
    showMenu?: boolean;
    onMenuClick?: () => void;
}

function ChatHeader({ userId, showMenu, onMenuClick }: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center gap-4">
                {showMenu && (
                    <Button onClick={onMenuClick} color="secondary" iconLeading={Menu} />
                )}
                
                <strong>#{userId}</strong>
            </div>

            {/*<Button color="primary-destructive">Заблокувати</Button>*/}
        </div>
    );
}

export default ChatHeader;








