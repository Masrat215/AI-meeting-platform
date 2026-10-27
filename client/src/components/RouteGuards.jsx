import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="animate-pulse">
        <Logo size={48} />
      </div>
    </div>
  );
}

// Private pages: send visitors who are not logged in to the login page
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

// Login and register pages: send people who are already logged in to the app
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (user) {
    return <Navigate to={location.state?.from || "/app"} replace />;
  }
  return <Outlet />;
}