import { useState, useEffect, useRef } from "react";
import { Plus, Folder, UploadCloud01 } from "@untitledui/icons";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { Dropdown } from "@/shared/ui/dropdown/dropdown";
import { Dialog, DialogTrigger, Modal } from "@/shared/components/modals/modal";
import { ModalOverlay } from "@/shared/components/modals/modal.tsx";
import { Search, Globe, Lock, Users } from "lucide-react";
import { driveApi } from "./api";
import { api } from "@/shared/utils/api";
import type { AccessType } from "./types";

interface DriveToolbarProps {
    onUploadFiles: (files: File[], accessType: AccessType, roleIds: string[]) => void;
    onFolderCreated: () => void;
    currentFolderId: string | null;
    searchQuery: string;
    onSearch: (query: string) => void;
}

export default function DriveToolbar({
    onUploadFiles,
    onFolderCreated,
    currentFolderId,
    searchQuery,
    onSearch,
}: DriveToolbarProps) {
    const [openFolder, setOpenFolder] = useState(false);
    const [openUpload, setOpenUpload] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <Dropdown.Root>
                    <Button iconLeading={Plus} iconTrailing>
                        Додати
                    </Button>

                    <Dropdown.Popover>
                        <Dropdown.Menu>
                            <Dropdown.Item icon={Folder} onClick={() => setOpenFolder(true)}>
                                Папка
                            </Dropdown.Item>
                            <Dropdown.Item icon={UploadCloud01} onClick={() => setOpenUpload(true)}>
                                Файл
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown.Root>

                <Input
                    icon={Search}
                    placeholder="Шукати файли..."
                    className="w-64"
                    size="sm"
                    value={searchQuery}
                    onChange={(e: any) => onSearch(e.target?.value ?? e)}
                />
            </div>

            <CreateFolderModal
                open={openFolder}
                onClose={() => setOpenFolder(false)}
                currentFolderId={currentFolderId}
                onCreated={onFolderCreated}
            />
            <UploadFileModal
                open={openUpload}
                onClose={() => setOpenUpload(false)}
                onUpload={onUploadFiles}
            />
        </>
    );
}

// ─── Access Type Selector ──────────────────────────────────────────

interface AccessSelectorProps {
    accessType: AccessType;
    setAccessType: (v: AccessType) => void;
    roles: { id: string; name: string }[];
    selectedRoleIds: string[];
    setSelectedRoleIds: (v: string[]) => void;
}

