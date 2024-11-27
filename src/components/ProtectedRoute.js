import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/context/AuthContext"

function ProtectedRoute({children}) {
    const {isAuthenticated} = useAuth();

    if (!isAuthenticated){
        return <Navigate to="/login"/>
    }
    return children;
}

export default ProtectedRoute;