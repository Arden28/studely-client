import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function RequireAuth() {
  const { status } = useAuth();
  if (status === "loading" || status === "idle") return null;
  return status === "authenticated" ? <Outlet /> : <Navigate to="/auth/login" replace />;
}
