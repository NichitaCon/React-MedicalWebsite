import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
    const { token } = useAuth();

    if (!token) {
        return (
            <Navigate
                to={"/"}
                state={{
                    message: "You must be logged in to access this page",
                    type: "error",
                }}
            />
        );
    }

    return <Outlet />;
}
