import { useState } from "react";
import type { Key } from "react-aria-components";
import { Tabs } from "@/shared/components/tabs/tabs";
import { Button } from "@/shared/ui/buttons/button";
import { PlusSquare } from "@untitledui/icons";
import { AvatarLabelGroupWithDropdown } from "@/shared/ui/avatar";

const tabs = [
    { id: "direct", label: "Особисті" },
    { id: "groups", label: "Групові" },
];

export default function ChatSidebar() {
    const [tab, setTab] = useState<Key>("direct");

    return (
        <aside className="flex w-80 flex-col border-secondary md:border-r">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <h3 className="text-sm font-semibold">Чати</h3>
                <Button color="tertiary" iconLeading={PlusSquare} />
            </div>

            {/* Tabs */}
            <div className="px-4">
                <Tabs selectedKey={tab} onSelectionChange={setTab}>
                    <Tabs.List type="underline" items={tabs}>
                        {(tab) => <Tabs.Item {...tab} />}
                    </Tabs.List>
                </Tabs>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-2">
                {tab === "direct" && <ChatList type="direct" />}
                {tab === "groups" && <ChatList type="group" />}
            </div>
        </aside>
    );
}


function ChatList({ type }: { type: "direct" | "group" }) {
    const items = type === "direct"
        ? ["Kyrylo", "Timur", "Support Bot"]
        : ["Vision Core Team", "Support Level 2"];

    return (
        <div className="flex flex-col gap-4 p-2">
            {items.map((name) => (
                <AvatarLabelGroupWithDropdown size="md" title={name} subtitle="Останнє повідомлення" />
            ))}
        </div>
    );
}









