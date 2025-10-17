import {useAuth} from "../../System/AuthContext.tsx";

const Dashboard = () => {
    const { role } = useAuth();

    return <p>Ваша роль: <strong>{role?.name}</strong></p>
};

export default Dashboard;
