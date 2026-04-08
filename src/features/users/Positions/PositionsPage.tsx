import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { Avatar } from "@/shared/ui/avatar";
import { Input } from "@/shared/ui/input/input";
import { Button } from "@/shared/ui/buttons/button";
import { Search, Briefcase, Check } from "lucide-react";

interface OrgNode {
    id: string;
    node_type: string;
    name: string | null;
    user_id: string | null;
    parent_id: string | null;
    user?: {
        id: string;
        first_name: string;
        last_name: string | null;
        avatar_url: string | null;
        role?: { name: string };
    };
    children?: OrgNode[];
}

interface FlatPosition {
    node_id: string;
    user_name: string;
    user_avatar: string | null;
    role_name: string;
    position: string;
    project_name: string;
    project_type: string;
}

function flattenTree(nodes: OrgNode[], parentName = "", parentType = ""): FlatPosition[] {
    const result: FlatPosition[] = [];
    for (const node of nodes) {
        const currentName = node.name || parentName;
        const currentType = node.node_type === "user" ? parentType : node.node_type;

        if (node.node_type === "user" && node.user) {
            result.push({
                node_id: node.id,
                user_name: `${node.user.first_name} ${node.user.last_name || ""}`.trim(),
                user_avatar: node.user.avatar_url || null,
                role_name: node.user.role?.name || "",
                position: node.name || "",
                project_name: parentName,
                project_type: parentType,
            });
        }

        if (node.children?.length) {
            result.push(...flattenTree(node.children, currentName, currentType));
        }
    }
    return result;
}

export default function PositionsPage() {
    const [positions, setPositions] = useState<FlatPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const res = await api.get("/v1/Hub/OrgStructure/Tree");
        if (res.ok) {
            const data = await res.json();
            const flat = flattenTree(data.roots || []);
            setPositions(flat);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (nodeId: string) => {
        setSaving(true);
        const res = await api.patch(`/v1/Hub/OrgStructure/Node/${nodeId}`, { name: editValue });
        if (res.ok) {
            setPositions(prev => prev.map(p =>
                p.node_id === nodeId ? { ...p, position: editValue } : p
            ));
        }
        setEditing(null);
        setSaving(false);
    };

    const filtered = positions.filter(p =>
        p.user_name.toLowerCase().includes(search.toLowerCase()) ||
        p.project_name.toLowerCase().includes(search.toLowerCase()) ||
        p.position.toLowerCase().includes(search.toLowerCase())
    );

    // Group by project
    const grouped = new Map<string, FlatPosition[]>();
    for (const p of filtered) {
        const key = p.project_name || "Без проєкту";
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(p);
    }

    return (
        <DefaultPage title="Посади" isLoading={loading}>
            <div className="max-w-2xl">
                <Input
                    placeholder="Пошук по імені, проєкту або посаді..."
                    value={search}
                    onChange={setSearch}
                    icon={Search}
                />
            </div>

            <div className="flex flex-col gap-6 mt-4">
                {[...grouped.entries()].map(([projectName, members]) => (
                    <div key={projectName} className="rounded-xl border border-border-secondary bg-primary p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase size={16} className="text-fg-brand-primary" />
                            <h3 className="text-base font-semibold text-fg-primary">{projectName}</h3>
                            <span className="text-xs text-fg-quaternary ml-1">{members.length}</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            {members.map((p) => (
                                <div key={p.node_id} className="flex items-center gap-3 rounded-lg border border-border-secondary px-3 py-2.5">
                                    <Avatar size="sm" src={p.user_avatar} alt={p.user_name} />

                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm font-medium text-fg-primary truncate">{p.user_name}</span>
                                        <span className="text-xs text-fg-quaternary">{p.role_name}</span>
                                    </div>

                                    {editing === p.node_id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSave(p.node_id)}
                                                className="w-40 rounded-md border border-border-brand px-2 py-1 text-sm bg-primary text-fg-primary outline-none"
                                                placeholder="Посада..."
                                            />
                                            <Button size="sm" isLoading={saving} iconLeading={Check} onClick={() => handleSave(p.node_id)} />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setEditing(p.node_id); setEditValue(p.position); }}
                                            className="text-sm text-fg-tertiary hover:text-fg-primary transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-secondary/50"
                                        >
                                            {p.position || "Додати посаду"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {grouped.size === 0 && !loading && (
                    <p className="text-fg-quaternary text-sm">Нікого не знайдено</p>
                )}
            </div>
        </DefaultPage>
    );
}
