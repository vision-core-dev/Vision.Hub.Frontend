import styles from "./Dashboard.module.css";
import {useAuth} from "../../System/AuthContext.tsx";

const Dashboard = () => {
    const { role } = useAuth();

    return (
        <div className={styles.dashboardPage}>
            <div>
                Ваша роль: <strong>{role?.name || "Гість"}</strong>
            </div>
        </div>
    );
};

export default Dashboard;
