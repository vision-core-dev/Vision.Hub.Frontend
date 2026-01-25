import { useState, useRef, type FormEvent, useCallback } from "react";
import { Attachment01, FaceSmile, Send01, X, Image01, File06 } from "@untitledui/icons";
import { Button } from "@/shared/ui/buttons/button";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility";
import { TextAreaBase } from "@/shared/ui/textarea/textarea";
import { cx } from "@/shared/utils/cx";
import { EmojiPicker } from "./EmojiPicker";
import { VoiceRecorder } from "./VoiceRecorder";

interface AttachedFile {
    file: File;
    preview?: string;
    type: "image" | "file" | "audio";
}

interface MessageInputProps {
    onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
    onSendVoiceMessage?: (audioBlob: Blob, duration: number) => Promise<void>;
    disabled?: boolean;
    className?: string;
}

export function MessageInput({ onSendMessage, onSendVoiceMessage, disabled, className }: MessageInputProps) {
    const [messageText, setMessageText] = useState("");
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Handle file selection
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
        const files = event.target.files;
        if (!files) return;

        const newFiles: AttachedFile[] = Array.from(files).map((file) => {
            const isImage = file.type.startsWith("image/");
            return {
                file,
                preview: isImage ? URL.createObjectURL(file) : undefined,
                type: isImage ? "image" : type,
            };
        });

        setAttachedFiles((prev) => [...prev, ...newFiles]);
        event.target.value = ""; // Reset input
    }, []);

    // Remove attached file
    const removeAttachment = useCallback((index: number) => {
        setAttachedFiles((prev) => {
            const newFiles = [...prev];
            // Revoke object URL if it's an image
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview!);
            }
            newFiles.splice(index, 1);
            return newFiles;
        });
    }, []);

    // Handle emoji selection
    const handleEmojiSelect = useCallback((emoji: string) => {
        setMessageText((prev) => prev + emoji);
        textAreaRef.current?.focus();
    }, []);

    // Handle voice recording complete
    const handleVoiceRecordingComplete = useCallback(async (audioBlob: Blob, duration: number) => {
        setIsRecordingVoice(false);
        if (onSendVoiceMessage) {
            try {
                setIsSending(true);
                await onSendVoiceMessage(audioBlob, duration);
            } finally {
                setIsSending(false);
            }
        }
    }, [onSendVoiceMessage]);

    // Handle form submit
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const hasContent = messageText.trim() || attachedFiles.length > 0;
        if (!hasContent || isSending || disabled) return;

        try {
            setIsSending(true);
            const files = attachedFiles.map((af) => af.file);
            await onSendMessage(messageText.trim(), files.length > 0 ? files : undefined);

            // Clear state
            setMessageText("");
            setAttachedFiles([]);
        } finally {
            setIsSending(false);
        }
    };

    // Handle keyboard shortcut (Ctrl/Cmd + Enter to send)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            const form = e.currentTarget.closest("form");
            if (form) {
                form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
            }
        }
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className={cx("flex flex-col gap-2", className)}>
            {/* Attached files preview */}
            {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2">
                    {attachedFiles.map((attachment, index) => (
                        <div
                            key={index}
                            className="relative flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 ring-1 ring-secondary"
                        >
                            {attachment.type === "image" && attachment.preview ? (
                                <img
                                    src={attachment.preview}
                                    alt={attachment.file.name}
                                    className="size-10 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex size-10 items-center justify-center rounded-md bg-tertiary/10">
                                    <File06 className="size-5 text-tertiary" />
                                </div>
                            )}

                            <div className="flex flex-col">
                                <span className="max-w-32 truncate text-sm font-medium text-secondary">
                                    {attachment.file.name}
                                </span>
                                <span className="text-xs text-tertiary">
                                    {formatFileSize(attachment.file.size)}
                                </span>
                            </div>

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-error-500 text-white transition-colors hover:bg-error-600"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Voice recording mode */}
            {isRecordingVoice ? (
                <div className="rounded-xl bg-secondary p-4">
                    <VoiceRecorder
                        onRecordingComplete={handleVoiceRecordingComplete}
                    />
                </div>
            ) : (
                /* Main input form */
                <form className="relative flex h-max items-center gap-3 w-full" onSubmit={handleSubmit}>
                    <TextAreaBase
                        ref={textAreaRef}
                        aria-label="Повідомлення"
                        placeholder="Напишіть повідомлення... (Ctrl+Enter для відправки)"
                        name="message"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled || isSending}
                        className="h-24 w-full resize-none pr-32"
                    />

                    {/* Actions panel */}
                    <div className="absolute right-3.5 bottom-2 flex items-center gap-2">
                        {/* Attachment buttons */}
                        <div className="relative flex items-center gap-0.5">
                            {/* Image attachment */}
                            <ButtonUtility
                                icon={Image01}
                                size="xs"
                                color="tertiary"
                                isDisabled={disabled || isSending}
                                onClick={() => imageInputRef.current?.click()}
                            />
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={(e) => handleFileSelect(e, "image")}
                            />

                            {/* File attachment */}
                            <ButtonUtility
                                icon={Attachment01}
                                size="xs"
                                color="tertiary"
                                isDisabled={disabled || isSending}
                                onClick={() => fileInputRef.current?.click()}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                hidden
                                onChange={(e) => handleFileSelect(e, "file")}
                            />

                            {/* Emoji picker */}
                            <div className="relative">
                                <ButtonUtility
                                    icon={FaceSmile}
                                    size="xs"
                                    color="tertiary"
                                    isDisabled={disabled || isSending}
                                    onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                                />
                                <EmojiPicker
                                    isOpen={isEmojiPickerOpen}
                                    onClose={() => setIsEmojiPickerOpen(false)}
                                    onEmojiSelect={handleEmojiSelect}
                                />
                            </div>

                            {/* Voice message */}
                            {onSendVoiceMessage && (
                                <VoiceRecorder
                                    onRecordingComplete={handleVoiceRecordingComplete}
                                />
                            )}
                        </div>

                        {/* Send button */}
                        <Button
                            type="submit"
                            size="sm"
                            color="primary"
                            iconLeading={Send01}
                            isLoading={isSending}
                            disabled={disabled || isSending || (!messageText.trim() && attachedFiles.length === 0)}
                        >
                            Відправити
                        </Button>
                    </div>
                </form>
            )}


        </div>
    );
}
