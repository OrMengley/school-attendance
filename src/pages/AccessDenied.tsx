import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/button";

const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto size-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="size-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don’t have permission to view this page or the route does not exist.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link to="/login">
            <Button className="w-40">Back to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
