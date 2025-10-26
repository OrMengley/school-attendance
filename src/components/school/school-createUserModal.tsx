import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import API from "../../lib/axios";
import { toast } from "sonner";
import { getCurrentUser } from "../../utils/auth";
import type { SchoolType } from "../../types/SchoolType";
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
  const [status, setStatus] = useState<"active" | "inactive">("active");

  // schoolId is auto from current admin; super_admin can type it
  const [school_id, setSchool_id] = useState("");
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // Allowed roles based on who is creating:
  // - super_admin -> can create admin (and optionally others)
  // - admin -> can create teacher or parent only
  const roleOptions: UserRole[] = isSuperAdmin ? ["admin", "teacher", "parent"] : ["teacher", "parent"];

  const needsSchool = role === "admin" || role === "teacher" || role === "parent";

  useEffect(() => {
    if (!open) {
      setName(""); setEmail(""); setPassword("");
      setRole(isSuperAdmin ? "admin" : "parent");
      setStatus("active");
      setSchool_id(isSchoolAdmin ? (current?.school_id || "") : "");
      return;
    }
    // when opening, pre-fill admin's schoolId and lock the field
    if (isSchoolAdmin) {
      setSchool_id(current?.school_id || "");
    }
    
    // Fetch schools for super_admin when role requires school
    if (isSuperAdmin && needsSchool) {
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
          console.error('Failed to fetch schools:', err);
          setSchools([]);
          toast.error("Failed to load schools");
        })
        .finally(() => {
          setLoadingSchools(false);
        });
    }
  }, [open, isSchoolAdmin, isSuperAdmin, needsSchool]);

  // Fetch schools when role changes for super_admin
  useEffect(() => {
    if (isSuperAdmin && needsSchool && open) {
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
          console.error('Failed to fetch schools:', err);
          setSchools([]);
          toast.error("Failed to load schools");
        })
        .finally(() => {
          setLoadingSchools(false);
        });
    } else if (!needsSchool) {
      setSchools([]);
      setSchool_id("");
    }
  }, [role, needsSchool, isSuperAdmin, open]);

  const canSave = useMemo(() => {
    if (!name.trim() || !email.trim() || !password.trim()) return false;
    if (needsSchool && !(isSchoolAdmin ? school_id : school_id.trim())) return false;
    if (isSuperAdmin && needsSchool && loadingSchools) return false;
    return true;
  }, [name, email, password, needsSchool, isSchoolAdmin, school_id, isSuperAdmin, loadingSchools]);

  const handleCreate = async () => {
    try {
      await API.post("/users", {
        name,
        email,
        password,
        role,
        status,
        // if admin is creating, force their schoolId; otherwise use field (super_admin)
        school_id: needsSchool ? (isSchoolAdmin ? current?.school_id : school_id || undefined) : undefined,
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

          {/* super_admin: show editable schoolId when role needs it
              admin: hide input & show a readonly hint with their schoolId */}
          {needsSchool && (
            <>
              {isSchoolAdmin ? (
                <div className="grid gap-1">
                  <Label>សាលា (ចូលរួមដោយស្វ័យប្រវត្តិ)</Label>
                  <div className="px-3 py-2 rounded bg-gray-50 border text-sm">
                    {current?.school_id || "—"}
                  </div>
                  <p className="text-xs text-gray-500">Admin នេះនឹងបង្កើតអ្នកប្រើនៅក្នុងសាលាជាក់លាក់របស់ខ្លួន។</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="school">សាលា (School)</Label>
                  <Select value={school_id} onValueChange={setSchool_id} disabled={loadingSchools}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingSchools ? "Loading schools..." : "Select school"} />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school._id} value={school._id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {schools.length === 0 && !loadingSchools && (
                    <p className="text-xs text-gray-500">No schools available. Please create a school first.</p>
                  )}
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