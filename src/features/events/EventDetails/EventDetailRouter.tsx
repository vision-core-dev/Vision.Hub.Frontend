import { useAuth } from "@/core/auth/AuthContext";
import ModerateEventDetails from "./ModerateEventDetails";
import PublicEventDetails from "./PublicEventDetails";

const EventDetailRouter = () => {
    const { role } = useAuth();
    const isAdmin = role?.menu?.includes("events") ?? false;

    if (isAdmin) {
        return <ModerateEventDetails />;
    }
    return <PublicEventDetails />;
};

export default EventDetailRouter;
