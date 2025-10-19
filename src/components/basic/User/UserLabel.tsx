import React from "react";
import styles from "./User.module.css";
import Avatar from "./Avatar";

interface UserLabelProps {
    avatar_url?: string;
    name: string;
    email?: string;
    tags?: string;
    outline?: boolean;
}

const UserLabel: React.FC<UserLabelProps> = ({ avatar_url, name, email }) => {
    return (
        <div className={styles.userLabel}>
            <Avatar url={avatar_url} name={name} />
            <div>
                <div className={styles.name}>{name}</div>
                {email && <div className={styles.email}>{email}</div>}
            </div>
        </div>
    );
};

export default UserLabel;
