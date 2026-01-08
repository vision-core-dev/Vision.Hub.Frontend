import {type FormEvent, useState} from "react";
import { Button } from "@/ui/base/buttons/button";
import { cx } from "@/utils/cx";
import {TextAreaBase} from "@/ui/base/textarea/textarea.tsx";

interface MessageActionTextareaProps {
    onSubmit?: (message: string) => void;
    onFilesSelect?: (files: File[]) => void;
    className?: string;
    textAreaClassName?: string;
}


interface Props {
    onSend: (text: string | null, files: File[]) => Promise<void>;
}

export function ChatComposer({ onSend }: Props) {
    const [files, setFiles] = useState<File[]>([]);

    const handleSubmit = async (text: string) => {
        if (!text && files.length === 0) return;

        await onSend(text || null, files);
        setFiles([]);
    };

    return (
        <div className="border-t border-gray-200 p-4">
            <MessageActionTextarea
                onSubmit={handleSubmit}
                onFilesSelect={setFiles}
            />
        </div>
    );
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
            className={cx("relative flex h-max items-center gap-3", className)}
            onSubmit={handleSubmit}
        >
            <TextAreaBase
                aria-label="Повідомлення"
                placeholder="Повідомлення"
                name="message"
                className={cx("h-32 w-full resize-none", textAreaClassName)}
            />

            <div className="absolute right-3.5 bottom-2 flex items-center gap-2">
                {/*<div className="flex items-center gap-0.5">*/}
                {/*    <label>*/}
                {/*        <ButtonUtility*/}
                {/*            icon={Attachment01}*/}
                {/*            size="xs"*/}
                {/*            color="tertiary"*/}
                {/*        />*/}
                {/*        <input*/}
                {/*            type="file"*/}
                {/*            hidden*/}
                {/*            multiple*/}
                {/*            onChange={(e) =>*/}
                {/*                onFilesSelect?.(*/}
                {/*                    Array.from(e.target.files || [])*/}
                {/*                )*/}
                {/*            }*/}
                {/*        />*/}
                {/*    </label>*/}

                {/*    <ButtonUtility*/}
                {/*        icon={FaceSmile}*/}
                {/*        size="xs"*/}
                {/*        color="tertiary"*/}
                {/*    />*/}
                {/*</div>*/}

                <Button size="sm" type="submit" color="link-color" isLoading={isLoading} isDisabled={isLoading}>
                    Відправити
                </Button>
            </div>
        </form>
    );
};
