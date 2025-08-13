import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import API from "../../lib/axios";
import { toast } from "sonner";
import { getCurrentUser } from "../../utils/auth";

type UserRole = "super_admin" | "admin" | "teacher" | "parent";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function SchoolUserCreateModal({ open, onClose, onCreated }: Props) {
  const current = getCurrentUser();
  const isSuperAdmin = current?.role === "super_admin";
  const isSchoolAdmin = current?.role === "admin";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // default role choice depends on who is creating
  const [role, setRole] = useState<UserRole>(isSuperAdmin ? "admin" : "parent");
  const [password, setPassword] = useState("");

  // schoolId is auto from current admin; super_admin can type it
  const [schoolId, setSchoolId] = useState("");

  useEffect(() => {
    if (!open) {
      setName(""); setEmail(""); setPassword("");
      setRole(isSuperAdmin ? "admin" : "parent");
      setSchoolId(isSchoolAdmin ? (current?.schoolId || "") : "");
      return;
    }
    // when opening, pre-fill admin's schoolId and lock the field
    if (isSchoolAdmin) {
      setSchoolId(current?.schoolId || "");
    }
  }, [open, isSchoolAdmin, isSuperAdmin]);

  // Allowed roles based on who is creating:
  // - super_admin -> can create admin (and optionally others)
  // - admin -> can create teacher or parent only
  const roleOptions: UserRole[] = isSuperAdmin ? ["admin", "teacher", "parent"] : ["teacher", "parent"];

  const needsSchool = role === "admin" || role === "teacher" || role === "parent";

  const canSave = useMemo(() => {
    if (!name.trim() || !email.trim() || !password.trim()) return false;
    if (needsSchool && !(isSchoolAdmin ? schoolId : schoolId.trim())) return false;
    return true;
  }, [name, email, password, needsSchool, isSchoolAdmin, schoolId]);

  const handleCreate = async () => {
    try {
      await API.post("/users", {
        name,
        email,
        password,
        role,
        // if admin is creating, force their schoolId; otherwise use field (super_admin)
        schoolId: needsSchool ? (isSchoolAdmin ? current?.schoolId : schoolId || undefined) : undefined,
      });
      toast.success("User created");
      onCreated?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to create user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>បង្កើតគណនីអ្នកប្រើ</DialogTitle>
          <DialogDescription>បញ្ចូលព័ត៌មានអ្នកប្រើថ្មី</DialogDescription>
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
            <Label htmlFor="password">ពាក្យសម្ងាត់</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <div className="grid gap-2">
            <Label>តួនាទី (Role)</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "admin" ? "School Admin" : r.charAt(0).toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* super_admin: show editable schoolId when role needs it
              admin: hide input & show a readonly hint with their schoolId */}
          {needsSchool && (
            <>
              {isSchoolAdmin ? (
                <div className="grid gap-1">
                  <Label>សាលា (ចូលរួមដោយស្វ័យប្រវត្តិ)</Label>
                  <div className="px-3 py-2 rounded bg-gray-50 border text-sm">
                    {current?.schoolId || "—"}
                  </div>
                  <p className="text-xs text-gray-500">Admin នេះនឹងបង្កើតអ្នកប្រើនៅក្នុងសាលាជាក់លាក់របស់ខ្លួន។</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="school">សាលា (School ID)</Label>
                  <Input id="school" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} placeholder="school-001" />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!canSave}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}