import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import {KanbanSquareDashed, Plus, SquareDashedKanban} from "lucide-react";
import {api} from "@/shared/utils/api.ts";
import {Button} from "@/shared/ui/buttons/button.tsx";
import {cx} from "@/shared/utils/cx.ts";
import {Dialog, DialogTrigger, Modal, ModalOverlay} from "@/shared/components/modals/modal.tsx";
import {CloseButton} from "@/shared/ui/buttons/close-button.tsx";
import {FeaturedIcon} from "@/shared/assets/icons/featured-icon/featured-icon.tsx";
import {BackgroundPattern} from "@/shared/assets/background-patterns";
import {Heading} from "react-aria-components";
import {Input} from "@/shared/ui/input/input.tsx";
import {TextArea} from "@/shared/ui/textarea/textarea.tsx";

type BoardType = {
    id: string;
    name: string;
    description?: string | null;
    banner_url?: string | null;
    created_at: string;
    total_tasks: number;
    done_tasks: number;
    overdue_tasks: number;
    due_today_tasks: number;
};

const BoardsListPage = () => {
    const [boards, setBoards] = useState<BoardType[]>([]);
    const [loading, setLoading] = useState(true);
    const [createNewBoard, setCreateNewBoard] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                setLoading(true);
                const res = await api.get("/v1/Hub/Boards/List");
                if (res.ok) {
                    const data = await res.json();
                    setBoards(data.list); // 🔹 очікується BoardsListResponse { total, list }
                } else {
                    console.error("Failed to load boards");
                }
            } catch (err) {
                console.error("Error fetching boards:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBoards();
    }, []);


    return (
        <DefaultPage
            title="Дошки"
            action={
                <Button onClick={() => setCreateNewBoard(true)} iconLeading={Plus}
                >Додати</Button>
            }
            isLoading={loading}
        >
            {boards.length === 0 ? (
                <p>Поки немає жодної дошки.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {boards.map((board) => (
                        <BoardCard
                            key={board.id}
                            board={board}
                            onClick={() => navigate(`/boards/b/${board.id}`)}
                        />
                    ))}
                </div>
            )}

            <CreateBoardModal isOpen={createNewBoard} setIsOpen={setCreateNewBoard} />

        </DefaultPage>
    );
};

interface BoardCardProps {
    board: BoardType;
    onClick: () => void;
}

const BoardCard = ({ board, onClick }: BoardCardProps) => {
    return (
        <div
            onClick={onClick}
            className={cx(
                "group cursor-pointer overflow-hidden rounded-xl border border-secondary bg-primary transition",
                "hover:shadow-lg hover:border-primary_hover"
            )}
        >
            {/* 🖼 Banner */}
            <div className="relative h-36 w-full bg-secondary">
                {board.banner_url ? (
                    <img
                        src={board.banner_url}
                        alt={board.name}
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-fg-tertiary">
                        <SquareDashedKanban className="size-10" />
                    </div>
                )}
            </div>

            {/* 📝 Content */}
            <div className="flex flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold text-fg-primary">
                    {board.name}
                </h3>

                {board.description && (
                    <p className="line-clamp-2 text-xs text-fg-secondary">
                        {board.description}
                    </p>
                )}

                {board.total_tasks > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        <BoardBadge label={`${board.total_tasks}`} color="gray" title="Всього задач" />
                        {board.done_tasks > 0 && (
                            <BoardBadge label={`${board.done_tasks} ✓`} color="green" title="Завершено" />
                        )}
                        {board.due_today_tasks > 0 && (
                            <BoardBadge label={`${board.due_today_tasks} сьогодні`} color="yellow" title="Дедлайн сьогодні" />
                        )}
                        {board.overdue_tasks > 0 && (
                            <BoardBadge label={`${board.overdue_tasks} прострочено`} color="red" title="Прострочено" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}




const badgeColors = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
};

const BoardBadge = ({ label, color, title }: { label: string; color: keyof typeof badgeColors; title: string }) => (
    <span title={title} className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${badgeColors[color]}`}>
        {label}
    </span>
);

interface CreateUserModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const CreateBoardModal = ({ isOpen, setIsOpen }: CreateUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        description: ""
    });

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/v1/Hub/Boards/Create", form);

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Помилка");
            }

            setIsOpen(false);
            window.location.reload(); // або callback для оновлення списку
        } catch {
            setError("Не вдалося створити користувача.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog className="overflow-hidden">
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-172 lg:max-w-100">
                            <CloseButton onClick={() => setIsOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />

                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max max-sm:hidden">
                                    <FeaturedIcon color="gray" size="lg" theme="modern" icon={KanbanSquareDashed} />

                                    <BackgroundPattern pattern="circle" size="sm" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <Heading slot="title" className="text-md font-semibold text-primary">
                                        Створити дошку
                                    </Heading>
                                    <p className="text-sm text-tertiary">Створіть дошку щоб контролювати задачі співробітників.</p>
                                </div>
                            </div>

                            <div className="h-5 w-full" />
                            <div className="w-full border-t border-secondary" />
                            <div className="flex flex-col justify-start gap-4 px-4 pt-5 sm:px-6">

                                <Input isRequired label="Назва" placeholder="Дошка"
                                       value={form.name}
                                       onChange={(value) =>
                                           setForm({ ...form, name: value })
                                       }
                                />

                                <TextArea label="Опис" placeholder="Опис..."
                                       value={form.description}
                                       onChange={(value) =>
                                           setForm({ ...form, description: value })
                                       }
                                />

                                {error && (
                                    <p className="text-sm text-error">
                                        {error}
                                    </p>
                                )}
                            </div>


                            <div className="z-10 flex flex-col pt-6 pb-4 sm:pt-8 sm:pb-6">
                                <div className="w-full border-t border-secondary" />

                                <div className="h-4 w-full sm:h-6" />
                                <div className="flex flex-1 flex-col-reverse gap-3 px-4 sm:grid sm:grid-cols-2 sm:px-6">
                                    <Button color="secondary" onClick={() => setIsOpen(false)}>
                                        Скасувати
                                    </Button>
                                    <Button color="primary" onClick={handleSubmit} isLoading={loading} showTextWhileLoading>
                                        Створити
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};


export default BoardsListPage;










