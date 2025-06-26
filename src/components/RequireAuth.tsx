import type { JSX } from "react";
import { useUser } from "../context/UserContext";
import { Navigate } from "react-router-dom";

export default function RequireAuth({
  role,
  children,
}: {
  role: "super_admin" | "admin" | "teacher" | "parent";
  children: JSX.Element;
}) {
  const { user, loading } = useUser();

  if (loading) {
    return <p>🔄 Loading...</p>; // ⏳ Wait until userContext loads
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}