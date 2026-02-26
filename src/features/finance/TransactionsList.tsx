import React, { useEffect, useState } from "react";
import styles from "./Finance.module.css";
import { Plus, Undo2, Search, Trash2 } from "lucide-react";
import { Table } from "@/shared/components/table/table";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api.ts";
import { safeDatetime } from "@/shared/utils/safeDate.ts";
import type { UserType } from "@/shared/types/Users.ts";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { AvatarLabelGroupWithDropdown } from "@/shared/ui/avatar";
import { ModalOverlay, Modal, Dialog } from "@/shared/components/modals/modal";
import { Input } from "@/shared/ui/input/input";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { PaginationCardDefault } from "@/shared/components/pagination/pagination";

interface Transaction {
    id: string;
    user_id: string;
    name: string;
    type: string;
    amount: number;
    transaction_at: string;
}

interface DataModel {
    transactions: Transaction[];
    users: UserType[];
    total_count: number;
    page: number;
    limit: number;
}

const TransactionsList: React.FC = () => {
    const [data, setData] = React.useState<DataModel | null>(null);
    const navigate = useNavigate();

    // Modal state
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [modalName, setModalName] = useState("");
    const [modalAmount, setModalAmount] = useState("");
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 30;

    const fetchData = React.useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit)
            });
            if (search) params.append("search", search);

            const response = await api.get(`/v1/Hub/Finance/GetTransactionsList?${params.toString()}`);
            const result: DataModel = await response.json();
            if (response.ok) {
                setData(result);
            }
        } catch (err) {
            console.error("Error fetching transactions data:", err);
        }
    }, [page, search, limit]);

    useEffect(() => {
        setPage(1); // Reset to page 1 to avoid being on out-of-bounds page when searching
    }, [search]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchData();
        }, 500); // Small debounce
        return () => clearTimeout(timeout);
    }, [fetchData]);

    const openModal = (tx: Transaction) => {
        setSelectedTx(tx);
        setModalName(tx.name);
        setModalAmount(String(tx.amount));
    };

    const closeModal = () => {
        setSelectedTx(null);
        setModalName("");
        setModalAmount("");
    };

    const handleSave = async () => {
        if (!selectedTx || !data) return;
        setSaving(true);

        const payload: Record<string, any> = { transaction_id: selectedTx.id };
        if (modalName !== selectedTx.name) payload.name = modalName;
        const numAmount = parseFloat(modalAmount);
        if (!isNaN(numAmount) && numAmount !== selectedTx.amount) payload.amount = numAmount;

        if (payload.name !== undefined || payload.amount !== undefined) {
            try {
                const res = await api.post("/v1/Hub/Finance/UpdateTransaction", payload);
                if (res.ok) {
                    const updated = await res.json();
                    setData({
                        ...data,
                        transactions: data.transactions.map(t =>
                            t.id === selectedTx.id
                                ? { ...t, name: updated.name, amount: updated.amount }
                                : t
                        ),
                    });
                }
            } catch (e) {
                console.error("Failed to update transaction", e);
            }
        }

        setSaving(false);
        closeModal();
    };

    const handleDelete = async () => {
        if (!selectedTx || !data) return;
        setSaving(true);

        try {
            const res = await api.post("/v1/Hub/Finance/DeleteTransaction", {
                transaction_id: selectedTx.id,
            });
            if (res.ok) {
                setData({
                    ...data,
                    transactions: data.transactions.filter(t => t.id !== selectedTx.id),
                });
                closeModal();
            }
        } catch (e) {
            console.error("Failed to delete transaction", e);
        }

        setSaving(false);
    };

    const returnElement = () => (
        <Button color="secondary" onClick={() => navigate("/finance")} iconLeading={Undo2}>
            Повернутись
        </Button>
    );

    if (!data)
        return <DefaultPage title="Транзакції" isLoading={true} action={returnElement()} />;

    const userMap = new Map<string, UserType>();
    data.users.forEach((u) => userMap.set(u.id, u));

    return (
        <DefaultPage
            title="Транзакції акаунтів"
            action={
                <>
                    {returnElement()}
                    <Button
                        color="primary"
                        iconLeading={Plus}
                        onClick={() => navigate("/finance/transactions/create")}
                    >
                        Додати транзакцію
                    </Button>
                </>
            }
        >
            <div className="mb-4">
                <Input
                    placeholder="Пошук за назвою..."
                    icon={Search}
                    value={search}
                    onChange={(val) => setSearch(val)}
                />
            </div>

            <div className="min-w-full overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
                <Table aria-label="Транзакції">
                    <Table.Header>
                        <Table.Head isRowHeader>Дата і час</Table.Head>
                        <Table.Head>Користувач</Table.Head>
                        <Table.Head>Назва</Table.Head>
                        <Table.Head>Тип</Table.Head>
                        <Table.Head>Сума</Table.Head>
                    </Table.Header>
                    <Table.Body items={data.transactions}>
                        {(item: Transaction) => (
                            <Table.Row
                                id={item.id}
                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                onAction={() => openModal(item)}
                            >
                                <Table.Cell>{safeDatetime(item.transaction_at)}</Table.Cell>
                                <Table.Cell>
                                    {(() => {
                                        const user = userMap.get(item.user_id);
                                        return user ? (
                                            <AvatarLabelGroupWithDropdown
                                                src={user.avatar_url || undefined}
                                                title={`${user.first_name || ""} ${user.last_name || ""}`}
                                                size="sm"
                                                userId={user.id}
                                                onViewProfile={() => navigate(`/users/u/${user.id}`)}
                                            />
                                        ) : (
                                            <span className={styles.unknownUser}>Невідомо</span>
                                        );
                                    })()}
                                </Table.Cell>
                                <Table.Cell>{item.name}</Table.Cell>
                                <Table.Cell>
                                    <span
                                        className={`${styles.status} ${item.type === "income"
                                            ? styles.green
                                            : item.type === "withdrawal"
                                                ? styles.blue
                                                : styles.gray
                                            }`}
                                    >
                                        {item.type === "income"
                                            ? "Надходження"
                                            : item.type === "withdrawal"
                                                ? "Вивід"
                                                : item.type}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>{item.amount.toFixed(2)} ₴</Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>

                {data.total_count > limit && (
                    <PaginationCardDefault
                        page={page}
                        total={Math.ceil(data.total_count / limit)}
                        onPageChange={setPage}
                    />
                )}
            </div>

            {/* ========== EDIT MODAL ========== */}
            <ModalOverlay isOpen={!!selectedTx} onOpenChange={(open) => !open && closeModal()}>
                <Modal className="max-w-md">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-primary">
                                    Редагування транзакції
                                </h2>
                                <CloseButton
                                    onClick={closeModal}
                                />
                            </div>

                            {selectedTx && (
                                <>
                                    {/* Info */}
                                    <div className="flex flex-col gap-1 text-sm text-tertiary">
                                        <span>
                                            Дата: {safeDatetime(selectedTx.transaction_at)}
                                        </span>
                                        <span>
                                            Тип:{" "}
                                            {selectedTx.type === "income"
                                                ? "Надходження"
                                                : selectedTx.type === "withdrawal"
                                                    ? "Вивід"
                                                    : selectedTx.type}
                                        </span>
                                        {(() => {
                                            const user = userMap.get(selectedTx.user_id);
                                            return user ? (
                                                <span>
                                                    Користувач: {user.first_name} {user.last_name}
                                                </span>
                                            ) : null;
                                        })()}
                                    </div>

                                    {/* Name */}
                                    <Input
                                        label="Назва:"
                                        value={modalName}
                                        onChange={(val) => setModalName(val)}
                                        placeholder="Назва транзакції"
                                    />

                                    {/* Amount */}
                                    <Input
                                        label="Сума (₴):"
                                        value={modalAmount}
                                        onChange={(val) => setModalAmount(val)}
                                        placeholder="Сума"
                                    />

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-2">
                                        <Button
                                            color="primary-destructive"
                                            size="sm"
                                            iconLeading={Trash2}
                                            onClick={handleDelete}
                                            disabled={saving}
                                        >
                                            Видалити
                                        </Button>

                                        <div className="flex gap-2">
                                            <Button
                                                color="secondary"
                                                size="sm"
                                                onClick={closeModal}
                                            >
                                                Скасувати
                                            </Button>
                                            <Button
                                                color="primary"
                                                size="sm"
                                                onClick={handleSave}
                                                disabled={saving}
                                                isLoading={saving}
                                            >
                                                Зберегти
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DefaultPage>
    );
};

export default TransactionsList;
