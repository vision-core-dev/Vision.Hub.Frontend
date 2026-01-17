import React, { useEffect, useRef } from "react";
import styles from "./TextEditor.module.css";
import {
    Image,
    Link,
    Bold,
    Italic,
    Quote,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
} from "lucide-react";
import { api } from "@/shared/utils/api.ts";

interface Props {
    mode: "view" | "edit";
    value: string;
    onChange?: (html: string) => void;
    onUploadImage?: (file: File) => Promise<string | void>;
}

const TextEditor: React.FC<Props> = ({ mode, value, onChange, onUploadImage }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const htmlRef = useRef(value || "");

    // 🔄 Синхронізація при зовнішніх змінах
    useEffect(() => {
        htmlRef.current = value || "";
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value]);

    // 🧠 Обробка вводу
    const handleInput = () => {
        htmlRef.current = editorRef.current?.innerHTML || "";
    };

    // 💾 Автосейв при blur
    const handleBlur = () => {
        onChange?.(htmlRef.current);
    };

    // ✅ Вставка з форматуванням (зберігає HTML)
    const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData.items;
        let handledImage = false;

        // 🖼️ Якщо вставлено зображення
        for (const item of items) {
            if (item.type.startsWith("image/")) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) return;
                handledImage = true;

                try {
                    let imageUrl = "";
                    if (onUploadImage) {
                        const result = await onUploadImage(file);
                        if (typeof result === "string") imageUrl = result;
                    } else {
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await api.post(`/v1/Hub/UploadImage`, formData);
                        const data = await res.json();
                        imageUrl = data.file_url;
                    }

                    if (imageUrl) {
                        document.execCommand(
                            "insertHTML",
                            false,
                            `<img src="${imageUrl}" alt="" style="max-width:100%;border-radius:8px;margin:6px 0;"/>`
                        );
                    }
                } catch (err) {
                    console.error("Помилка при вставці зображення:", err);
                }
            }
        }

        // Якщо це не зображення — вставляємо звичайний текст/HTML
        if (!handledImage) {
            e.preventDefault();
            const html = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");
            document.execCommand("insertHTML", false, html);
        }
    };

    // ⏎ Enter → новий рядок
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // 🎯 Гарячі клавіші форматування
        if (e.ctrlKey) {
            switch (e.key.toLowerCase()) {
                case "b":
                    e.preventDefault();
                    document.execCommand("bold");
                    break;
                case "i":
                    e.preventDefault();
                    document.execCommand("italic");
                    break;
                case "u":
                    e.preventDefault();
                    document.execCommand("underline");
                    break;
                case "x":
                    if (e.shiftKey) {
                        e.preventDefault();
                        document.execCommand("strikeThrough");
                    }
                    break;
            }
        }

        // ⏎ Enter → новий рядок <div><br></div>
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            document.execCommand("insertHTML", false, "<div><br></div>");
        }
    };

    // 🖼️ Завантаження зображення
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (onUploadImage) {
            const result = await onUploadImage(file);
            if (typeof result === "string") {
                document.execCommand("insertHTML", false, `<img src="${result}" alt=""/>`);
            }
        } else {
            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post(`/v1/Hub/UploadImage`, formData);
            const data = await res.json();

            document.execCommand("insertHTML", false, `<img src="${data.file_url}" alt=""/>`);
        }
    };

    if (mode === "view") {
        return <div className={styles.viewer} dangerouslySetInnerHTML={{ __html: value }} />;
    }

    return (
        <div className={styles.editor}>
            <div className={styles.toolbar}>
                <button type="button" onClick={() => document.execCommand("bold")}>
                    <Bold size={16} />
                </button>
                <button type="button" onClick={() => document.execCommand("italic")}>
                    <Italic size={16} />
                </button>
                <button type="button" onClick={() => document.execCommand("underline")}>
                    <Underline size={16} />
                </button>
                <button type="button" onClick={() => document.execCommand("strikeThrough")}>
                    <Strikethrough size={16} />
                </button>

                <button type="button" onClick={() => document.execCommand("insertUnorderedList")}>
                    <List size={16} />
                </button>
                <button type="button" onClick={() => document.execCommand("insertOrderedList")}>
                    <ListOrdered size={16} />
                </button>

                <button type="button" onClick={() => document.execCommand("formatBlock", false, "blockquote")}>
                    <Quote size={16} />
                </button>

                <label className={styles.upload}>
                    <Image size={16} />
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </label>

                <button
                    type="button"
                    onClick={() => {
                        const url = prompt("Введіть URL:");
                        if (url) document.execCommand("createLink", false, url);
                    }}
                >
                    <Link size={16} />
                </button>
            </div>

            <div
                ref={editorRef}
                className={styles.content}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onBlur={handleBlur}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

export default TextEditor;





