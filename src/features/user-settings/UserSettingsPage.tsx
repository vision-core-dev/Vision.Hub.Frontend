import { Tabs } from "@/shared/components/tabs/tabs.tsx";
import { NativeSelect } from "@/shared/ui/select/select-native.tsx";
import type { Key } from "react-aria-components";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProfileSettings from "@/features/user-settings/tabs/ProfileSettings.tsx";
import InterfaceSettings from "@/features/user-settings/tabs/InterfaceSettings.tsx";
import LinkedAccountsSettings from "@/features/user-settings/tabs/LinkedAccountsSettings.tsx";
import NotificationsSettings from "@/features/user-settings/tabs/NotificationsSettings.tsx";
import { useAuth } from "@/core/auth/AuthContext.tsx";

const tabs = [
    { id: "profile", label: "Профіль" },
    { id: "interface", label: "Інтерфейс" },
    { id: "accounts", label: "Акаунти" },
    { id: "notifications", label: "Сповіщення" },
];

export default function UserSettingsPage() {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get("tab") || "profile";
    const [selectedTabIndex, setSelectedTabIndex] = useState<Key>(initialTab);
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const renderTab = () => {
        switch (selectedTabIndex) {
            case "profile":
                return <ProfileSettings user={user} />;
            case "interface":
                return <InterfaceSettings />;
            case "accounts":
                return <LinkedAccountsSettings user={user} />;
            case "notifications":
                return <NotificationsSettings user={user} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col p-8 gap-6">

            <NativeSelect
                aria-label="Tabs"
                value={selectedTabIndex as string}
                onChange={(event) => setSelectedTabIndex(event.target.value)}
                options={tabs.map((tab) => ({ label: tab.label, value: tab.id }))}
                className="w-80 md:hidden"
            />
            <Tabs selectedKey={selectedTabIndex} onSelectionChange={setSelectedTabIndex} className="w-max max-md:hidden">
                <Tabs.List type="underline" items={tabs}>
                    {(tab) => <Tabs.Item {...tab} />}
                </Tabs.List>
            </Tabs>

            <div className="flex flex-col gap-6 max-w-[400px]">
                {renderTab()}
            </div>

        </div>

    );
}









