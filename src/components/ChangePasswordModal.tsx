import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { KeyRound, Eye, EyeOff, Lock, RefreshCw, CheckCircle2, Shield } from "lucide-react";
import API from "../lib/axios";
import { toast } from "sonner";

export interface PasswordUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
  schoolId?: string;
  school_id?: string;
}

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: PasswordUser | null;
  onSuccess?: () => void;
}

export default function ChangePasswordModal({
  open,
  onClose,
  user,
  onSuccess,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setError(null);
    }
  }, [open, user]);

  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setConfirmPassword(pwd);
    setShowPassword(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    if (newPassword.trim().length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await API.put(`/users/${user._id}/password`, {
        newPassword: newPassword.trim(),
      });

      toast.success(`Password updated successfully for ${user.name}`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Failed to change password:", err);
      const msg = err.response?.data?.error || err.message || "Failed to update password";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "teacher":
        return "secondary";
      case "parent":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Change User Password</DialogTitle>
              <DialogDescription className="text-sm">
                Reset or set a new password for this user
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {user && (
          <div className="rounded-lg bg-muted/50 p-3.5 border text-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{user.name}</span>
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {(user.role || "user").replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-password">New Password *</Label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className="h-3 w-3" />
                Generate Random
              </button>
            </div>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className="pr-10"
                minLength={6}
                required
                disabled={loading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="pr-10"
                minLength={6}
                required
                disabled={loading}
              />
              {confirmPassword && newPassword === confirmPassword && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            * The user can use this new password immediately to log into their account.
          </p>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
              className="gap-2"
            >
              <Lock className="h-4 w-4" />
              {loading ? "Updating..." : "Set New Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
