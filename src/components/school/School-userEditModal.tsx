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
import { EyeIcon, EyeOffIcon } from "lucide-react";
import API from "../../lib/axios";
import { toast } from "sonner";
import { getCurrentUser } from "../../utils/auth"; // <-- helper that reads localStorage user

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

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // typically email is immutable; keep editable if you want
  const [role, setRole] = useState<UserRole>("parent");
  const [school_id, setSchoolId] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [saving, setSaving] = useState(false);

  // password reset
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Which roles can the editor set?
  const allowedRoles: UserRole[] = isSuperAdmin ? ["super_admin", "admin", "teacher", "parent"] : ["teacher", "parent"];

  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      // if current is admin and the user being edited is admin/super_admin, clamp role to current allowed set
      const initialRole = allowedRoles.includes(user.role) ? user.role : "teacher";
      setRole(initialRole);
      setStatus(user.status || "active");
      // prefill schoolId:
      if (isSchoolAdmin) {
        // force admin’s own schoolId (read-only)
        setSchoolId(current?.school_id || "");
      } else {
        setSchoolId(user.school_id || "");
      }
      setNewPwd("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const needsSchool = role === "admin" || role === "teacher" || role === "parent";

  const canSave = useMemo(() => {
    if (!user?.id) return false;
    if (!name.trim() || !email.trim()) return false;
    if (needsSchool) {
      if (isSchoolAdmin) {
        // must have current admin’s schoolId
        return Boolean(current?.school_id);
      }
      // super_admin path: schoolId must be filled for these roles
      return Boolean(school_id.trim());
    }
    return true;
  }, [user, name, email, needsSchool, isSchoolAdmin, school_id, current?.school_id]);

  const canReset = useMemo(() => !!user?.id && newPwd.trim().length >= 6, [user, newPwd]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const payload: any = {
        name,
        email,
        role,
        status,
      };

      if (needsSchool) {
        payload.school_id = isSchoolAdmin ? current?.school_id : school_id || undefined;
      } else {
        payload.school_id = undefined;
      }

      await API.put(`/users/${user.id}`, payload);
      toast.success("User updated");
      onSaved?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.id) return;
    setResetting(true);
    try {
      await API.put(`/users/${user.id}/password`, { newPassword: newPwd });
      toast.success("Password reset successfully");
      setNewPwd("");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>កែប្រែគណនីអ្នកប្រើ</DialogTitle>
          <DialogDescription>កែប្រែព័ត៌មាន និងកំណត់ពាក្យសម្ងាត់ថ្មី</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">ឈ្មោះ</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">អ៊ីមែល</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>

          <div className="grid gap-2">
            <Label>តួនាទី (Role)</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
            >
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {allowedRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "super_admin" ? "Super Admin" : r === "admin" ? "School Admin" : r[0].toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!allowedRoles.includes(role) && (
              <p className="text-xs text-red-600">You don’t have permission to set this role.</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>ស្ថានភាព (Status)</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "active" | "inactive")}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* School field behavior:
              - Admin editor: show locked/readonly school (their own).
              - Super_admin: editable when role requires school. */}
          {needsSchool && (
            <>
              {isSchoolAdmin ? (
                <div className="grid gap-1">
                  <Label>សាលា</Label>
                  <div className="px-3 py-2 rounded bg-gray-50 border text-sm">
                    {current?.school_id || "—"}
                  </div>
                  <p className="text-xs text-gray-500">Admin នឹងកំណត់អ្នកប្រើនៅសាលារបស់ខ្លួនដោយស្វ័យប្រវត្តិ។</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="school">សាលា (School ID)</Label>
                  <Input
                    id="school"
                    value={school_id}
                    onChange={(e) => setSchoolId(e.target.value)}
                    placeholder="school-001"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Password reset */}
        <div className="mt-2 rounded-lg border p-3">
          <div className="text-sm font-semibold mb-2">កំណត់ពាក្យសម្ងាត់ថ្មី</div>
          <div className="relative">
            <Input
              type={showPwd ? "text" : "password"}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Temporary password (min 6 chars)"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
              onClick={() => setShowPwd((p) => !p)}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setNewPwd("")}>Clear</Button>
            <Button size="sm" onClick={handleResetPassword} disabled={!canReset || resetting}>
              {resetting ? "Saving..." : "Reset Password"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">* Set a temporary password; the user can change it after login.</p>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave || saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}