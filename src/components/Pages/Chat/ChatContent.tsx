import {EmptyState} from "@/ui/application/empty-state/empty-state.tsx";
import {Button} from "@/ui/base/buttons/button.tsx";
import {type FormEvent, useState} from "react";
import {cx} from "@/utils/cx.ts";
import {TextAreaBase} from "@/ui/base/textarea/textarea.tsx";
import {ButtonUtility} from "@/ui/base/buttons/button-utility.tsx";
import {Attachment01, FaceSmile} from "@untitledui/icons";

export default function ChatContent({ children }: { children?: React.ReactNode }) {
    return (
        <section className="flex flex-1 flex-col">
            {/* Header */}
            <div className="border-secondary md:border-r px-6 py-4">
                <h3 className="text-sm font-semibold">
                    Оберіть чат
                </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
                {children ?? (
                    <EmptyState size="md">
                        <EmptyState.Header>
                            <EmptyState.FeaturedIcon color="gray" />
                        </EmptyState.Header>

                        <EmptyState.Content>
                            <EmptyState.Title>Немає повідомлень</EmptyState.Title>
                            <EmptyState.Description>Відправте перше повідомлення, щоб розпочати спілкування.</EmptyState.Description>
                        </EmptyState.Content>
                    </EmptyState>
                )}
            </div>

            {/* Input */}
            <div className="border-secondary md:border-r p-4 gap-2 flex w-full">
                <MessageActionTextarea />
            </div>
        </section>
    );
}

interface MessageActionTextareaProps {
    onSubmit?: (message: string) => void;
    onFilesSelect?: (files: File[]) => void;
    className?: string;
    textAreaClassName?: string;
}

const MessageActionTextarea = ({
                                   onSubmit,
                                   className,
                                   textAreaClassName,
                               }: MessageActionTextareaProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const message = (formData.get("message") as string) || "";
        onSubmit?.(message);

        e.currentTarget.reset();
        setIsLoading(false);
    };

    return (
        <form
            className={cx("relative flex h-max items-center gap-3 w-full", className)}
            onSubmit={handleSubmit}
        >
            <TextAreaBase
                aria-label="Повідомлення"
                placeholder="Повідомлення"
                name="message"
                className={cx("h-32 w-full resize-none", textAreaClassName)}
            />

            <div className="absolute right-3.5 bottom-2 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                    <label>
                        <ButtonUtility
                            icon={Attachment01}
                            size="xs"
                            color="tertiary"
                        />
                        <input
                            type="file"
                            hidden
                            multiple
                        />
                    </label>

                    <ButtonUtility
                        icon={FaceSmile}
                        size="xs"
                        color="tertiary"
                    />
                </div>

                <Button size="sm" type="submit" color="link-color" isLoading={isLoading} showTextWhileLoading>
                    Відправити
                </Button>
            </div>
        </form>
    );
};