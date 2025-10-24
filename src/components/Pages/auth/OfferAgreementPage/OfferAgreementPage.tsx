import React, { useEffect, useState, useRef } from "react";
import styles from "./OfferAgreementPage.module.css";
import { Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../basic/Button/Button.tsx";
import {api} from "../../../../utils/api.ts";
import LoaderDots from "../../../basic/LoaderDots/LoaderDots.tsx";

interface DocumentResponse {
    document: {
        id: string;
        title: string;
        content: string;
        author_id: string;
        updated_at: string;
    };
}

const OfferAgreementPage: React.FC = () => {
    const navigate = useNavigate();
    const [html, setHtml] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, ] = useState<string | null>(null);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);

    const contentRef = useRef<HTMLDivElement | null>(null);

    const handleAccept = async () => {
        try {
            const res = await api.post("/v1/Hub/Auth/AcceptOffer");
            if (!res.ok) {
                throw new Error("Failed to accept the offer agreement.");
            }
            navigate("/dashboard");
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    const handleScroll = () => {
        const el = contentRef.current;
        if (!el) return;
        const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
        if (isBottom) setScrolledToBottom(true);
    };

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const res = await api.get(
                    "/v1/Hub/Knowledge/d0a39bc9-dfa4-40d6-b319-cad8f2117300/GetDocument"
                );
                const data: DocumentResponse = await res.json();
                setHtml(data.document.content);
            } finally {
                setLoading(false);
            }
        };
        fetchOffer();
    }, []);

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.icon}>
                        <Handshake size={40} strokeWidth={1.8} />
                    </div>
                    <h1 className={styles.title}>Публічна оферта про співпрацю</h1>
                    <p className={styles.subtitle}>
                        Привіт 👋 Радий, що ти з нами у Vision Core Dev!
                        Ознайомся з умовами співпраці, щоб продовжити.
                    </p>
                </div>

                <div
                    ref={contentRef}
                    onScroll={handleScroll}
                    className={styles.textBox}
                >
                    {loading ? (
                        <div className={styles.loader}>
                            <LoaderDots />
                        </div>
                    ) : error ? (
                        <p className={styles.error}>{error}</p>
                    ) : (
                        <div
                            className={styles.document}
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    )}
                </div>

                <div className={styles.actions}>
                    <Button
                        onClick={handleAccept}
                        disabled={!scrolledToBottom}
                        variant={scrolledToBottom ? "primary" : "secondary"}
                    >
                        {scrolledToBottom ? "✅ Підтвердити умови" : "📜 Пролистай до кінця"}
                    </Button>
                </div>

                <p className={styles.footerNote}>
                    Натискаючи «Підтвердити умови», ти погоджуєшся з положеннями
                    публічної оферти та підтверджуєш свою готовність до співпраці 💪
                </p>
            </div>
        </div>
    );
};

export default OfferAgreementPage;
