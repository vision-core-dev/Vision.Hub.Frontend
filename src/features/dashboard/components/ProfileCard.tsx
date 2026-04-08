import { useNavigate } from "react-router-dom";
import { Avatar, AvatarLabelGroup } from "@/shared/ui/avatar";
import { Briefcase, ChevronRight, Building2, Crown } from "lucide-react";
import type { MeUser, MyRole } from "@/shared/types/AuthUser";

interface Position {
    position: string;
    project: string | null;
    project_type: string | null;
    is_head: boolean;
}

interface OrgPerson {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    active_badge_emoji: string | null;
    role_name: string | null;
}

interface Props {
    user: MeUser;
    role: MyRole;
    positions: Position[];
    supervisors: OrgPerson[];
    subordinates: OrgPerson[];
}

export default function ProfileCard({ user, role, positions, supervisors, subordinates }: Props) {
    const navigate = useNavigate();

    return (
        <div className="rounded-xl border border-border-secondary bg-primary p-5 shadow-xs flex flex-col gap-4">
            {/* User header */}
            <div
                className="flex items-center gap-3 cursor-pointer hover:bg-primary_hover rounded-lg p-1 -m-1 transition-colors"
                onClick={() => navigate(`/users/u/${user.id}`)}
            >
                <Avatar size="lg" src={user.avatar_url} alt={user.first_name || ""} />
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-base font-semibold text-fg-primary">
                        {user.first_name} {user.last_name || ""}{user.active_badge_emoji ? ` ${user.active_badge_emoji}` : ""}
                    </span>
                    <span className="text-sm text-fg-tertiary">{role.name}</span>
                </div>
                <ChevronRight size={16} className="text-fg-quaternary shrink-0" />
            </div>

            {/* Projects & positions */}
            {positions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-fg-quaternary uppercase tracking-wider">Проєкти</span>
                    <div className="flex flex-col gap-1.5">
                        {positions.map((p, i) => (
                            <div key={i} className="flex items-center gap-2.5 rounded-lg bg-secondary/30 px-3 py-2">
                                {p.project_type === "department" ? (
                                    <Building2 size={14} className="text-blue-500 shrink-0" />
                                ) : (
                                    <Briefcase size={14} className="text-purple-500 shrink-0" />
                                )}
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-medium text-fg-primary truncate">{p.project || "—"}</span>
                                    {p.position && (
                                        <span className="text-xs text-fg-tertiary">{p.position}</span>
                                    )}
                                </div>
                                {p.is_head && (
                                    <Crown size={12} className="text-fg-warning-primary shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Supervisors */}
            {supervisors.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-fg-quaternary uppercase tracking-wider">Керівники</span>
                    <div className="flex flex-col gap-1.5">
                        {supervisors.map(s => (
                            <AvatarLabelGroup
                                key={s.id}
                                size="sm"
                                src={s.avatar_url}
                                title={`${s.first_name} ${s.last_name || ""}`}
                                subtitle={s.role_name || ""}
                                badgeEmoji={s.active_badge_emoji}
                                userId={s.id}
                                onClick={() => navigate(`/users/u/${s.id}`)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Subordinates */}
            {subordinates.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-fg-quaternary uppercase tracking-wider">Підлеглі</span>
                    <div className="flex flex-col gap-1.5">
                        {subordinates.map(s => (
                            <AvatarLabelGroup
                                key={s.id}
                                size="sm"
                                src={s.avatar_url}
                                title={`${s.first_name} ${s.last_name || ""}`}
                                subtitle={s.role_name || ""}
                                badgeEmoji={s.active_badge_emoji}
                                userId={s.id}
                                onClick={() => navigate(`/users/u/${s.id}`)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
