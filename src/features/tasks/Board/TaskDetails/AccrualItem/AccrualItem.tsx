import styles from "./AccrualItem.module.css";

interface Props {
    user: {
        id: string;
        first_name: string;
        last_name?: string;
        avatar_url?: string;
    };
    amount: number;
}

export default function AccrualItem({ user, amount }: Props) {
    return (
        <div className={styles.item}>
            <img
                src={user.avatar_url || "https://cdn.vcore.dev/default-avatar.png"}
                alt=""
                className={styles.avatar}
            />

            <div className={styles.name}>
                {user.first_name} {user.last_name || ""}
            </div>

            <div
                className={`${styles.amount} ${
                    amount > 0 ? styles.plus : amount < 0 ? styles.minus : ""
                }`}
            >
                {amount > 0 ? `+${amount}` : amount}
            </div>
        </div>
    );
}









