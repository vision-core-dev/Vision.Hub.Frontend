import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api";
import {
    File02,
    File04,
    LayoutAlt01,
    MessageChatCircle,
    SearchLg,
    User01,
    CheckSquare,
    Clock
} from "@untitledui/icons";
import { Heading as AriaHeading } from "react-aria-components";
import type { CommandDropdownMenuItemProps } from "@/shared/ui/application/command-menus/base-components/command-menu-item";
import { CommandMenu } from "@/shared/ui/application/command-menus/command-menu";
import { EmptyState } from "@/shared/ui/application/empty-state/empty-state";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";

interface HubCommandMenuProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

interface SearchResultItem {
    id: string;
    name: string;
    description?: string;
    avatar_url?: string;
    board_id?: string;
}

interface RecentItem extends SearchResultItem {
    type: string;
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
    const navigate = useNavigate();
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
    const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("hub_recent_search");
        if (stored) {
            try {
                setRecentItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse recent items", e);
            }
        }
    }, []);

    const performSearch = async (term: string) => {
        if (!term || term.length < 3) {
            setResults({
                boards: [],
                tasks: [],
                docs: [],
                doc_fragments: [],
                users: [],
                files: [],
                groups: []
            });
            setIsLoading(false);
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
        if (value.length >= 3) {
            // Only set loading if we are actually going to search
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
        debouncedSearch(value);
    };

    const Highlight = ({ text, term }: { text: string; term: string }) => {
        if (!term.trim()) return <>{text}</>;
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? <mark key={i} className="bg-yellow-200 text-inherit rounded-sm px-0.5 mx-0.5">{part}</mark> : part
                )}
            </span>
        );
    };

    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const mapToItem = (item: SearchResultItem, icon: any, type: string): CommandDropdownMenuItemProps & { children?: React.ReactNode } => {
        const cleanName = stripHtml(item.name);

        const commonProps = {
            id: `${type}:${item.id}`,
            label: cleanName,
            description: item.description,
            size: "sm" as const,
            children: (type === "doc" || type === "doc-fragments")
                ? <Highlight text={cleanName} term={query} />
                : undefined
        };

        if (type === "user" && item.avatar_url) {
            return {
                ...commonProps,
                type: "avatar",
                src: item.avatar_url,
                alt: item.name
            };
        }

        return {
            ...commonProps,
            type: "icon",
            icon: icon
        };
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case "board": return LayoutAlt01;
            case "task": return CheckSquare;
            case "doc": return File04;
            case "doc-fragments": return File04;
            case "user": return User01;
            case "file": return File02;
            case "group": return MessageChatCircle;
            default: return Clock;
        }
    };

    let menuGroups;
    if (query.length === 0) {
        menuGroups = [
            {
                id: "recent",
                title: "Нещодавно",
                items: recentItems.map(i => mapToItem(i, getIconForType(i.type), i.type))
            }
        ].filter(group => group.items.length > 0);
    } else {
        menuGroups = [
            { id: "boards", title: "Дошки", items: results.boards.map(i => mapToItem(i, LayoutAlt01, "board")) },
            { id: "tasks", title: "Завдання", items: results.tasks.map(i => mapToItem(i, CheckSquare, "task")) },
            { id: "docs", title: "База знань", items: results.docs.map(i => mapToItem(i, File04, "doc")) },
            { id: "doc-fragments", title: "Зміст документів", items: results.doc_fragments.map(i => mapToItem(i, File04, "doc-fragments")) },
            { id: "users", title: "Користувачі", items: results.users.map(i => mapToItem(i, User01, "user")) },
            { id: "files", title: "Файли", items: results.files.map(i => mapToItem(i, File02, "file")) },
            { id: "groups", title: "Групи", items: results.groups.map(i => mapToItem(i, MessageChatCircle, "group")) },
        ].filter(group => group.items.length > 0);
    }

    const saveRecentItem = (type: string, id: string) => {
        // Find item in results (if searching) or just keep existing if clicking recent
        // If clicking recent, it's already in recentItems, just move to top?

        let item: SearchResultItem | undefined;

        if (query.length === 0) {
            // Clicked on a recent item
            item = recentItems.find(i => i.id === id && i.type === type);
        } else {
            // Find in results
            if (type === "board") item = results.boards.find(i => i.id === id);
            else if (type === "task") item = results.tasks.find(i => i.id === id);
            else if (type === "doc") item = results.docs.find(i => i.id === id);
            else if (type === "doc-fragments") item = results.doc_fragments.find(i => i.id === id);
            else if (type === "user") item = results.users.find(i => i.id === id);
            else if (type === "file") item = results.files.find(i => i.id === id);
            else if (type === "group") item = results.groups.find(i => i.id === id);
        }

        if (item) {
            const newItem: RecentItem = { ...item, type: type === "doc-fragments" ? "doc" : type };
            // Normalize doc-fragments to doc for history

            setRecentItems(prev => {
                const filtered = prev.filter(i => !(i.id === newItem.id && i.type === newItem.type));
                const updated = [newItem, ...filtered].slice(0, 5); // Limit to 5
                localStorage.setItem("hub_recent_search", JSON.stringify(updated));
                return updated;
            });
        }
    };

    const handleSelection = (key: string | number) => {
        const [type, id] = String(key).split(":");

        saveRecentItem(type, id);

        switch (type) {
            case "board":
                navigate(`/boards/b/${id}`);
                break;
            case "task":
                // For tasks, we need board_id. 
                // If it's in recent items, it should have it tailored.
                // Re-find to be sure
                let item = results.tasks.find(t => t.id === id);
                if (!item && query.length === 0) {
                    item = recentItems.find(t => t.id === id && t.type === "task");
                }

                if (item && item.board_id) {
                    navigate(`/boards/b/${item.board_id}/t/${id}`);
                } else {
                    console.error("Task missing board_id or not found in current results");
                }
                break;
            case "doc":
            case "doc-fragments": // Should behave as doc
                navigate(`/knowledge/d/${id}?highlight=${encodeURIComponent(query)}`);
                break;
            case "user":
                navigate(`/users/u/${id}`);
                break;
            case "group":
                navigate(`/chat/${id}`);
                break;
            default:
                console.warn("Unknown item type:", type);
        }
        onOpenChange(false);
        setQuery("");
    };

    const renderEmptyState = () => {
        if (isLoading) {
            return (
                <div className="flex h-32 items-center justify-center">
                    <LoaderDots size="lg" />
                </div>
            );
        }

        if (query.length > 0 && query.length < 3) {
            return (
                <EmptyState size="sm" className="overflow-hidden p-6 pb-10">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon icon={SearchLg} color="gray" />
                    </EmptyState.Header>

                    <EmptyState.Content className="mb-0">
                        <EmptyState.Title>Введіть більше символів</EmptyState.Title>
                        <EmptyState.Description>
                            Для пошуку потрібно ввести мінімум 3 символи.
                        </EmptyState.Description>
                    </EmptyState.Content>
                </EmptyState>
            );
        }

        if (query.length >= 3 && menuGroups.length === 0) {
            return (
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
            );
        }

        return null;
    };

    return (
        <CommandMenu
            placeholder="Глобальний пошук..."
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            inputValue={query}
            onInputChange={onInputChange}
            filter={false} // Enable server-side filtering
            items={menuGroups}
            emptyState={renderEmptyState()}
        >
            <AriaHeading slot="title" className="sr-only">
                Глобальний пошук
            </AriaHeading>
            <CommandMenu.Group>
                <CommandMenu.List>
                    {(group) => (
                        <CommandMenu.Section {...group}>
                            {(item) => <CommandMenu.Item key={item.id} {...item} onAction={() => handleSelection(item.id)} />}
                        </CommandMenu.Section>
                    )}
                </CommandMenu.List>
            </CommandMenu.Group>
        </CommandMenu>
    );
};
