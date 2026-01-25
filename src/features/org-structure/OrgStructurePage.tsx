import { useEffect, useState, createContext, useContext } from "react";
import type { FormEvent } from "react";
import { Plus, Search, Building2, Briefcase, User as UserIcon, ChevronRight, ChevronDown, FolderTree, Trash2, Edit2, LayoutList, Network } from "lucide-react";
import type { OrgNode, NodeType } from "./types";
import { orgStructureApi } from "./api";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { AvatarLabelGroup } from "@/shared/ui/avatar/avatar-label-group";
import { api } from "@/shared/utils/api";
import type { UserType } from "@/shared/types/Users";
import { cx } from "@/shared/utils/cx";
import { Select, type SelectItemType } from "@/shared/ui/select/select";
import { OrgChart } from "./OrgChart";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";

interface TreeContextType {
    onCreateChild: (parentId: string) => void;
    onEdit: (node: OrgNode) => void;
    onDelete: (node: OrgNode) => void;
}

const TreeContext = createContext<TreeContextType>({
    onCreateChild: () => { },
    onEdit: () => { },
    onDelete: () => { },
});

const OrgNodeItemWrapper = ({ node, level, searchQuery }: { node: OrgNode, level: number, searchQuery?: string }) => {
    const { onCreateChild, onEdit, onDelete } = useContext(TreeContext);
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    const getNodeIcon = () => {
        switch (node.node_type) {
            case 'department': return <Building2 size={18} className="text-blue-500" />;
            case 'project': return <Briefcase size={18} className="text-purple-500" />;
            case 'user': return <UserIcon size={18} className="text-green-500" />;
        }
    };

    return (
        <div className="flex flex-col">
            <div
                className={cx(
                    "group flex items-center gap-2 rounded-lg py-1.5 px-2 hover:bg-secondary/40 transition-colors border border-transparent hover:border-secondary mb-0.5",
                    level === 0 && "font-medium"
                )}
                style={{ paddingLeft: `${level * 24 + 8}px` }}
            >
                <div
                    className={cx("flex h-6 w-6 items-center justify-center rounded-md hover:bg-secondary cursor-pointer text-tertiary", !hasChildren && "invisible")}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <div className="flex items-center justify-center opacity-80">
                    {getNodeIcon()}
                </div>

                <div className="flex-1 truncate ml-2">
                    {node.node_type === 'user' ? (
                        <div className="flex items-center gap-2">
                            <AvatarLabelGroup
                                userId={node.user_id || undefined}
                                title={`${node.user?.first_name} ${node.user?.last_name || ''}`}
                                subtitle={node.user?.role?.name}
                                size="sm"
                                src={node.user?.avatar_url}
                            />
                        </div>
                    ) : (
                        <span className="text-sm text-primary">{node.name}</span>
                    )}
                </div>

                <div className="invisible flex items-center gap-1 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                    <Button size="sm" color="secondary" onClick={() => onCreateChild(node.id)} title="Додати підрозділ" className="h-7 w-7 p-0">
                        <Plus size={14} />
                    </Button>
                    <Button size="sm" color="secondary" onClick={() => onEdit(node)} title="Редагувати" className="h-7 w-7 p-0">
                        <Edit2 size={14} />
                    </Button>
                    <Button size="sm" color="secondary-destructive" onClick={() => onDelete(node)} title="Видалити" className="h-7 w-7 p-0">
                        <Trash2 size={14} />
                    </Button>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="flex flex-col relative before:absolute before:left-[calc(24px_*_var(--level)_+_19px)] before:top-0 before:bottom-2 before:w-px before:bg-secondary">
                    {node.children!.map(child => (
                        <OrgNodeItemWrapper key={child.id} node={child} level={level + 1} searchQuery={searchQuery} />
                    ))}
                </div>
            )}
        </div>
    );
};


// Modal Component
interface CreateEditNodeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    parentId: string | null;
    editNode: OrgNode | null;
    onSuccess: () => void;
}

