import LoginForm from "@/components/ui/LoginForm";
import { useAuth } from "@/hooks/useAuth";
export default function Home() {
    const { token } = useAuth();
    return (
        <div>
            <h1>This is Home</h1>
            {!token && <LoginForm/>}
        </div>
    );
}
