import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { get } = useCopy();

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>{get("protectedRoute.loading")}</div>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
