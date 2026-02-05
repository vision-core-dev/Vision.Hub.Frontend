import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { api } from "@/shared/utils/api";
import {
    File02,
    File04,
    LayoutAlt01,
    MessageChatCircle,
    SearchLg,
    User01,
    CheckSquare
} from "@untitledui/icons";
import { Heading as AriaHeading } from "react-aria-components";
import type { CommandDropdownMenuItemProps } from "@/shared/ui/application/command-menus/base-components/command-menu-item";
import { CommandMenu } from "@/shared/ui/application/command-menus/command-menu";
import { EmptyState } from "@/shared/ui/application/empty-state/empty-state";

interface HubCommandMenuProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

interface SearchResultItem {
    id: string;
    name: string;
    description?: string;
    avatar_url?: string;
}

interface SearchResponse {
    boards: SearchResultItem[];
    tasks: SearchResultItem[];
    docs: SearchResultItem[];
    doc_fragments: SearchResultItem[];
    users: SearchResultItem[];
    files: SearchResultItem[];
    groups: SearchResultItem[];
}

export const HubCommandMenu = ({ isOpen, onOpenChange }: HubCommandMenuProps) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResponse>({
        boards: [],
        tasks: [],
        docs: [],
        doc_fragments: [],
        users: [],
        files: [],
        groups: []
    });
    const [isLoading, setIsLoading] = useState(false);

    const performSearch = async (term: string) => {
        if (!term) {
            setResults({
                boards: [],
                tasks: [],
                docs: [],
                doc_fragments: [],
                users: [],
                files: [],
                groups: []
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.get(`/v1/Hub/Search/?q=${encodeURIComponent(term)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSearch = useDebouncedCallback(performSearch, 300);

    const onInputChange = (value: string) => {
        setQuery(value);
        debouncedSearch(value);
    };

    const mapToItem = (item: SearchResultItem, icon: any): CommandDropdownMenuItemProps => ({
        id: item.id,
        type: "icon",
        label: item.name,
        description: item.description,
        icon: icon,
        size: "sm",
    });

    const menuGroups = [
        { id: "boards", title: "Дошки", items: results.boards.map(i => mapToItem(i, LayoutAlt01)) },
        { id: "tasks", title: "Завдання", items: results.tasks.map(i => mapToItem(i, CheckSquare)) },
        { id: "docs", title: "База знань", items: results.docs.map(i => mapToItem(i, File04)) },
        { id: "doc-fragments", title: "Зміст документів", items: results.doc_fragments.map(i => mapToItem(i, File04)) },
        { id: "users", title: "Користувачі", items: results.users.map(i => mapToItem(i, User01)) },
        { id: "files", title: "Файли", items: results.files.map(i => mapToItem(i, File02)) },
        { id: "groups", title: "Групи", items: results.groups.map(i => mapToItem(i, MessageChatCircle)) },
    ].filter(group => group.items.length > 0);

    return (
        <CommandMenu
            placeholder="Глобальний пошук..."
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            inputValue={query}
            onInputChange={onInputChange}
            filter={false} // Enable server-side filtering
            items={menuGroups}
            onSelectionChange={(keys) => {
                console.log("Selected:", keys);
                onOpenChange(false);
            }}
            emptyState={
                !isLoading && query.length > 0 ? (
                    <EmptyState size="sm" className="overflow-hidden p-6 pb-10">
                        <EmptyState.Header>
                            <EmptyState.FeaturedIcon icon={SearchLg} color="gray" />
                        </EmptyState.Header>

                        <EmptyState.Content className="mb-0">
                            <EmptyState.Title>Нічого не знайдено</EmptyState.Title>
                            <EmptyState.Description>
                                Ми не змогли знайти нічого за вашим запитом. <br />
                                Спробуйте змінити пошуковий запит.
                            </EmptyState.Description>
                        </EmptyState.Content>
                    </EmptyState>
                ) : null
            }
        >
            <AriaHeading slot="title" className="sr-only">
                Глобальний пошук
            </AriaHeading>
            <CommandMenu.Group>
                <CommandMenu.List>
                    {(group) => (
                        <CommandMenu.Section {...group}>
                            {(item) => <CommandMenu.Item key={item.id} {...item} />}
                        </CommandMenu.Section>
                    )}
                </CommandMenu.List>
            </CommandMenu.Group>
        </CommandMenu>
    );
};
