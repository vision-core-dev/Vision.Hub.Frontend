import type { FC, HTMLAttributes } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { Placement } from "@react-types/overlays";
import { LogOut01, Settings01 } from "@untitledui/icons";
import { useFocusManager } from "react-aria";
import type { DialogProps as AriaDialogProps } from "react-aria-components";
import { Button as AriaButton, Dialog as AriaDialog, DialogTrigger as AriaDialogTrigger, Popover as AriaPopover } from "react-aria-components";
import { AvatarLabelGroup } from "@/ui/base/avatar/avatar-label-group";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { cx } from "@/utils/cx";
import {useAuth} from "@/components/System/AuthContext.tsx";
import {useNavigate} from "react-router-dom";

type NavAccountType = {
    /** Unique identifier for the nav item. */
    id: string;
    /** Name of the account holder. */
    name: string;
    /** Email address of the account holder. */
    email: string;
    /** Avatar image URL. */
    avatar: string;
    /** Online status of the account holder. This is used to display the online status indicator. */
    status: "online" | "offline";
};

export const NavAccountMenu = ({
    className,
    ...dialogProps
}: AriaDialogProps & { className?: string; accounts?: NavAccountType[]; selectedAccountId?: string }) => {
    const focusManager = useFocusManager();
    const dialogRef = useRef<HTMLDivElement>(null);

    const {logout} = useAuth();
    const navigate = useNavigate();

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    focusManager?.focusNext({ tabbable: true, wrap: true });
                    break;
                case "ArrowUp":
                    focusManager?.focusPrevious({ tabbable: true, wrap: true });
                    break;
            }
        },
        [focusManager],
    );

    useEffect(() => {
        const element = dialogRef.current;
        if (element) {
            element.addEventListener("keydown", onKeyDown);
        }

        return () => {
            if (element) {
                element.removeEventListener("keydown", onKeyDown);
            }
        };
    }, [onKeyDown]);

    return (
        <AriaDialog
            {...dialogProps}
            ref={dialogRef}
            className={cx("w-66 rounded-xl bg-secondary_alt shadow-lg ring ring-secondary_alt outline-hidden", className)}
        >
            <div className="rounded-xl bg-primary ring-1 ring-secondary">
                <div className="flex flex-col gap-0.5 py-1.5">
                    {/*<NavAccountCardMenuItem label="View profile" icon={User01} shortcut="⌘K->P" />*/}
                    <NavAccountCardMenuItem label="Налаштування" icon={Settings01} onClick={() => navigate("/me/settings")} />
                    {/*<NavAccountCardMenuItem label="Documentation" icon={BookOpen01} />*/}
                </div>
            </div>

            <div className="pt-1 pb-1.5">
                <NavAccountCardMenuItem label="Вийти з акаунту" icon={LogOut01} onClick={logout} />
            </div>
        </AriaDialog>
    );
};

const NavAccountCardMenuItem = ({
    icon: Icon,
    label,
    shortcut,
    ...buttonProps
}: {
    icon?: FC<{ className?: string }>;
    label: string;
    shortcut?: string;
} & HTMLAttributes<HTMLButtonElement>) => {
    return (
        <button {...buttonProps} className={cx("group/item w-full cursor-pointer px-1.5 focus:outline-hidden", buttonProps.className)}>
            <div
                className={cx(
                    "flex w-full items-center justify-between gap-3 rounded-md p-2 group-hover/item:bg-primary_hover",
                    // Focus styles.
                    "outline-focus-ring group-focus-visible/item:outline-2 group-focus-visible/item:outline-offset-2",
                )}
            >
                <div className="flex gap-2 text-sm font-semibold text-secondary group-hover/item:text-secondary_hover">
                    {Icon && <Icon className="size-5 text-fg-quaternary" />} {label}
                </div>

                {shortcut && (
                    <kbd className="flex rounded px-1 py-px font-body text-xs font-medium text-tertiary ring-1 ring-secondary ring-inset">{shortcut}</kbd>
                )}
            </div>
        </button>
    );
};

interface NavAccountCardProps {
    popoverPlacement?: Placement;
    balance: number;
    balanceEnabled: boolean;
}

export const NavAccountCard = ({
                                   popoverPlacement, balance, balanceEnabled
                               }: NavAccountCardProps) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const isDesktop = useBreakpoint("lg");
    const { user, role } = useAuth();

    if (!user || !role) return null;

    return (
        <AriaDialogTrigger>
            <AriaButton
                ref={triggerRef}
                className={cx(
                    "relative flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left",
                    "ring-1 ring-secondary ring-inset",
                    "hover:bg-primary_hover transition",
                    "outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                )}
            >
                <AvatarLabelGroup
                    size="md"
                    src={user.avatar_url}
                    title={user.first_name}
                    subtitle={role.name}
                />

                { balanceEnabled && (
                    <div className="ml-auto text-right">
                        <div className="text-xs text-tertiary">Баланс</div>
                        <div className="text-sm font-semibold text-primary">
                            {balance.toLocaleString("uk-UA")} ₴
                        </div>
                    </div>
                )}
            </AriaButton>

            <AriaPopover
                triggerRef={triggerRef}
                placement={popoverPlacement ?? (isDesktop ? "right bottom" : "top right")}
                offset={8}
            >
                <NavAccountMenu />
            </AriaPopover>
        </AriaDialogTrigger>
    );
};

