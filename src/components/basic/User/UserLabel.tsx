import React from "react";
import styles from "./User.module.css";
import Avatar from "./Avatar";
import {useNavigate} from "react-router-dom";

interface UserLabelProps {
    avatar_url?: string | null;
    name: string;
    email?: string;
    tags?: string;
    outline?: boolean;
    user_id?: string;
}

const UserLabel: React.FC<UserLabelProps> = ({ avatar_url, name, email, user_id }) => {
    const navigate = useNavigate();
    return (
        <div className={styles.userLabel}>
            <Avatar url={avatar_url} name={name} />
            <div>
                <div className={`${styles.name} ${user_id ? styles.clickable : ""}`}
                    onClick={() => user_id && navigate(`/users/u/${user_id}`)}
                >{name}</div>
                {email && <div className={styles.email}>{email}</div>}
            </div>
        </div>
    );
};

export default UserLabel;
