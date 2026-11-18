import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function AuthLoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fc]">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <span className="size-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        Checking your session…
      </div>
    </main>
  );
}

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AuthLoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
