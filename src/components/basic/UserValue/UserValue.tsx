import React from "react";
import styles from "./UserValue.module.css";
import {useNavigate} from "react-router-dom";

interface UserValue {
    id: string;
    first_name: string;
    last_name?: string;
    role_name?: string;
    email?: string;
    avatar_url?: string;
    role?: {name: string};
}

interface Props {
    isActive: boolean;
    user: UserValue;
    showAvatar?: boolean;
}

const UserValue: React.FC<Props> = ({isActive = false, user, showAvatar = true }) => {
    const navigate = useNavigate()
    return (
        <div className={`${styles.userValue} ${isActive ? styles.isActive : ""}`}>
            {showAvatar && (
                <div className={styles.avatar}>
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
                    ) : (
                        <span>
                            {user.first_name[0]?.toUpperCase()}
                            {user.last_name?.toUpperCase()}
                        </span>
                    )}
                </div>
            )}

            <div className={styles.info}>
                <div className={styles.name} onClick={() => navigate(`/users/u/${user.id}`)}>
                    {user.first_name} {user.last_name}
                </div>
                <div className={styles.role}>{user.role_name || user.role?.name}</div>
                {/*{user.email && <div className={styles.email}>{user.email}</div>}*/}
            </div>

            {/*<div className={styles.role}>{user.role_name || user.role?.name}</div>*/}
        </div>
    );
};

export default UserValue;
