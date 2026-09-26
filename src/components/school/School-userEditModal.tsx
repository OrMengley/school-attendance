import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { UserCog, Save, Mail, User as UserIcon, Shield, Activity } from "lucide-react";
import API from "../../lib/axios";
import { toast } from "sonner";
import { getCurrentUser } from "../../utils/auth";

type UserRole = "super_admin" | "admin" | "teacher" | "parent";

export interface EditUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school_id?: string;
  status?: "active" | "inactive";
}

interface Props {
  open: boolean;
  onClose: () => void;
  user?: EditUser | null;
  onSaved?: () => void;
}

export default function SchoolUserEditModal({ open, onClose, user, onSaved }: Props) {
  const current = getCurrentUser();
  const isSuperAdmin = current?.role === "super_admin";
  const isSchoolAdmin = current?.role === "admin";

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("parent");
  const [school_id, setSchoolId] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [saving, setSaving] = useState(false);

  // Allowed roles based on editor role
  const allowedRoles: UserRole[] = isSuperAdmin
    ? ["super_admin", "admin", "teacher", "parent"]
    : ["teacher", "parent"];

  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      const initialRole = allowedRoles.includes(user.role) ? user.role : "teacher";
      setRole(initialRole);
      setStatus(user.status || "active");
      if (isSchoolAdmin) {
        setSchoolId(current?.school_id || "");
      } else {
        setSchoolId(user.school_id || "");
      }
    }
  }, [open, user]);

  const needsSchool = role === "admin" || role === "teacher" || role === "parent";

  const canSave = useMemo(() => {
    if (!user?.id) return false;
    if (!name.trim() || !email.trim()) return false;
    if (needsSchool) {
      if (isSchoolAdmin) {
        return Boolean(current?.school_id);
      }
      return Boolean(school_id.trim());
    }
    return true;
  }, [user, name, email, needsSchool, isSchoolAdmin, school_id, current?.school_id]);

  const handleSave = async () => {
    if (!user?.id || !canSave) return;
    setSaving(true);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        status,
      };

      if (needsSchool) {
        payload.school_id = isSchoolAdmin ? current?.school_id : school_id || undefined;
      } else {
        payload.school_id = undefined;
      }

      await API.put(`/users/${user.id}`, payload);
      toast.success("ព័ត៌មានអ្នកប្រើត្រូវបានកែប្រែជោគជ័យ (User updated)");
      onSaved?.();
      onClose();
    } catch (e: any) {
      console.error("Failed to update user:", e);
      toast.error(e?.response?.data?.error || "បរាជ័យក្នុងការកែប្រែអ្នកប្រើ (Failed to update user)");
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "School Admin";
      case "teacher":
        return "គ្រូបង្រៀន (Teacher)";
      case "parent":
        return "អាណាព្យាបាល (Parent)";
      default:
        return r;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                កែប្រែគណនីអ្នកប្រើ
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                កែប្រែព័ត៌មានទូទៅ និងតួនាទីអ្នកប្រើប្រាស់
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-sm font-medium flex items-center gap-1.5 text-gray-700">
              <UserIcon className="h-4 w-4 text-gray-400" />
              ឈ្មោះពេញ (Full Name) *
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              disabled={saving}
              className="h-10"
              required
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-email" className="text-sm font-medium flex items-center gap-1.5 text-gray-700">
              <Mail className="h-4 w-4 text-gray-400" />
              អ៊ីមែល (Email Address) *
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={saving}
              className="h-10"
              required
            />
          </div>

          {/* Role and Status Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role Select */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5 text-gray-700">
                <Shield className="h-4 w-4 text-gray-400" />
                តួនាទី (Role) *
              </Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
                disabled={saving}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {allowedRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {getRoleLabel(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!allowedRoles.includes(role) && (
                <p className="text-xs text-red-600">You don’t have permission to set this role.</p>
              )}
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5 text-gray-700">
                <Activity className="h-4 w-4 text-gray-400" />
                ស្ថានភាព (Status) *
              </Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as "active" | "inactive")}
                disabled={saving}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Active (សកម្ម)
                    </span>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-gray-400" />
                      Inactive (អសកម្ម)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Super Admin only: school id input */}
          {needsSchool && !isSchoolAdmin && (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="school" className="text-sm font-medium text-gray-700">
                សាលា (School ID) *
              </Label>
              <Input
                id="school"
                value={school_id}
                onChange={(e) => setSchoolId(e.target.value)}
                placeholder="Enter School ID"
                disabled={saving}
                className="h-10"
              />
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave || saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}