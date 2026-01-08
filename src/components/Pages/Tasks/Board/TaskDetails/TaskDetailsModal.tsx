import React, { type Key, useEffect, useState } from "react";
import { api } from "@/utils/api";
import type { List } from "../BoardPage/BoardPage";
import LoaderDots from "../../../../basic/LoaderDots/LoaderDots";

import {AssigneeSelector} from "./AssigneeSelector/AssigneeSelector";
import TaskNameInput from "./TaskNameInput/TaskNameInput";
import TagSelector from "./TagSelector/TagSelector";
import AttachmentsSection, { type Attachment } from "./AttachmentsSection/AttachmentsSection";
import SubtasksSection, { type Subtask } from "./SubtaskSection/SubtasksSection";

import { useDebouncedCallback } from "use-debounce";
import { TextEditor } from "@/ui/base/text-editor/text-editor";
import { dateValueToLocalString, isoToDateValue } from "@/utils/date";
import { DatePicker } from "@/ui/application/date-picker/date-picker";
import type { DateValue } from "react-aria-components";

import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/ui/application/modals/modal";
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
}

/* ===================== COMPONENT ===================== */

const TaskDetailsModal: React.FC<Props> = ({
                                               taskId,
                                               boardLists,
                                               boardTags,
                                               isOpen,
                                               onOpenChange,
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
            const res = await api.get(`/v1/Hub/Tasks/${taskId}/GetDetails`);
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
                        <div className="relative w-full max-w-[900px] overflow-hidden rounded-2xl bg-primary shadow-xl">
                            {loading || !task ? (
                                <div className="flex h-[200px] items-center justify-center">
                                    <LoaderDots />
                                </div>
                            ) : (
                                <>
                                    <TaskDetailsHeader
                                        task={task}
                                        listItems={listItems}
                                        currentListId={currentListId}
                                        onMoveToList={handleMoveToList}
                                        onUploadBanner={handleUploadBanner}
                                        onSetBannerByUrl={handleBannerByUrl}
                                        onArchive={handleArchive}
                                        onClose={() => onOpenChange(false)}
                                    />

                                    <div className="flex flex-col gap-6 px-6 py-5">
                                        <TaskNameInput value={task.name} onChange={handleNameChange} />

                                        <section>
                                            <h3 className="mb-2 font-medium">Учасники</h3>
                                            <AssigneeSelector
                                                taskId={task.id}
                                                assignees={task.assignees}
                                                onUpdate={(assignees) =>
                                                    setTask({ ...task, assignees })
                                                }
                                            />
                                        </section>

                                        <section>
                                            <h3 className="mb-2 font-medium">Мітки</h3>
                                            <TagSelector
                                                taskId={task.id}
                                                boardTags={boardTags}
                                                selectedTags={task.tags}
                                                onUpdate={(tags) => setTask({ ...task, tags })}
                                            />
                                        </section>



                                        <section className="flex flex-row gap-6">
                                            <div>
                                                <h3 className="mb-2 font-medium">Початок</h3>
                                                <div className="flex gap-4">
                                                    <DatePicker
                                                        value={startedAt}
                                                        onChange={(v) => setStartedAt(v)}
                                                        onApply={(v) => {
                                                            setStartedAt(v);
                                                            saveDates(v, deadlineAt);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="mb-2 font-medium">Крайдата</h3>
                                                <div className="flex gap-4">
                                                    <DatePicker
                                                        value={deadlineAt}
                                                        onChange={(v) => setDeadlineAt(v)}
                                                        onApply={(v) => {
                                                            setDeadlineAt(v);
                                                            saveDates(startedAt, v);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                        </section>

                                        <section>
                                            <h3 className="mb-2 font-medium">Опис</h3>
                                            <TextEditor.Root
                                                inputClassName="w-full"
                                                content={description}
                                                onUpdate={({ editor }) => {
                                                    const html = editor.getHTML();
                                                    setDescription(html);
                                                    saveDescription(html);
                                                }}
                                            >
                                                <TextEditor.Toolbar type="advanced" />
                                                <TextEditor.Content />
                                            </TextEditor.Root>
                                        </section>

                                        <AttachmentsSection
                                            taskId={task.id}
                                            attachments={task.attachments}
                                            onChange={(attachments) =>
                                                setTask({ ...task, attachments })
                                            }
                                        />

                                        <SubtasksSection
                                            taskId={task.id}
                                            initialSubtasks={task.subtasks}
                                            users={[]}
                                        />
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
