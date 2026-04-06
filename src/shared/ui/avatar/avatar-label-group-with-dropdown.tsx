import { type ReactNode } from "react";
import { Eye, MessageChatSquare } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/shared/utils/cx";
import { Dropdown } from "@/shared/ui/dropdown/dropdown";
import { AvatarLabelGroup } from "./avatar-label-group";
import type { AvatarProps } from "./avatar";
import { useOnlineUsers } from "@/shared/contexts/OnlineUsersContext";

interface AvatarLabelGroupWithDropdownProps extends AvatarProps {
    size: "sm" | "md" | "lg" | "xl";
    title: string | ReactNode;
    subtitle?: string | ReactNode;
    badgeEmoji?: string | null;
    badgeName?: string | null;
    badgeDescription?: string | null;
    className?: string;
    userId?: string;
    onViewProfile?: () => void;
    onWriteMessage?: () => void;
    disableDropdown?: boolean;
    onAvatarClick?: () => void;
}

export const AvatarLabelGroupWithDropdown = ({
    userId,
    onViewProfile,
    onWriteMessage,
    disableDropdown = false,
    className,
    status,
    onAvatarClick,
    ...avatarLabelGroupProps
}: AvatarLabelGroupWithDropdownProps) => {
    const { isUserOnline } = useOnlineUsers();
    const computedStatus = (userId && isUserOnline(userId)) ? "online" : "offline";

    if (disableDropdown) {
        return <AvatarLabelGroup {...avatarLabelGroupProps} status={computedStatus} className={className} />;
    }

    const handleViewProfile = () => {
        if (onViewProfile) {
            onViewProfile();
        } else if (userId) {
            window.location.href = `/users/${userId}`;
        }
    };

    const handleWriteMessage = () => {
        if (onWriteMessage) {
            onWriteMessage();
        } else if (userId) {
            window.location.href = `/messages?userId=${userId}`;
        }
    };

    return (
        <Dropdown.Root>
            <AriaButton
                className={cx(
                    "group relative w-full rounded-lg px-2 py-1.5 text-left outline-hidden transition-colors duration-150 max-w-[300px]",
                    "hover:bg-primary_hover",
                    "pressed:bg-primary_alt",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                    className
                )}
            >
                <AvatarLabelGroup onAvatarClick={onAvatarClick} status={computedStatus} {...avatarLabelGroupProps} className={cx("flex-1", !disableDropdown && "cursor-pointer")} />
            </AriaButton>
            <Dropdown.Popover>
                <Dropdown.Menu>
                    <Dropdown.Item
                        label="Переглянути профіль"
                        icon={Eye}
                        onAction={handleViewProfile}
                    />
                    <Dropdown.Item
                        label="Написати"
                        icon={MessageChatSquare}
                        onAction={handleWriteMessage}
                    />
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.Root>
    );
};