function AccessSelector({
    accessType,
    setAccessType,
    roles,
    selectedRoleIds,
    setSelectedRoleIds,
}: AccessSelectorProps) {
    const accessOptions: { value: AccessType; label: string; icon: any; desc: string }[] = [
        { value: "public", label: "Для всіх", icon: Globe, desc: "Всі користувачі мають доступ" },
        { value: "role", label: "За ролями", icon: Users, desc: "Доступ для обраних ролей" },
        { value: "private", label: "Тільки я", icon: Lock, desc: "Тільки ви маєте доступ" },
    ];

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Доступ</label>
            <div className="flex gap-2">
                {accessOptions.map(opt => {
                    const Icon = opt.icon;
                    const isActive = accessType === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setAccessType(opt.value)}
                            className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-all ${
                                isActive
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                            }`}
                        >
                            <Icon size={20} />
                            <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                    );
                })}
            </div>

            {accessType === "role" && roles.length > 0 && (
                <div className="mt-2 space-y-2">
                    <label className="text-xs font-medium text-gray-500">Оберіть ролі:</label>
                    <div className="flex flex-wrap gap-2">
                        {roles.map(role => {
                            const isChecked = selectedRoleIds.includes(role.id);
                            return (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedRoleIds(
                                            isChecked
                                                ? selectedRoleIds.filter(id => id !== role.id)
                                                : [...selectedRoleIds, role.id]
                                        );
                                    }}
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                        isChecked
                                            ? "bg-green-100 text-green-700 ring-1 ring-green-500"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {role.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Create Folder Modal ───────────────────────────────────────────

interface CreateFolderModalProps {
    open: boolean;
    onClose: () => void;
    currentFolderId: string | null;
    onCreated: () => void;
}

function CreateFolderModal({ open, onClose, currentFolderId, onCreated }: CreateFolderModalProps) {
    const [name, setName] = useState("");
    const [accessType, setAccessType] = useState<AccessType>("public");
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (open) {
            api.get("/v1/Hub/UserRoles/MyLowerRoles").then(async res => {
                if (res.ok) {
                    const data = await res.json();
                    setRoles(Array.isArray(data) ? data : data.roles || []);
                }
            });
        }
    }, [open]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setCreating(true);
        try {
            await driveApi.createFolder({
                name: name.trim(),
                parent_id: currentFolderId,
                access_type: accessType,
                allowed_role_ids: accessType === "role" ? selectedRoleIds : [],
            });
            setName("");
            setAccessType("public");
            setSelectedRoleIds([]);
            onCreated();
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setCreating(false);
        }
    };

    return (
        <DialogTrigger isOpen={open} onOpenChange={v => !v && onClose()}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="w-full max-w-md rounded-xl bg-white p-6">
                            <h3 className="text-md font-semibold mb-4">
                                Створити папку
                            </h3>

                            <Input
                                autoFocus
                                placeholder="Назва папки"
                                className="mb-4"
                                value={name}
                                onChange={(v: any) => setName(typeof v === "string" ? v : v?.target?.value ?? "")}
                            />

                            <AccessSelector
                                accessType={accessType}
                                setAccessType={setAccessType}
                                roles={roles}
                                selectedRoleIds={selectedRoleIds}
                                setSelectedRoleIds={setSelectedRoleIds}
                            />

                            <div className="flex justify-end gap-2 mt-6">
                                <Button color="secondary" onClick={onClose}>
                                    Скасувати
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={handleCreate}
                                    isDisabled={!name.trim() || creating}
                                >
                                    {creating ? "Створення..." : "Створити"}
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── Upload File Modal ─────────────────────────────────────────────

interface UploadFileModalProps {
    open: boolean;
    onClose: () => void;
    onUpload: (files: File[], accessType: AccessType, roleIds: string[]) => void;
}

function UploadFileModal({ open, onClose, onUpload }: UploadFileModalProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [accessType, setAccessType] = useState<AccessType>("public");
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            api.get("/v1/Hub/UserRoles/MyLowerRoles").then(async res => {
                if (res.ok) {
                    const data = await res.json();
                    setRoles(Array.isArray(data) ? data : data.roles || []);
                }
            });
        } else {
            setSelectedFiles([]);
            setAccessType("public");
            setSelectedRoleIds([]);
        }
    }, [open]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const newFiles = Array.from(e.dataTransfer.files);
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (idx: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} Б`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} ГБ`;
    };

    const handleUpload = () => {
        if (selectedFiles.length === 0) return;
        onUpload(selectedFiles, accessType, accessType === "role" ? selectedRoleIds : []);
        onClose();
    };

    return (
        <DialogTrigger isOpen={open} onOpenChange={v => !v && onClose()}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="w-full max-w-lg rounded-xl bg-white p-6">
                            <h3 className="mb-4 text-md font-semibold">
                                Завантажити файли
                            </h3>

                            {/* Drop zone */}
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-all ${
                                    dragOver
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                }`}
                            >
                                <UploadCloud01 className="w-10 h-10 text-gray-400 mb-2" />
                                <p className="text-sm">
                                    <span className="text-green-600 font-medium">Натисни щоб завантажити</span>
                                    {" "}або перемісти сюди
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Всі файли (макс. 10 ГБ)
                                </p>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {/* File list */}
                            {selectedFiles.length > 0 && (
                                <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                                    {selectedFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFile(idx)}
                                                className="ml-2 text-gray-400 hover:text-red-500 text-sm"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Access type */}
                            <div className="mt-4">
                                <AccessSelector
                                    accessType={accessType}
                                    setAccessType={setAccessType}
                                    roles={roles}
                                    selectedRoleIds={selectedRoleIds}
                                    setSelectedRoleIds={setSelectedRoleIds}
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    color="primary"
                                    isDisabled={selectedFiles.length === 0}
                                    onClick={handleUpload}
                                >
                                    Завантажити ({selectedFiles.length})
                                </Button>
                                <Button color="secondary" onClick={onClose}>
                                    Закрити
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}
