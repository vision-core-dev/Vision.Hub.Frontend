import { useState, useEffect } from "react";
import { Folder, DotsVertical, Trash01, Edit03, ShieldTick } from "@untitledui/icons";
import { Globe, Lock, Users, Eye, Download, ArrowLeft, CornerUpRight } from "lucide-react";
import { Dropdown } from "@/shared/ui/dropdown/dropdown";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { Dialog, DialogTrigger, Modal } from "@/shared/components/modals/modal";
import { ModalOverlay } from "@/shared/components/modals/modal.tsx";
import { api } from "@/shared/utils/api";
import { driveApi } from "./api";
import type { DriveFolder, DriveFile, AccessType } from "./types";
import FilePreviewModal from "./FilePreviewModal";
import { ButtonUtility } from "@/shared/ui/base/buttons/button-utility";
import { DriveEmptyState } from "./DriveEmptyState";

// ─── Helpers ───────────────────────────────────────────────────────

function getFileIcon(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "🖼️";
    if (["pdf", "doc", "docx"].includes(ext)) return "📄";
    if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
    if (["mp4", "webm", "mov"].includes(ext)) return "🎬";
    if (["mp3", "m4a", "wav", "aac"].includes(ext)) return "🎵";
    return "📎";
}

function getAccessIcon(accessType: string) {
    switch (accessType) {
        case "private": return <Lock size={12} className="text-gray-400" />;
        case "role": return <Users size={12} className="text-blue-400" />;
        case "public": return <Globe size={12} className="text-green-400" />;
        default: return null;
    }
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

// ─── Main Component ────────────────────────────────────────────────

interface DriveGridProps {
    folders: DriveFolder[];
    files: DriveFile[];
    loading: boolean;
    onFolderOpen: (id: string) => void;
    onItemDeleted: () => void;
    onItemUpdated: () => void;
}

export default function DriveGrid({
    folders,
    files,
    loading,
    onFolderOpen,
    onItemDeleted,
    onItemUpdated,
}: DriveGridProps) {
    const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

    if (loading) return <div className="flex justify-center py-20 animate-pulse text-gray-400">Завантаження...</div>;

    if (folders.length === 0 && files.length === 0) {
        return <DriveEmptyState />;
    }

    return (
        <>
            {folders.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Папки</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {folders.map(f => <FolderCard key={f.id} folder={f} onOpen={() => onFolderOpen(f.id)} onDeleted={onItemDeleted} onUpdated={onItemUpdated} />)}
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Файли</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {files.map(f => <FileCard key={f.id} file={f} onPreview={() => setPreviewFile(f)} onDeleted={onItemDeleted} onUpdated={onItemUpdated} />)}
                    </div>
                </div>
            )}

            {previewFile && <FilePreviewModal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} url={previewFile.url} name={previewFile.name} />}
        </>
    );
}

// ─── Modals ────────────────────────────────────────────────────────

function RenameModal({ isOpen, onClose, name, onConfirm, title }: any) {
    const [val, setVal] = useState(name);
    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={v => !v && onClose()}>
            <ModalOverlay isDismissable><Modal><Dialog>
                <div className="p-6 w-96 bg-white rounded-xl">
                    <h3 className="text-md font-semibold mb-4">{title}</h3>
                    <Input value={val} onChange={(e: any) => setVal(e.target?.value || e)} autoFocus />
                    <div className="flex justify-end gap-2 mt-6">
                        <Button color="secondary" onClick={onClose}>Скасувати</Button>
                        <Button color="primary" onClick={() => onConfirm(val)}>Зберегти</Button>
                    </div>
                </div>
            </Dialog></Modal></ModalOverlay>
        </DialogTrigger>
    );
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, name }: any) {
    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={v => !v && onClose()}>
            <ModalOverlay isDismissable><Modal><Dialog>
                <div className="p-6 w-96 text-center bg-white rounded-xl">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Trash01 className="text-red-600 w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Видалити елемент?</h3>
                    <p className="text-sm text-gray-500 mt-2">Ви впевнені, що хочете видалити "{name}"? Цю дію неможливо буде скасувати.</p>
                    <div className="flex flex-col gap-2 mt-6">
                        <Button color="primary-destructive" className="w-full" onClick={onConfirm}>Видалити</Button>
                        <Button color="secondary" className="w-full" onClick={onClose}>Скасувати</Button>
                    </div>
                </div>
            </Dialog></Modal></ModalOverlay>
        </DialogTrigger>
    );
}

