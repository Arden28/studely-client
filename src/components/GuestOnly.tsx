import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function GuestOnly() {
  const { status } = useAuth();
  if (status === "loading" || status === "idle") return null;
  return status === "authenticated" ? <Navigate to="/" replace /> : <Outlet />;
}
