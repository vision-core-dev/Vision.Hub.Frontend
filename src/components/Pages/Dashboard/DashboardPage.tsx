import {useAuth} from "../../System/AuthContext.tsx";
import Layout from "../../Layout/Layout.tsx";

const Dashboard = () => {
    const { role } = useAuth();

    return (
        <Layout>
            <p>Ваша роль: <strong>{role?.name}</strong></p>
        </Layout>
    );
};

export default Dashboard;
