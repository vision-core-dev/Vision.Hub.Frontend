import { useRef, useState } from "react";
import Button from "../../../../basic/Button/Button";
import Input from "../../../../basic/Input/Input";
import styles from "./ChatFooter.module.css";
import { Send, Paperclip, X } from "lucide-react";

interface ChatFooterProps {
    onSend: (text: string | null, files: File[]) => void;
}

function ChatFooter({ onSend }: ChatFooterProps) {
    const [text, setText] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (!text.trim() && files.length === 0) return;

        onSend(text.trim() || null, files);
        setText("");
        setFiles([]);
    };

    const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
        e.target.value = ""; // дозволяє знову обрати той самий файл
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={styles.footer}>
            {/* прикріплені файли */}
            {files.length > 0 && (
                <div className={styles.attachments}>
                    {files.map((file, i) => (
                        <div key={i} className={styles.file}>
                            <span>{file.name}</span>
                            <X size={14} onClick={() => removeFile(i)} />
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.row}>
                <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip size={18} />
                </Button>

                <div className={styles.inputWrap}>
                    <Input
                        type="textarea"
                        value={text}
                        placeholder="Введіть повідомлення..."
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                </div>

                <Button
                    disabled={!text.trim() && files.length === 0}
                    onClick={handleSend}
                >
                    <Send />
                </Button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={handleFilesSelect}
            />
        </div>
    );
}

export default ChatFooter;
