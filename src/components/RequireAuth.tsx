import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import React from "react";

interface RequireAuthProps {
  role: string;
  children: React.ReactNode;
}

export default function RequireAuth({ role, children }: RequireAuthProps) {
  const { user, loading } = useUser();
  const location = useLocation();

  console.log("RequireAuth loading:", loading);
  console.log("RequireAuth user:", user);
  console.log("Required role:", role);

  if (loading) {
    return <div>Loading...</div>; // Or loading spinner
  }
  
  if (!user || user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}