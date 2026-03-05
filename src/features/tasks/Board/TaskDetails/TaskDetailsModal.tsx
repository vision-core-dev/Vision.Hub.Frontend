import React, { type Key, useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import type { List } from "../BoardPage/BoardPage";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";

import { AssigneeSelector } from "./AssigneeSelector/AssigneeSelector";
import TaskNameInput from "./TaskNameInput/TaskNameInput";
import { TagSelector } from "./TagSelector/TagSelector";
import AttachmentsSection, { type Attachment } from "./AttachmentsSection/AttachmentsSection";
import AccrualsSection, { type Accrual } from "./AccrualsSection/AccrualsSection";
import SubtasksSection, { type Subtask } from "./SubtaskSection/SubtasksSection";

import { useDebouncedCallback } from "use-debounce";
import { TextEditor } from "@/shared/ui/text-editor/text-editor";
import { dateValueToLocalString, isoToDateValue } from "@/shared/utils/date";
import { DatePicker } from "@/shared/components/date-picker/date-picker";
import type { DateValue } from "react-aria-components";

import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { TaskDetailsHeader } from "./TaskDetailsHeader";

/* ===================== TYPES ===================== */

export interface TaskUser {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
}

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface Comment {
    id: string;
    user: TaskUser;
    content: string;
    created_at: string;
}

export interface TaskDetails {
    id: string;
    name: string;
    description: string;
    banner_url?: string;
    list_id: string;
    tags: Tag[];
    assignees: TaskUser[];
    attachments: Attachment[];
    subtasks: Subtask[];
    accruals?: Accrual[];
    comments: Comment[];
    started_at?: string | null;
    deadline_at?: string | null;
    created_by: TaskUser;
    created_at: string;
}

interface Props {
    taskId: string;
    boardTags: Tag[];
    boardLists: List[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isReadOnly?: boolean;
}

/* ===================== COMPONENT ===================== */

const TaskDetailsModal: React.FC<Props> = ({
    taskId,
    boardLists,
    boardTags,
    isOpen,
    onOpenChange,
    isReadOnly = false,
}) => {
    const [loading, setLoading] = useState(false);
    const [task, setTask] = useState<TaskDetails | null>(null);

    const [startedAt, setStartedAt] = useState<DateValue | null>(null);
    const [deadlineAt, setDeadlineAt] = useState<DateValue | null>(null);
    const [description, setDescription] = useState("");

    /* ===================== DERIVED ===================== */

    const listItems = boardLists.map((list) => ({
        id: list.id,
        label: list.name,
    }));

    const currentListId = task?.list_id ?? null;

    /* ===================== FETCH ===================== */

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/v1/Hub/Tasks/${taskId}` + (isReadOnly ? "/GetPublicDetails" : "/GetDetails"));
            const data = await res.json();

            const taskData = data.task ?? data;

            setTask(taskData);
            setDescription(taskData.description || "");
            setStartedAt(isoToDateValue(taskData.started_at));
            setDeadlineAt(isoToDateValue(taskData.deadline_at));
        } catch (e) {
            console.error("❌ Failed to load task", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && taskId) {
            fetchTaskDetails();
        }
    }, [isOpen, taskId]);

    /* ===================== SAVE ===================== */

    const saveDescription = useDebouncedCallback(async (html: string) => {
        if (!task) return;
        try {
            await api.post(`/v1/Hub/Tasks/${task.id}/UpdateDescription`, {
                description: html,
            });
        } catch (e) {
            console.error("❌ Failed to save description", e);
        }
    }, 800);

    const saveDates = useDebouncedCallback(
        async (start: DateValue | null, end: DateValue | null) => {
            if (!task) return;
            try {
                await api.post(`/v1/Hub/Tasks/${task.id}/UpdateDates`, {
                    started_at: dateValueToLocalString(start),
                    deadline_at: dateValueToLocalString(end),
                });
            } catch (e) {
                console.error("❌ Failed to save dates", e);
            }
        },
        600
    );

    useEffect(() => {
        return () => {
            saveDescription.flush();
            saveDates.flush();
        };
    }, []);

    /* ===================== ACTIONS ===================== */

    const handleMoveToList = async (key: Key | null) => {
        if (!task || key == null || key === task.list_id) return;

        const newListId = String(key);
        const prevListId = task.list_id;

        // optimistic
        setTask({ ...task, list_id: newListId });

        try {
            const res = await api.post(
                `/v1/Hub/Tasks/${task.id}/MoveToList`,
                { list_id: newListId }
            );
            if (!res.ok) throw new Error();
        } catch {
            // rollback
            setTask({ ...task, list_id: prevListId });
        }
    };

    const handleArchive = async () => {
        if (!task) return;
        try {
            await api.post(`/v1/Hub/Tasks/${task.id}/Archive`);
            onOpenChange(false);
        } catch (e) {
            console.error("❌ Archive failed", e);
        }
    };

    const handleNameChange = async (name: string) => {
        if (!task) return;
        setTask({ ...task, name });
        await api.post(`/v1/Hub/Tasks/${task.id}/UpdateName`, { name });
    };

    const handleUploadBanner = async () => {
        if (!task) return;

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post(
                `/v1/Hub/Tasks/${task.id}/UploadBanner`,
                formData
            );
            const data = await res.json();

            if (data.banner_url) {
                setTask({ ...task, banner_url: data.banner_url });
            }
        };

        input.click();
    };

    const handleBannerByUrl = async () => {
        if (!task) return;
        const url = prompt("Введіть URL зображення");
        if (!url) return;

        await api.post(`/v1/Hub/Tasks/${task.id}/SetBanner`, { banner_url: url });
        setTask({ ...task, banner_url: url });
    };

    /* ===================== RENDER ===================== */

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full max-w-[900px] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-primary shadow-2xl">
                            {loading || !task ? (
                                <div className="flex h-[400px] items-center justify-center">
                                    <LoaderDots />
                                </div>
                            ) : (
                                <>
                                    <div className="flex-none">
                                        <TaskDetailsHeader
                                            task={task}
                                            listItems={listItems}
                                            currentListId={currentListId}
                                            onMoveToList={handleMoveToList}
                                            onUploadBanner={handleUploadBanner}
                                            onSetBannerByUrl={handleBannerByUrl}
                                            onArchive={handleArchive}
                                            onClose={() => onOpenChange(false)}
                                            isReadOnly={isReadOnly}
                                        />
                                    </div>

                                    <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                                        <div className="flex flex-col gap-8">
                                            {isReadOnly ? (
                                                <h2 className="text-2xl font-bold text-primary">{task.name}</h2>
                                            ) : (
                                                <TaskNameInput value={task.name} onChange={handleNameChange} />
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <section className="flex flex-col gap-2">
                                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Учасники</h3>
                                                    <AssigneeSelector
                                                        taskId={task.id}
                                                        assignees={task.assignees}
                                                        onUpdate={(assignees) =>
                                                            setTask({ ...task, assignees })
                                                        }
                                                        isReadOnly={isReadOnly}
                                                    />
                                                </section>

                                                <section className="flex flex-col gap-2">
                                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Мітки</h3>
                                                    <TagSelector
                                                        taskId={task.id}
                                                        boardTags={boardTags}
                                                        selectedTags={task.tags}
                                                        onUpdate={(tags) => setTask({ ...task, tags })}
                                                        isReadOnly={isReadOnly}
                                                    />
                                                </section>
                                            </div>

                                            <section className="flex flex-row gap-6">
                                                {isReadOnly ? (
                                                    <>
                                                        <div className="flex flex-col gap-1">
                                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Початок</h3>
                                                            <span className="text-sm text-primary">{startedAt ? dateValueToLocalString(startedAt) : "—"}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Крайдата</h3>
                                                            <span className="text-sm text-primary">{deadlineAt ? dateValueToLocalString(deadlineAt) : "—"}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex flex-col gap-1">
                                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Початок</h3>
                                                            <DatePicker
                                                                value={startedAt}
                                                                onChange={(v) => setStartedAt(v)}
                                                                onApply={(v) => {
                                                                    setStartedAt(v);
                                                                    saveDates(v, deadlineAt);
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="flex flex-col gap-1">
                                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Крайдата</h3>
                                                            <DatePicker
                                                                value={deadlineAt}
                                                                onChange={(v) => setDeadlineAt(v)}
                                                                onApply={(v) => {
                                                                    setDeadlineAt(v);
                                                                    saveDates(startedAt, v);
                                                                }}
                                                            />
                                                        </div>


                                                    </>
                                                )}
                                            </section>

                                            <section className="flex flex-col gap-2">
                                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Опис</h3>
                                                <TextEditor.Root
                                                    placeholder={isReadOnly ? "" : "Додайте опис задачі..."}
                                                    inputClassName="w-full min-h-[150px] resize-y"
                                                    content={description}
                                                    isDisabled={isReadOnly}
                                                    onUpdate={isReadOnly ? undefined : ({ editor }) => {
                                                        const html = editor.getHTML();
                                                        setDescription(html);
                                                        saveDescription(html);
                                                    }}
                                                >
                                                    {!isReadOnly && <TextEditor.Tooltip />}
                                                    <div className="flex flex-col gap-2">
                                                        {!isReadOnly && <TextEditor.Toolbar type="advanced" />}
                                                        {/* <div className="px-3 py-2"> */}
                                                        <TextEditor.Content />
                                                        {/* </div> */}
                                                    </div>
                                                </TextEditor.Root>
                                            </section>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <AttachmentsSection
                                                    taskId={task.id}
                                                    attachments={task.attachments}
                                                    onChange={(attachments) =>
                                                        setTask({ ...task, attachments })
                                                    }
                                                    isReadOnly={isReadOnly}
                                                />

                                                <AccrualsSection
                                                    taskId={task.id}
                                                    accruals={task.accruals || []}
                                                    users={task.assignees}
                                                    onUpdate={(accruals) => setTask({ ...task, accruals })}
                                                    isReadOnly={isReadOnly}
                                                />
                                            </div>

                                            <SubtasksSection
                                                taskId={task.id}
                                                initialSubtasks={task.subtasks}
                                                users={[]}
                                                isReadOnly={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

export default TaskDetailsModal;









