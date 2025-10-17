import {useAuth} from "../../System/AuthContext.tsx";
import Layout from "../../Layout/Layout.tsx";

const Dashboard = () => {
    const { user, role } = useAuth();

    return (
        <Layout>
            <div className="dashboard">
                <h1>👋 Привіт, {user?.first_name || "Користувач"}</h1>
                <p>Ваша роль: <strong>{role?.name}</strong></p>

                <div className="stats">
                    <div className="card">📁 Задачі</div>
                    <div className="card">💸 Виплати</div>
                    <div className="card">👥 Команда</div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
