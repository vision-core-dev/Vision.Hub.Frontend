import {type ReactNode, useEffect, useState} from "react";
import { cx } from "@/utils/cx";
import { MobileNavigationHeader } from "../base-components/mobile-header";
import { NavAccountCard } from "../base-components/nav-account-card";
import { NavItemBase } from "../base-components/nav-item";
import { NavList } from "../base-components/nav-list";
import type { NavItemType } from "../config";
import {useNavigate} from "react-router-dom";
import {api} from "@/utils/api.ts";
import {Bell} from "lucide-react";
import NotificationsMenu from "@/components/Layout/Notifications/NotificationsMenu.tsx";
import {Badge} from "@/ui/base/badges/badges.tsx";

interface SidebarNavigationProps {
    /** URL of the currently active item. */
    activeUrl?: string;
    /** List of items to display. */
    items: NavItemType[];
    /** List of footer items to display. */
    footerItems?: NavItemType[];
    /** Feature card to display. */
    featureCard?: ReactNode;
    /** Whether to show the account card. */
    showAccountCard?: boolean;
    /** Whether to hide the right side border. */
    hideBorder?: boolean;
    /** Additional CSS classes to apply to the sidebar. */
    className?: string;
}

export const SidebarNavigationSimple = ({
    activeUrl,
    items,
    footerItems = [],
    featureCard,
    showAccountCard = true,
    hideBorder = false,
    className,
}: SidebarNavigationProps) => {
    const MAIN_SIDEBAR_WIDTH = 296;

    const navigate = useNavigate();

    const [balance, setBalance] = useState<number>(-1);
    const [balanceEnabled, setBalanceEnabled] = useState<boolean>(false);

    const [showNotifs, setShowNotifs] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchMe = async () => {
        try {
            const response = await api.get("/v1/Hub/UserMe/Get");
            const data = await response.json();
            if (response.ok) {
                setUnreadCount(data.unread_count);
                setBalance(data.balance_uah);
                setBalanceEnabled(data.balance_visible);
            }
        } catch (error) {
            console.error("Failed to fetch unread notifications count:", error);
        }
    };


    useEffect(() => {
        fetchMe();
        const interval = setInterval(fetchMe, 7000); // ⏱️ 7 сек (оптимально)
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (unreadCount > 0) {
            document.title = `🔔 (${unreadCount}) Vision Core Hub`;
        } else {
            document.title = "Vision Core Hub";
        }
    }, [unreadCount]);


    const content = (
        <aside
            style={
                {
                    "--width": `${MAIN_SIDEBAR_WIDTH}px`,
                } as React.CSSProperties
            }
            className={cx(
                "flex h-full w-full max-w-full flex-col justify-between overflow-auto bg-primary lg:w-(--width)",
                !hideBorder && "border-secondary md:border-r",
                className,
            )}
        >
            <NavList activeUrl={activeUrl} items={items} />

            <div className="mt-auto flex flex-col gap-4 px-2 py-4 lg:px-4 lg:py-6">

                <ul className="flex flex-col">

                    <li key="notifs" className="py-0.5">
                        <NavItemBase badge={unreadCount > 0 && <Badge color="error">{unreadCount}</Badge>} icon={Bell} type="link" current={showNotifs} onClick={() => setShowNotifs(true)}>
                            Сповіщення
                        </NavItemBase>
                    </li>

                    {footerItems.map((item) => (
                        <li key={item.label} className="py-0.5" data-nav-item>
                            <NavItemBase badge={item.badge} icon={item.icon} type="link" current={item.href === activeUrl} onClick={() => navigate(item.href!)}>
                                {item.label}
                            </NavItemBase>
                        </li>
                    ))}
                </ul>

                {featureCard}

                {showAccountCard && <NavAccountCard balanceEnabled={balanceEnabled} balance={balance} />}
            </div>

            <NotificationsMenu setIsOpen={setShowNotifs} isOpen={showNotifs} onReadAll={() => setUnreadCount(0)} />
        </aside>
    );

    return (
        <>
            <MobileNavigationHeader>{content}</MobileNavigationHeader>

            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex">{content}</div>

            <div
                style={{ paddingLeft: MAIN_SIDEBAR_WIDTH }}
                className="invisible hidden lg:sticky lg:top-0 lg:bottom-0 lg:left-0 lg:block"
            />
        </>
    );
};
