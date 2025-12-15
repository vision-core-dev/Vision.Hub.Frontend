import styles from "./MessageBubble.module.css";

interface Props {
    from: "user" | "operator";
    html?: string | null;
    files?: string[];
    createdAt: string;
}

const isImage = (url: string) =>
    /\.(png|jpe?g|gif|webp|svg)$/i.test(url);

function MessageBubble({ from, html, files = [], createdAt }: Props) {
    const hasText = html && html.trim() !== "";
    const hasFiles = files.length > 0;

    if (!hasText && !hasFiles) return null;

    return (
        <div className={`${styles.wrapper} ${styles[from]}`}>
            <div className={styles.bubble}>
                {hasText && (
                    <div
                        className={styles.text}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                )}

                {hasFiles && (
                    <div className={styles.files}>
                        {files.map((url) =>
                            isImage(url) ? (
                                <img
                                    key={url}
                                    src={url}
                                    alt=""
                                    className={styles.image}
                                />
                            ) : (
                                <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.file}
                                >
                                    📎 Завантажити файл
                                </a>
                            )
                        )}
                    </div>
                )}
            </div>

            <span className={styles.time}>
                {new Date(createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </span>
        </div>
    );
}

export default MessageBubble;
