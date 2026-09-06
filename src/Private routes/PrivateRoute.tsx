import { useAuth } from "../core/application/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { SpinnerOverlay } from "../presentation/ui/Spinner";

export const ProtectedRoute = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <SpinnerOverlay />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
