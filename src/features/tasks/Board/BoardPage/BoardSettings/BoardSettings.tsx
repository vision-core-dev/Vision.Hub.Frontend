import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { Tabs } from "@/shared/components/tabs/tabs";
import { NativeSelect } from "@/shared/ui/select/select-native";
import type { Key } from "react-aria-components";
import { api } from "@/shared/utils/api";

import TagsTab from "./tabs/TagsTab";
import ListsTab from "./tabs/ListsTab";
import BannerTab from "./tabs/BannerTab";
import MembersTab from "./tabs/MembersTab";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";
import type {BoardDetails} from "@/features/tasks/Board/BoardPage/BoardPage.tsx";
import GeneralTab from "@/features/tasks/Board/BoardPage/BoardSettings/tabs/GeneralTab.tsx";

const BOARD_TABS = [
    { id: "general", label: "Загальне" },
    { id: "tags", label: "Теги" },
    { id: "lists", label: "Списки" },
    { id: "banner", label: "Банер" },
    { id: "members", label: "Учасники" },
];

interface Props {
    boardId: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function BoardSettings({ boardId, isOpen, onOpenChange }: Props) {
    const [selectedTab, setSelectedTab] = useState<Key>("general");
    const [data, setData] = useState<BoardDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        setLoading(true);
        const res = await api.get(`/v1/Hub/Boards/${boardId}/GetDetails`);
        const json = await res.json();
        setData(json);
        setLoading(false);
    };

    useEffect(() => {
        fetchSettings();
    }, [boardId]);

    if (loading || !data) return null;

    const {
        tags = [],
        lists = [],
        board,
        users = [],
    } = data;

    const bannerUrl = board?.banner_url ?? "";
    const membersMap = board?.members ?? {};

    const members = users
        .filter((u: any) => membersMap[u.id])
        .map((u: any) => ({
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            avatar_url: u.avatar_url,
            role: membersMap[u.id],
        }));

    const allUsers = users;

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="p-4 w-[900px] max-w-full max-h-[90vh] overflow-y-auto flex flex-col gap-4 bg-primary rounded-lg">

                            {loading && (
                                <LoaderDots />
                            )}

                            <NativeSelect
                                value={selectedTab as string}
                                onChange={(e) => setSelectedTab(e.target.value)}
                                options={BOARD_TABS.map(tab => ({
                                    label: tab.label,
                                    value: tab.id,
                                }))}
                                className="md:hidden"
                            />

                            <Tabs selectedKey={selectedTab} onSelectionChange={setSelectedTab} className="max-md:hidden">
                                <Tabs.List type="underline" items={BOARD_TABS}>
                                    {(tab) => <Tabs.Item {...tab} />}
                                </Tabs.List>
                            </Tabs>

                            {selectedTab === "general" && (
                                <GeneralTab boardId={boardId} boardName={board.name} onUpdate={fetchSettings} />
                            )}

                            {selectedTab === "tags" && (
                                <TagsTab
                                    boardId={boardId}
                                    tags={tags}
                                    onUpdate={fetchSettings}
                                />
                            )}

                            {selectedTab === "lists" && (
                                <ListsTab
                                    boardId={boardId}
                                    lists={lists}
                                    onUpdate={fetchSettings}
                                />
                            )}

                            {selectedTab === "banner" && (
                                <BannerTab
                                    boardId={boardId}
                                    bannerUrl={bannerUrl}
                                    onUpdate={fetchSettings}
                                />
                            )}

                            {selectedTab === "members" && (
                                <MembersTab
                                    boardId={boardId}
                                    members={members}
                                    users={allUsers}
                                    onUpdate={fetchSettings}
                                />
                            )}

                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}