function AccessModal({ isOpen, onClose, item, onConfirm }: any) {
    const [access, setAccess] = useState<AccessType>(item.access_type);
    const [roles, setRoles] = useState<any[]>([]);
    const [selRoles, setSelRoles] = useState<string[]>(item.allowed_role_ids || []);

    useEffect(() => {
        if (isOpen) api.get("/v1/Hub/UserRoles/MyLowerRoles").then(async r => { if (r.ok) setRoles(await r.json()); });
    }, [isOpen]);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={v => !v && onClose()}>
            <ModalOverlay isDismissable><Modal><Dialog>
                <div className="p-6 w-[450px] bg-white rounded-xl">
                    <h3 className="text-md font-semibold mb-4">Налаштування доступу</h3>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {[
                                { v: "public", l: "Публічно", i: Globe },
                                { v: "role", l: "Ролі", i: Users },
                                { v: "private", l: "Приватно", i: Lock },
                            ].map(opt => (
                                <button key={opt.v} onClick={() => setAccess(opt.v as any)} className={`flex-1 p-3 border-2 rounded-xl flex flex-col items-center gap-1 transition ${access === opt.v ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                                    <opt.i size={20} className={access === opt.v ? "text-green-600" : "text-gray-400"} />
                                    <span className="text-xs font-medium">{opt.l}</span>
                                </button>
                            ))}
                        </div>
                        {access === "role" && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {roles.map(r => (
                                    <button key={r.id} onClick={() => setSelRoles(s => s.includes(r.id) ? s.filter(x => x !== r.id) : [...s, r.id])} className={`px-3 py-1 rounded-full text-xs font-medium ${selRoles.includes(r.id) ? "bg-green-100 text-green-700 ring-1 ring-green-500" : "bg-gray-100 text-gray-500"}`}>
                                        {r.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-8">
                        <Button color="secondary" onClick={onClose}>Закрити</Button>
                        <Button color="primary" onClick={() => onConfirm(access, selRoles)}>Зберегти зміни</Button>
                    </div>
                </div>
            </Dialog></Modal></ModalOverlay>
        </DialogTrigger>
    );
}

function MoveModal({ isOpen, onClose, itemName, onConfirm }: any) {
    const [history, setHistory] = useState<{ id: string | null, name: string }[]>([{ id: null, name: "Головна папка" }]);
    const [folders, setFolders] = useState<DriveFolder[]>([]);
    const [loading, setLoading] = useState(false);

    const curr = history[history.length - 1];

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            driveApi.list(curr.id).then(res => {
                setFolders(res.folders || []);
            }).finally(() => setLoading(false));
        } else {
            setHistory([{ id: null, name: "Головна папка" }]);
        }
    }, [isOpen, curr.id]);

    const navigateTo = (f: DriveFolder) => setHistory([...history, { id: f.id, name: f.name }]);
    const goBack = () => setHistory(history.slice(0, -1));

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={v => !v && onClose()}>
            <ModalOverlay isDismissable>
                <Modal><Dialog>
                    <div className="p-6 w-[400px] bg-white rounded-xl flex flex-col max-h-[80vh]">
                        <h3 className="text-md font-semibold mb-4 text-gray-900">Перемістити {itemName}</h3>

                        <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-lg">
                            {history.length > 1 && (
                                <button onClick={goBack} className="p-1 hover:bg-gray-200 rounded-md">
                                    <ArrowLeft size={16} />
                                </button>
                            )}
                            <span className="font-medium text-sm text-gray-700 truncate">{curr.name}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-[200px] border rounded-lg border-gray-100 p-2 space-y-1">
                            {loading ? (
                                <div className="text-center text-gray-400 py-4 text-sm animate-pulse">Завантаження...</div>
                            ) : folders.length === 0 ? (
                                <div className="text-center text-gray-400 py-4 text-sm">Тут пусто</div>
                            ) : (
                                folders.map(f => (
                                    <div key={f.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition" onClick={() => navigateTo(f)}>
                                        <Folder size={18} className="text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700 truncate">{f.name}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button color="secondary" onClick={onClose}>Скасувати</Button>
                            <Button color="primary" onClick={() => onConfirm(curr.id)}>Перемістити сюди</Button>
                        </div>
                    </div>
                </Dialog></Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── Cards ─────────────────────────────────────────────────────────

function FolderCard({ folder, onOpen, onDeleted, onUpdated }: any) {
    const [m, setM] = useState<string | null>(null);
    const actions = {
        rename: (n: string) => driveApi.updateFolder(folder.id, { name: n }).then(() => { onUpdated(); setM(null); }),
        access: (a: any, r: any) => driveApi.updateFolder(folder.id, { access_type: a, allowed_role_ids: r }).then(() => { onUpdated(); setM(null); }),
        delete: () => driveApi.deleteFolder(folder.id).then(() => { onDeleted(); setM(null); }),
        move: (parentId: string | null) => driveApi.updateFolder(folder.id, { parent_id: parentId }).then(() => { onUpdated(); setM(null); })
    };
    return (
        <div className="group border border-gray-100 bg-white rounded-2xl p-4 hover:shadow-xl hover:border-green-200 transition-all cursor-pointer" onDoubleClick={onOpen}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2" onClick={onOpen}>
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600"><Folder /></div>
                    {getAccessIcon(folder.access_type)}
                </div>
                <Dropdown.Root>
                    <ButtonUtility icon={DotsVertical} />
                    <Dropdown.Popover><Dropdown.Menu>
                        <Dropdown.Item icon={Edit03} onClick={() => setM("rename")}>Змінити назву</Dropdown.Item>
                        <Dropdown.Item icon={CornerUpRight} onClick={() => setM("move")}>Перемістити</Dropdown.Item>
                        <Dropdown.Item icon={ShieldTick} onClick={() => setM("access")}>Доступ</Dropdown.Item>
                        <Dropdown.Item icon={Trash01} className="text-red-600" onClick={() => setM("delete")}>Видалити</Dropdown.Item>
                    </Dropdown.Menu></Dropdown.Popover>
                </Dropdown.Root>
            </div>
            <p className="font-semibold text-gray-900 truncate mb-1" onClick={onOpen}>{folder.name}</p>
            <p className="text-[10px] text-gray-400 font-medium tracking-tight">ПАПКА</p>
            <RenameModal isOpen={m === "rename"} onClose={() => setM(null)} name={folder.name} onConfirm={actions.rename} title="Перейменувати папку" />
            <DeleteConfirmModal isOpen={m === "delete"} onClose={() => setM(null)} name={folder.name} onConfirm={actions.delete} />
            <AccessModal isOpen={m === "access"} onClose={() => setM(null)} item={folder} onConfirm={actions.access} />
            <MoveModal isOpen={m === "move"} onClose={() => setM(null)} itemName={`"${folder.name}"`} onConfirm={actions.move} />
        </div>
    );
}

function FileCard({ file, onPreview, onDeleted, onUpdated }: any) {
    const [m, setM] = useState<string | null>(null);
    const actions = {
        rename: (n: string) => driveApi.updateFile(file.id, { name: n }).then(() => { onUpdated(); setM(null); }),
        access: (a: any, r: any) => driveApi.updateFile(file.id, { access_type: a, allowed_role_ids: r }).then(() => { onUpdated(); setM(null); }),
        delete: () => driveApi.deleteFile(file.id).then(() => { onDeleted(); setM(null); }),
        move: (folderId: string | null) => driveApi.updateFile(file.id, { folder_id: folderId }).then(() => { onUpdated(); setM(null); })
    };
    return (
        <div className="group border border-gray-100 bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:border-green-200 transition-all cursor-pointer" onDoubleClick={onPreview}>
            <div className="h-32 bg-gray-50 flex items-center justify-center text-4xl" onClick={onPreview}>
                {file.mime_type?.startsWith("image/") ? <img src={file.url} className="w-full h-full object-cover" /> : getFileIcon(file.name)}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-center mb-1">
                    {getAccessIcon(file.access_type)}
                    <Dropdown.Root>
                        <ButtonUtility icon={DotsVertical} />
                        <Dropdown.Popover><Dropdown.Menu>
                            <Dropdown.Item icon={Eye} onClick={onPreview}>Переглянути</Dropdown.Item>
                            <Dropdown.Item icon={Download} onClick={() => window.open(file.url)}>Завантажити</Dropdown.Item>
                            <Dropdown.Item icon={Edit03} onClick={() => setM("rename")}>Перейменувати</Dropdown.Item>
                            <Dropdown.Item icon={CornerUpRight} onClick={() => setM("move")}>Перемістити</Dropdown.Item>
                            <Dropdown.Item icon={ShieldTick} onClick={() => setM("access")}>Доступ</Dropdown.Item>
                            <Dropdown.Item icon={Trash01} className="text-red-600" onClick={() => setM("delete")}>Видалити</Dropdown.Item>
                        </Dropdown.Menu></Dropdown.Popover>
                    </Dropdown.Root>
                </div>
                <p className="font-semibold text-gray-900 truncate text-sm" onClick={onPreview}>{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{formatSize(file.size)}</p>
            </div>
            <RenameModal isOpen={m === "rename"} onClose={() => setM(null)} name={file.name} onConfirm={actions.rename} title="Перейменувати файл" />
            <DeleteConfirmModal isOpen={m === "delete"} onClose={() => setM(null)} name={file.name} onConfirm={actions.delete} />
            <AccessModal isOpen={m === "access"} onClose={() => setM(null)} item={file} onConfirm={actions.access} />
            <MoveModal isOpen={m === "move"} onClose={() => setM(null)} itemName={`"${file.name}"`} onConfirm={actions.move} />
        </div>
    );
}
