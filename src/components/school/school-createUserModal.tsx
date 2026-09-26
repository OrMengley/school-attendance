import { useEffect, useMemo, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import API from "../../lib/axios";
import { toast } from "sonner";
import { getCurrentUser } from "../../utils/auth";
import type { SchoolType } from "../../types/SchoolType";
import { uploadToCloudinary } from "../../lib/cloudinary";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // default role choice depends on who is creating
  const [role, setRole] = useState<UserRole>(isSuperAdmin ? "admin" : "parent");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  // Avatar states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      // Reset avatar states
      setAvatarFile(null);
      setAvatarPreview(null);
      setUploading(false);
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

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic"];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        toast.error("Invalid file type. Please select a JPEG, JPG, PNG, or HEIC image.");
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size too large. Please select an image under 5MB.");
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar click to trigger file input
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload avatar to Cloudinary
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;
    
    setUploading(true);
    try {
      const downloadURL = await uploadToCloudinary(avatarFile, {
        folder: "avatars",
      });
      return downloadURL;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      const errMsg = error?.response?.data?.error?.message || error?.message || "Failed to upload avatar";
      toast.error(`បរាជ័យក្នុងការផ្ទុកឡើងរូបភាព (Upload error): ${errMsg}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    try {
      // Upload avatar first if file is selected
      let avatarUrl: string | null | undefined = undefined;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
        if (!avatarUrl) {
          toast.error("Failed to upload avatar. Please try again.");
          return;
        }
      }
      
      await API.post("/users", {
        name,
        email,
        password,
        role,
        status,
        avatar_url: avatarUrl,
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
          {/* Avatar Upload Section */}
          <div className="grid gap-2">
            <Label>Avatar</Label>
            <div className="flex items-center gap-4">
              <div 
                className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center"
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-xs text-center">Click to upload</div>
                )}
                {avatarPreview && (
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAvatar();
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpeg,.jpg,.png,.HEIC,.heic,image/jpeg,image/jpg,image/png,image/heic"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAvatarClick}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Choose Image"}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, JPG, PNG, HEIC (Max 5MB)
                </p>
              </div>
            </div>
          </div>

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

          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="pb-2">តួនាទី (Role)</Label>
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
            <div className="flex-1">
              <Label className="pb-2">ស្ថានភាព (Status)</Label>
              <Select  value={status} onValueChange={(v) => setStatus(v as "active" | "inactive")}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* super_admin: show editable school selector when role needs it; admin automatically assigns their own school */}
          {needsSchool && !isSchoolAdmin && (
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!canSave || uploading}>
            {uploading ? "Uploading..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}