import { AvatarLabelGroup } from "@/shared/ui/avatar/avatar-label-group";
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
    const initials = (user.first_name[0] || "") + (user.last_name?.[0] || "");

    return (
        <div className={styles.item}>

            <AvatarLabelGroup title={`${user.first_name} ${user.last_name || ""}`} size="sm" src={user.avatar_url} initials={initials} />

            <div
                className={`${styles.amount} ${amount > 0 ? styles.plus : amount < 0 ? styles.minus : ""
                    }`}
            >
                {amount > 0 ? `+${amount}` : amount}
            </div>
        </div>
    );
}









