import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { get } = useCopy();

  const isGuest = localStorage.getItem("guestMode") === "true";

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>{get("protectedRoute.loading")}</div>;

  return user || isGuest ? <Outlet /> : <Navigate to="/" replace />;
}
