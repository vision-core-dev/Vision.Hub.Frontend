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
    className?: string;
    /** User ID for profile navigation */
    userId?: string;
    /** Callback when "View Profile" is clicked */
    onViewProfile?: () => void;
    /** Callback when "Write Message" is clicked */
    onWriteMessage?: () => void;
    /** If true, disables the dropdown functionality */
    disableDropdown?: boolean;
}

export const AvatarLabelGroupWithDropdown = ({
    userId,
    onViewProfile,
    onWriteMessage,
    disableDropdown = false,
    className,
    status,
    ...avatarLabelGroupProps
}: AvatarLabelGroupWithDropdownProps) => {
    const { isUserOnline } = useOnlineUsers();

    // Auto-detect online status if not explicitly provided
    const computedStatus = status || (userId && isUserOnline(userId) ? "online" : "offline");

    // If dropdown is disabled, just render the AvatarLabelGroup
    if (disableDropdown) {
        return <AvatarLabelGroup {...avatarLabelGroupProps} status={computedStatus} className={className} />;
    }

    const handleViewProfile = () => {
        if (onViewProfile) {
            onViewProfile();
        } else if (userId) {
            // Default navigation to user profile
            window.location.href = `/users/${userId}`;
        }
    };

    const handleWriteMessage = () => {
        if (onWriteMessage) {
            onWriteMessage();
        } else if (userId) {
            // Default navigation to messages
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
                <AvatarLabelGroup {...avatarLabelGroupProps} className={cx("flex-1", !disableDropdown && "cursor-pointer")} />
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

