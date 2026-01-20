import type { Key } from "react-aria-components";
import type { TaskDetails } from "./TaskDetailsModal"; // или вынеси в shared types

export interface TaskDetailsHeaderProps {
    task: TaskDetails;
    listItems: { id: string; label: string }[];
    currentListId: string | null;
    onMoveToList: (key: Key | null) => void;
    onUploadBanner: () => void;
    onSetBannerByUrl: () => void;
    onArchive: () => void;
    onClose: () => void;
}

import { Select } from "@/shared/ui/select/select";
import { Dropdown } from "@/shared/ui/dropdown/dropdown";
import { ArchiveIcon, ImageIcon, LinkIcon, MoreHorizontal, X } from "lucide-react";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility.tsx";

export const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({
    task,
    listItems,
    currentListId,
    onMoveToList,
    onUploadBanner,
    onSetBannerByUrl,
    onArchive,
    onClose,
}) => {
    return (
        <div
            className={`flex items-start justify-between gap-3 border-b border-secondary px-5 py-4 ${task.banner_url
                    ? "min-h-[180px] bg-cover bg-center border-none"
                    : ""
                }`}
            style={
                task.banner_url
                    ? { backgroundImage: `url(${task.banner_url})` }
                    : undefined
            }
        >
            {/* LEFT */}
            <Select
                size="sm"
                aria-label="Список задачі"
                placeholder="Обери список"
                items={listItems}
                selectedKey={currentListId}
                onSelectionChange={onMoveToList}
            >
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
                <Dropdown.Root>
                    <ButtonUtility size="sm" icon={MoreHorizontal} />

                    <Dropdown.Popover>
                        <Dropdown.Menu>
                            <Dropdown.Section>
                                <Dropdown.Item icon={ImageIcon} onAction={onUploadBanner}>
                                    Завантажити банер
                                </Dropdown.Item>
                                <Dropdown.Item icon={LinkIcon} onAction={onSetBannerByUrl}>
                                    Встановити банер по URL
                                </Dropdown.Item>
                            </Dropdown.Section>

                            <Dropdown.Separator />

                            <Dropdown.Section>
                                <Dropdown.Item
                                    icon={ArchiveIcon}
                                    onAction={onArchive}
                                >
                                    Архівувати задачу
                                </Dropdown.Item>
                            </Dropdown.Section>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown.Root>

                <ButtonUtility onClick={onClose} icon={X} />
            </div>
        </div>
    );
};









