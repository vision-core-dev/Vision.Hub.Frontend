import { Tabs } from "@/shared/components/tabs/tabs.tsx";
import { NativeSelect } from "@/shared/ui/select/select-native.tsx";
import type { Key } from "react-aria-components";
import { useState } from "react";
import ProfileSettings from "@/features/user-settings/tabs/ProfileSettings.tsx";
import InterfaceSettings from "@/features/user-settings/tabs/InterfaceSettings.tsx";
import { useAuth } from "@/core/auth/AuthContext.tsx";

const tabs = [
    { id: "profile", label: "Профіль" },
    { id: "interface", label: "Інтерфейс" },
    // { id: "password", label: "Password" },
    // { id: "team", label: "Team" },
    // { id: "notifications", label: "Notifications", badge: 2 },
    // { id: "integrations", label: "Integrations" },
    // { id: "api", label: "API" },
];

export default function UserSettingsPage() {
    const [selectedTabIndex, setSelectedTabIndex] = useState<Key>("profile");
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
            // case "password":
            //     return <PasswordSettings />;
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









