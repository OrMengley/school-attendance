import { useEffect, useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Eye, EyeOff, UserCog, Lock, Save, School as SchoolIcon } from "lucide-react";
import API from "../lib/axios";
import { toast } from "sonner";
import type { SchoolType } from "../types/SchoolType";

export interface SuperAdminEditUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  school_id?: string;
  schoolId?: string;
  status?: string;
}

interface SuperAdminUserEditModalProps {
  open: boolean;
  onClose: () => void;
  user: SuperAdminEditUser | null;
  onSaved?: () => void;
}

export default function SuperAdminUserEditModal({
  open,
  onClose,
  user,
  onSaved,
}: SuperAdminUserEditModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [schoolId, setSchoolId] = useState("");
  const [status, setStatus] = useState("active");
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [saving, setSaving] = useState(false);

  // Password reset inline section
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingSchools(true);
      API.get("/schools")
        .then((res) => {
          if (Array.isArray(res.data)) {
            setSchools(res.data);
          } else {
            setSchools([]);
          }
        })
        .catch((err) => {
          console.error("Failed to load schools:", err);
          setSchools([]);
        })
        .finally(() => setLoadingSchools(false));
    }
  }, [open]);

  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "teacher");
      setSchoolId(user.school_id || user.schoolId || "");
      setStatus(user.status || "active");
      setNewPassword("");
      setShowPassword(false);
    }
  }, [open, user]);

  const needsSchool = ["admin", "teacher", "parent"].includes(role);

  const canSave = useMemo(() => {
    if (!user?._id) return false;
    if (!name.trim() || !email.trim()) return false;
    if (needsSchool && !schoolId.trim()) return false;
    return true;
  }, [user, name, email, needsSchool, schoolId]);

  const handleSaveUser = async () => {
    if (!user?._id || !canSave) return;
    setSaving(true);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.trim(),
        status: status.trim(),
      };

      if (needsSchool) {
        payload.school_id = schoolId.trim();
      } else {
        payload.school_id = "";
      }

      await API.put(`/users/${user._id}`, payload);
      toast.success("User details updated successfully");
      onSaved?.();
      onClose();
    } catch (err: any) {
      console.error("Failed to update user:", err);
      toast.error(err.response?.data?.error || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?._id || newPassword.trim().length < 6) return;
    setResettingPassword(true);

    try {
      await API.put(`/users/${user._id}/password`, {
        newPassword: newPassword.trim(),
      });
      toast.success(`Password reset successfully for ${name || user.name}`);
      setNewPassword("");
    } catch (err: any) {
      console.error("Failed to reset password:", err);
      toast.error(err.response?.data?.error || "Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Edit User</DialogTitle>
              <DialogDescription className="text-sm">
                Update user details, role assignment, and credentials
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-email">Email Address *</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Role *</Label>
              <Select value={role} onValueChange={setRole} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">School Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {needsSchool && (
            <div className="grid gap-2">
              <Label htmlFor="edit-school" className="flex items-center gap-1.5">
                <SchoolIcon className="h-4 w-4 text-muted-foreground" />
                Assigned School *
              </Label>
              <Select
                value={schoolId}
                onValueChange={setSchoolId}
                disabled={saving || loadingSchools}
              >
                <SelectTrigger id="edit-school">
                  <SelectValue
                    placeholder={
                      loadingSchools
                        ? "Loading schools..."
                        : schools.length === 0
                        ? "No schools available"
                        : "Select school"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school._id} value={school._id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Inline Change Password Section */}
          <div className="rounded-lg border bg-muted/40 p-4 space-y-3 mt-4">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Lock className="h-4 w-4 text-primary" />
              Change User Password
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min. 6 characters)"
                className="pr-10 bg-background"
                minLength={6}
                disabled={resettingPassword}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-muted-foreground">
                Sets a new password immediately.
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleResetPassword}
                disabled={newPassword.trim().length < 6 || resettingPassword}
              >
                {resettingPassword ? "Saving..." : "Update Password"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSaveUser} disabled={!canSave || saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