const CreateEditNodeModal = ({ isOpen, onOpenChange, parentId, editNode, onSuccess }: CreateEditNodeModalProps) => {
    const [nodeType, setNodeType] = useState<NodeType>('department');
    const [name, setName] = useState('');
    const [userId, setUserId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Users for selection
    const [users, setUsers] = useState<UserType[]>([]);

    const userItems: SelectItemType[] = users.map(user => ({
        id: user.id,
        label: `${user.first_name} ${user.last_name || ''}`.trim(),
        avatarUrl: user.avatar_url
    }));

    useEffect(() => {
        if (isOpen) {
            // Load users for select
            api.get('/v1/Hub/Users/List').then(res => res.json()).then(data => {
                setUsers(data.list || []);
            }).catch(() => setUsers([]));

            if (editNode) {
                setNodeType(editNode.node_type);
                setName(editNode.name || '');
                setUserId(editNode.user_id || '');
            } else {
                setNodeType('department');
                setName('');
                setUserId('');
            }
        }
    }, [isOpen, editNode]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editNode) {
                await orgStructureApi.updateNode(editNode.id, {
                    name: nodeType !== 'user' ? name : undefined,
                });
            } else {
                await orgStructureApi.createNode({
                    node_type: nodeType,
                    name: nodeType !== 'user' ? name : undefined,
                    user_id: nodeType === 'user' ? userId : undefined,
                    parent_id: parentId,
                    order: 0 // Default order
                });
            }
            alert(editNode ? "Оновлено успішно" : "Створено успішно");
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Помилка при збереженні");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1C1C1E] p-6 shadow-2xl flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">{editNode ? 'Редагувати вузол' : 'Додати елемент структури'}</h2>
                                <CloseButton onClick={() => onOpenChange(false)} />
                            </div>

                            <div className="flex flex-col gap-4">
                                {!editNode && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Тип елементу</label>
                                        <div className="flex gap-2">
                                            {[
                                                { id: 'department', label: 'Відділ', icon: Building2 },
                                                { id: 'project', label: 'Проект', icon: Briefcase },
                                                { id: 'user', label: 'Співробітник', icon: UserIcon },
                                            ].map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setNodeType(type.id as NodeType)}
                                                    className={cx(
                                                        "flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 transition-all outline-none focus:ring-2 focus:ring-focus-ring",
                                                        nodeType === type.id
                                                            ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10"
                                                            : "border-secondary hover:bg-secondary/50"
                                                    )}
                                                >
                                                    <type.icon size={20} />
                                                    <span className="text-xs font-medium">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {nodeType === 'user' ? (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Користувач</label>
                                        <Select
                                            placeholder="Оберіть користувача..."
                                            items={userItems}
                                            selectedKey={userId}
                                            onSelectionChange={(key) => setUserId(key as string)}
                                        >
                                            {(item: SelectItemType) => (
                                                <Select.Item id={item.id} avatarUrl={item.avatarUrl} textValue={item.label}>
                                                    {item.label}
                                                </Select.Item>
                                            )}
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Назва {nodeType === 'department' ? 'відділу' : 'проекту'}</label>
                                        <Input
                                            value={name}
                                            onChange={(value) => setName(value)}
                                            placeholder={`Введіть назву ${nodeType === 'department' ? 'відділу' : 'проекту'}...`}
                                            isRequired
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <Button type="button" color="secondary" onClick={() => onOpenChange(false)}>
                                    Скасувати
                                </Button>
                                <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || (nodeType === 'user' && !userId) || (nodeType !== 'user' && !name)}>
                                    {editNode ? 'Зберегти' : 'Створити'}
                                </Button>
                            </div>
                        </form>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

const OrgStructurePage = () => {
    const [roots, setRoots] = useState<OrgNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [editNode, setEditNode] = useState<OrgNode | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'chart'>('chart');

    const loadTree = async () => {
        try {
            setLoading(true);
            const data = await orgStructureApi.getTree();
            setRoots(data.roots);
        } catch (error) {
            console.error(error);
            alert("Не вдалося завантажити структуру");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTree(); }, []);

    const handleCreateChild = (parentId: string) => {
        setSelectedParentId(parentId);
        setEditNode(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (node: OrgNode) => {
        setEditNode(node);
        setSelectedParentId(node.parent_id);
        setIsCreateModalOpen(true);
    };

    const handleDelete = async (node: OrgNode) => {
        if (!window.confirm(`Видалити ${node.name || 'елемент'}?`)) return;
        try {
            await orgStructureApi.deleteNode(node.id, true);
            alert("Видалено");
            loadTree();
        } catch (e) { alert("Помилка видалення"); }
    };

    const handleModalSuccess = () => {
        setIsCreateModalOpen(false);
        loadTree();
    };

    return (
        <TreeContext.Provider value={{ onCreateChild: handleCreateChild, onEdit: handleEdit, onDelete: handleDelete }}>
            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Організаційна структура</h1>
                        <p className="text-tertiary">Керування відділами, проектами та командами</p>
                    </div>
                    <Button onClick={() => { setSelectedParentId(null); setEditNode(null); setIsCreateModalOpen(true); }} iconLeading={Plus}>
                        Додати корінь
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="relative">
                            <Input
                                icon={Search}
                                placeholder="Пошук..."
                                value={searchQuery}
                                onChange={(value) => setSearchQuery(value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center rounded-lg border border-secondary bg-primary p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cx(
                                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                viewMode === 'list' ? "bg-secondary text-primary shadow-sm" : "text-tertiary hover:bg-secondary/50"
                            )}
                        >
                            <LayoutList size={16} />
                            Список
                        </button>
                        <button
                            onClick={() => setViewMode('chart')}
                            className={cx(
                                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                viewMode === 'chart' ? "bg-secondary text-primary shadow-sm" : "text-tertiary hover:bg-secondary/50"
                            )}
                        >
                            <Network size={16} />
                            Дерево
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto rounded-xl border border-secondary bg-primary shadow-sm">
                    {loading ? (
                        <LoaderDots />
                        // <div className="flex h-full items-center justify-center text-tertiary">Завантаження...</div>
                    ) : roots.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4 text-tertiary">
                            <FolderTree size={48} className="opacity-20" />
                            <p>Структура порожня</p>
                            <Button color="secondary" onClick={() => { setSelectedParentId(null); setIsCreateModalOpen(true); }}>
                                Створити перший елемент
                            </Button>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="flex flex-col gap-1 p-6">
                            {roots.map(node => (
                                <OrgNodeItemWrapper key={node.id} node={node} level={0} searchQuery={searchQuery} />
                            ))}
                        </div>
                    ) : (
                        <OrgChart
                            roots={roots}
                            onCreateChild={handleCreateChild}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>

                <CreateEditNodeModal
                    isOpen={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    parentId={selectedParentId}
                    editNode={editNode}
                    onSuccess={handleModalSuccess}
                />
            </div>
        </TreeContext.Provider>
    );
};

export default OrgStructurePage;
