import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { Search, Plus, ShieldCheck, ShieldX, ArrowLeft } from "lucide-react";

interface Certificate {
    ShortCode: string;
    IssuedBy: number;
    Issued: number;
    Revoked: number;
}

interface PlayerData {
    UserId: number;
    Username: string;
    Certificates: Certificate[];
}

interface PlayerPreview {
    user_id: number;
    username: string;
    certificates_count: number;
    created: number;
}

interface CertificateType {
    short_code: string;
    name: string;
}

export default function KolektoralPage() {
    const [players, setPlayers] = useState<PlayerPreview[]>([]);
    const [certTypes, setCertTypes] = useState<CertificateType[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Detail view
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            api.get("/v1/Hub/Kolektoral/Players").then(async r => r.ok ? setPlayers(await r.json()) : null),
            api.get("/v1/Hub/Kolektoral/Certificates").then(async r => r.ok ? setCertTypes(await r.json()) : null),
        ]).finally(() => setLoading(false));
    }, []);

    const openPlayer = async (userId: number) => {
        setDetailLoading(true);
        const res = await api.get(`/v1/Hub/Kolektoral/Players/${userId}/Join`);
        if (res.ok) {
            const data = await res.json();
            if (data.player) setSelectedPlayer(data.player);
        }
        setDetailLoading(false);
    };

    const refreshPlayer = async () => {
        if (!selectedPlayer) return;
        const res = await api.get(`/v1/Hub/Kolektoral/Players/${selectedPlayer.UserId}/Join`);
        if (res.ok) {
            const data = await res.json();
            if (data.player) setSelectedPlayer(data.player);
        }
    };

    const issueCert = async (shortCode: string) => {
        if (!selectedPlayer) return;
        setActionLoading(shortCode);
        await api.post(`/v1/Hub/Kolektoral/Players/${selectedPlayer.UserId}/Certificates/Issue`, { short_code: shortCode });
        await refreshPlayer();
        setActionLoading(null);
    };

    const revokeCert = async (shortCode: string) => {
        if (!selectedPlayer) return;
        setActionLoading(shortCode);
        await api.post(`/v1/Hub/Kolektoral/Players/${selectedPlayer.UserId}/Certificates/Revoke`, { short_code: shortCode });
        await refreshPlayer();
        setActionLoading(null);
    };

    const getCertName = (code: string) => certTypes.find(c => c.short_code === code)?.name || code;

    const filtered = players.filter(p =>
        p.username.toLowerCase().includes(search.toLowerCase()) ||
        String(p.user_id).includes(search)
    );

    // ─── Detail view ───
    if (selectedPlayer) {
        const activeCerts = selectedPlayer.Certificates.filter(c => c.Revoked === 0);
        const revokedCerts = selectedPlayer.Certificates.filter(c => c.Revoked !== 0);

        return (
            <DefaultPage title="Колекторал">
                <Button color="link-color" onClick={() => setSelectedPlayer(null)} iconLeading={ArrowLeft}>
                    Назад до списку
                </Button>

                <div className="flex flex-col gap-6 mt-2">
                    {/* Player header */}
                    <div className="flex items-center gap-4 rounded-xl border border-border-secondary bg-primary p-5">
                        <img
                            src={`https://thumbs.roblox.com/v1/users/avatar-headshot?userIds=${selectedPlayer.UserId}&size=150x150&format=Png&isCircular=true`}
                            alt={selectedPlayer.Username}
                            className="w-14 h-14 rounded-full bg-secondary"
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-fg-primary">{selectedPlayer.Username || `ID: ${selectedPlayer.UserId}`}</h3>
                            <p className="text-sm text-fg-tertiary">Roblox ID: {selectedPlayer.UserId}</p>
                        </div>
                    </div>

                    {/* Issue */}
                    <div className="rounded-xl border border-border-secondary bg-primary p-5">
                        <h4 className="text-base font-semibold text-fg-primary mb-3">Видати сертифікат</h4>
                        <div className="flex flex-wrap gap-2">
                            {certTypes.map(ct => {
                                const has = activeCerts.some(c => c.ShortCode === ct.short_code);
                                return (
                                    <Button key={ct.short_code} size="sm" color={has ? "tertiary" : "primary"}
                                        isDisabled={has} isLoading={actionLoading === ct.short_code}
                                        iconLeading={Plus} onClick={() => issueCert(ct.short_code)}>
                                        {ct.name}
                                    </Button>
                                );
                            })}
                            {certTypes.length === 0 && <p className="text-sm text-fg-quaternary">Немає типів сертифікатів</p>}
                        </div>
                    </div>

                    {/* Active */}
                    <div className="rounded-xl border border-border-secondary bg-primary p-5">
                        <h4 className="text-base font-semibold text-fg-primary mb-3">Активні ({activeCerts.length})</h4>
                        {activeCerts.length === 0 ? (
                            <p className="text-sm text-fg-quaternary">Немає</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {activeCerts.map(c => (
                                    <div key={c.ShortCode} className="flex items-center justify-between gap-3 rounded-lg border border-border-secondary p-3">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={18} className="text-fg-success-primary shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-fg-primary">{getCertName(c.ShortCode)}</span>
                                                <span className="text-xs text-fg-quaternary ml-2">{c.ShortCode}</span>
                                                <p className="text-xs text-fg-tertiary">Видано: {new Date(c.Issued * 1000).toLocaleDateString("uk-UA")}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" color="secondary-destructive" isLoading={actionLoading === c.ShortCode}
                                            onClick={() => revokeCert(c.ShortCode)}>Відкликати</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Revoked */}
                    {revokedCerts.length > 0 && (
                        <div className="rounded-xl border border-border-secondary bg-primary p-5">
                            <h4 className="text-base font-semibold text-fg-primary mb-3">Відкликані ({revokedCerts.length})</h4>
                            <div className="flex flex-col gap-2">
                                {revokedCerts.map(c => (
                                    <div key={c.ShortCode + c.Revoked} className="flex items-center justify-between gap-3 rounded-lg border border-border-secondary p-3 opacity-60">
                                        <div className="flex items-center gap-3">
                                            <ShieldX size={18} className="text-fg-error-primary shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-fg-primary">{getCertName(c.ShortCode)}</span>
                                                <p className="text-xs text-fg-tertiary">Відкликано: {new Date(c.Revoked * 1000).toLocaleDateString("uk-UA")}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" color="secondary" isLoading={actionLoading === c.ShortCode}
                                            onClick={() => issueCert(c.ShortCode)}>Відновити</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DefaultPage>
        );
    }

    // ─── Players list ───
    return (
        <DefaultPage title="Колекторал" isLoading={loading}>
            <div className="max-w-md">
                <Input
                    placeholder="Пошук по ніку або ID..."
                    value={search}
                    onChange={setSearch}
                    icon={Search}
                />
            </div>

            <div className="flex flex-col gap-2 mt-4">
                {filtered.length === 0 && !loading && (
                    <p className="text-fg-quaternary text-sm">Гравців не знайдено</p>
                )}
                {filtered.map(p => (
                    <div
                        key={p.user_id}
                        onClick={() => openPlayer(p.user_id)}
                        className="flex items-center gap-4 rounded-xl border border-border-secondary bg-primary p-4 cursor-pointer transition-colors hover:bg-primary_hover"
                    >
                        <img
                            src={`https://thumbs.roblox.com/v1/users/avatar-headshot?userIds=${p.user_id}&size=150x150&format=Png&isCircular=true`}
                            alt={p.username}
                            className="w-10 h-10 rounded-full bg-secondary"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-fg-primary truncate">{p.username || `ID: ${p.user_id}`}</p>
                            <p className="text-xs text-fg-tertiary">ID: {p.user_id}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <ShieldCheck size={14} className="text-fg-success-primary" />
                            <span className="text-sm font-medium text-fg-primary">{p.certificates_count}</span>
                        </div>
                    </div>
                ))}
            </div>

            {detailLoading && (
                <div className="fixed inset-0 bg-overlay/50 flex items-center justify-center z-50">
                    <div className="bg-primary rounded-xl p-6 shadow-xl text-fg-primary">Завантаження...</div>
                </div>
            )}
        </DefaultPage>
    );
}
