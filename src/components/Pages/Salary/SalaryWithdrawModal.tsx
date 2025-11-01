import React, { useState } from "react";
import styles from "./SalaryPage.module.css";
import Button from "../../basic/Button/Button.tsx";
import KnowledgeCard from "../../basic/KnowledgeLink/KnowledgeCard.tsx";
import {api} from "../../../utils/api.ts";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    withdrawLimit: number;
}

const SalaryWithdrawModal: React.FC<Props> = ({ onClose, onSuccess, withdrawLimit }) => {
    const [amount, setAmount] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (amount <= 0) return setError("Вкажіть суму більше 0 ₴");
        if (amount > withdrawLimit)
            return setError(`Максимум для одного виводу — ${withdrawLimit} ₴`);

        try {
            const response = await api.post("/v1/Hub/Finance/CreateWithdrawalRequest", {
                "amount": amount,
                "comment": comment || null,
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Помилка при відправці запиту");
            }

            onSuccess();
            onClose();

        }
        catch {
            return setError("Помилка при відправці запиту");
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Запит на вивід коштів</h2>

                <KnowledgeCard html={`Індивідуальний ліміт на вивід в цьому місяці: ${withdrawLimit} ₴`} link="/knowledge" />

                {/*<p className={styles.limit}>Ліміт на один вивід: {withdrawLimit} ₴</p>*/}
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    placeholder="Сума ₴"
                />
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Коментар (необов’язково)"
                />
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onClose}>
                        Скасувати
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Відправити
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SalaryWithdrawModal;
