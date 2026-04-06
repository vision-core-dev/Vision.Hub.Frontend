import React from "react";
import styles from "./User.module.css";
import Avatar from "./Avatar";
import {useNavigate} from "react-router-dom";

interface UserLabelProps {
    avatar_url?: string | null;
    name: string;
    email?: string;
    role?: string;
    tags?: string;
    outline?: boolean;
    user_id?: string;
    badge_emoji?: string | null;
}

const UserLabel: React.FC<UserLabelProps> = ({ avatar_url, name, email, role, user_id, badge_emoji }) => {
    const navigate = useNavigate();
    return (
        <div className={styles.userLabel}>
            <Avatar url={avatar_url} name={name} />
            <div className={styles.details}>
                <div className={`${styles.name} ${user_id ? styles.clickable : ""}`}
                    onClick={() => user_id && navigate(`/users/u/${user_id}`)}
                >{name}{badge_emoji ? ` ${badge_emoji}` : ""}</div>
                {role && <div className={styles.role}>{role}</div>}
                {email && <div className={styles.email}>{email}</div>}
            </div>
        </div>
    );
};

export default UserLabel;





