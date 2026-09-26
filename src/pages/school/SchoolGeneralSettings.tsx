import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../lib/axios";
import { useUser } from "../../context/UserContext";
import { getCurrentUser } from "../../utils/auth";
import type { SchoolType } from "../../types/SchoolType";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
  School,
  MapPin,
  Upload,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Building2,
  Calendar,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Trash2,
  CheckCircle2,
  Loader2,
  CloudUpload,
} from "lucide-react";

export default function SchoolGeneralSettings() {
  const { user, loading: userLoading } = useUser();
  const [searchParams] = useSearchParams();
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Image upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveSchoolId =
    searchParams.get("school_id") ||
    user?.school_id ||
    getCurrentUser()?.school_id ||
    school?._id ||
    "";

  const fetchSchoolData = async () => {
    if (!effectiveSchoolId) {
      if (!userLoading) {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const res = await API.get(`/schools/${effectiveSchoolId}`);
      const data: SchoolType = res.data;
      setSchool(data);
      setName(data.name || "");
      setAddress(data.address || "");
      setLogoUrl(data.logo_url || "");
      setIsActive(data.is_active ?? true);
      setLogoPreview(data.logo_url || null);
      setLogoFile(null);
      setUploadSuccess(false);
      setUploadProgress(0);
    } catch (err: any) {
      console.error("Failed to fetch school info:", err);
      toast.error(
        err?.response?.data?.error ||
          "បរាជ័យក្នុងការទាញយកព័ត៌មានសាលា (Failed to load school information)"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchSchoolData();
    }
  }, [effectiveSchoolId, userLoading]);

  // Upload a specific file to Cloudinary with progress tracking
  const performUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      const downloadURL = await uploadToCloudinary(file, {
        folder: "schools",
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      setLogoUrl(downloadURL);
      setLogoPreview(downloadURL);
      setUploadSuccess(true);
      setUploading(false);
      toast.success("បានផ្ទុកឡើងរូបសញ្ញាទៅកាន់ Cloudinary ដោយជោគជ័យ!");
      return downloadURL;
    } catch (err: any) {
      setUploading(false);
      setUploadSuccess(false);
      console.error("Failed to upload image to Cloudinary:", err);
      const errMsg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to upload logo to Cloudinary";
      toast.error(`បរាជ័យក្នុងការផ្ទុកឡើងរូបភាព (Upload error): ${errMsg}`);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("សូមជ្រើសរើសឯកសាររូបភាពត្រឹមត្រូវ (Please select a valid image file)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("ទំហំរូបភាពមិនត្រូវលើសពី 10MB ឡើយ (Image size must not exceed 10MB)");
      return;
    }

    setLogoFile(file);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-upload to Cloudinary
    await performUpload(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl("");
    setUploadSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRetryUpload = async () => {
    if (logoFile) {
      await performUpload(logoFile);
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error("សូមបញ្ចូលឈ្មោះសាលារៀន (Please enter school name)");
      return;
    }

    if (!address.trim()) {
      toast.error("សូមបញ្ចូលអាសយដ្ឋានសាលារៀន (Please enter school address)");
      return;
    }

    const targetSchoolId = effectiveSchoolId || school?._id;
    if (!targetSchoolId) {
      toast.error("រកមិនឃើញលេខសម្គាល់សាលា (School ID not found)");
      return;
    }

    setSaving(true);
    try {
      let finalLogoUrl = logoUrl;

      // If there is a file selected that hasn't finished uploading yet
      if (logoFile && !uploadSuccess && !finalLogoUrl.startsWith("http")) {
        toast.info("កំពុងផ្ទុកឡើងរូបសញ្ញា... (Uploading logo...)");
        const uploaded = await performUpload(logoFile);
        if (uploaded) {
          finalLogoUrl = uploaded;
        } else {
          toast.error("បរាជ័យក្នុងការផ្ទុកឡើងរូបភាព (Failed to upload logo image)");
          setSaving(false);
          return;
        }
      }

      const payload = {
        name: name.trim(),
        address: address.trim(),
        logo_url: finalLogoUrl,
        is_active: isActive,
      };

      const res = await API.put(`/schools/${targetSchoolId}`, payload);
      const updated = res.data.school || { ...school, ...payload };
      setSchool(updated);
      setLogoFile(null);
      setUploadSuccess(false);

      toast.success("ព័ត៌មានសាលារៀនត្រូវបានរក្សាទុកដោយជោគជ័យ! (School info saved successfully)");

      // Notify sidebar and team switcher to reload school brand
      window.dispatchEvent(new CustomEvent("school_updated", { detail: updated }));
    } catch (err: any) {
      console.error("Failed to update school:", err);
      toast.error(
        err?.response?.data?.error ||
          "បរាជ័យក្នុងការកែប្រែព័ត៌មានសាលា (Failed to update school)"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (school) {
      setName(school.name || "");
      setAddress(school.address || "");
      setLogoUrl(school.logo_url || "");
      setIsActive(school.is_active ?? true);
      setLogoPreview(school.logo_url || null);
      setLogoFile(null);
      setUploadSuccess(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.info("ទិន្នន័យត្រូវបានកំណត់ឡើងវិញ (Changes reset)");
    }
  };

  const copySchoolId = () => {
    if (effectiveSchoolId) {
      navigator.clipboard.writeText(effectiveSchoolId);
      setCopied(true);
      toast.success("បានចម្លងលេខសម្គាល់សាលា! (Copied School ID)");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isChanged =
    school &&
    (name !== (school.name || "") ||
      address !== (school.address || "") ||
      logoUrl !== (school.logo_url || "") ||
      isActive !== (school.is_active ?? true) ||
      logoFile !== null);

  const canEdit = user?.role === "admin" || user?.role === "super_admin";

  if (loading || userLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 md:col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!school && !loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-3xl">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-3" />
            <h2 className="text-xl font-bold text-foreground">រកមិនឃើញព័ត៌មានសាលារៀនឡើយ (School Not Found)</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              គណនីរបស់អ្នកមិនទាន់បានភ្ជាប់ជាមួយសាលារៀនណាមួយនៅឡើយទេ ឬសាលារៀនត្រូវបានលុប។
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
              <School className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                ព័ត៌មានទូទៅសាលារៀន
                <span className="text-base font-normal text-muted-foreground">
                  (General Settings)
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                គ្រប់គ្រង និងកែប្រែព័ត៌មានលម្អិតរបស់សាលារៀន និងរូបសញ្ញា (Manage & update school details and logo)
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!isChanged || saving || uploading}
              className="gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span>កំណត់ឡើងវិញ (Reset)</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleSave()}
              disabled={!canEdit || saving || uploading || !name.trim() || !address.trim() || !isChanged}
              className="gap-1.5 min-w-[130px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>កំពុងផ្ទុកឡើង...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>រក្សាទុក (Save)</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: School Profile Card */}
        <div className="space-y-6">
          <Card className="shadow-xs overflow-hidden border">
            <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 relative">
              <div className="absolute top-3 right-3">
                <Badge variant={isActive ? "default" : "secondary"} className="gap-1">
                  <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-gray-400"}`} />
                  {isActive ? "ដំណើរការ (Active)" : "អសកម្ម (Inactive)"}
                </Badge>
              </div>
            </div>

            <CardContent className="pt-0 px-6 pb-6 relative text-center">
              {/* Logo Area */}
              <div className="-mt-12 mb-4 inline-block relative group">
                <div className="w-24 h-24 rounded-2xl border-4 border-background bg-card shadow-md flex items-center justify-center overflow-hidden mx-auto transition-transform group-hover:scale-105">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt={name || "School Logo"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <School className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving || uploading}
                    className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-medium cursor-pointer"
                    title="ផ្លាស់ប្តូររូបសញ្ញា (Change Logo)"
                  >
                    <Upload className="h-5 w-5 mb-1" />
                    <span>ប្តូររូប</span>
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold text-foreground truncate">{name || "ឈ្មោះសាលា"}</h2>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-2">{address || "មិនទាន់មានអាសយដ្ឋាន"}</span>
              </div>

              <div className="mt-4 pt-4 border-t space-y-2.5 text-left text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> លេខកូដសាលា (ID):
                  </span>
                  <button
                    type="button"
                    onClick={copySchoolId}
                    className="font-mono text-[11px] bg-muted px-2 py-0.5 rounded flex items-center gap-1 hover:bg-muted/80 transition-colors"
                    title="ចុចដើម្បីចម្លង"
                  >
                    <span className="truncate max-w-[120px]">{effectiveSchoolId}</span>
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>

                {(school?.created_at || school?.createdAt) && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> បង្កើតនៅ (Created):
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(school.created_at || school.createdAt || "").toLocaleDateString()}
                    </span>
                  </div>
                )}

                {(school?.updated_at || school?.updatedAt) && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> កែប្រែចុងក្រោយ (Updated):
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(school.updated_at || school.updatedAt || "").toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cloudinary Upload Status Card */}
          <Card className="bg-muted/30 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <CloudUpload className="h-4 w-4 text-primary" />
                ការផ្ទុកឡើង Cloudinary (Cloudinary Storage)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                រូបសញ្ញាសាលាត្រូវបានផ្ទុកឡើង និងរក្សាទុកដោយសុវត្ថិភាពនៅលើ <strong>Cloudinary CDN</strong> ដើម្បីធានាល្បឿនបង្ហាញលឿនបំផុត។
              </p>
              {logoUrl && logoUrl.includes("cloudinary") && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-[11px] pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>រូបសញ្ញាបានភ្ជាប់ជាមួយ Cloudinary រួចរាល់</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <Card className="shadow-xs border">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                កែប្រែព័ត៌មានសាលារៀន (Edit School Information)
              </CardTitle>
              <CardDescription>
                បំពេញព័ត៌មានខាងក្រោមដើម្បីធ្វើបច្ចុប្បន្នភាពទិន្នន័យសាលារៀនរបស់អ្នក
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSave}>
              <CardContent className="space-y-5">
                {/* School Name */}
                <div className="space-y-2">
                  <Label htmlFor="school-name" className="font-medium flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    ឈ្មោះសាលារៀន (School Name) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="school-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="បញ្ចូលឈ្មោះសាលារៀន (e.g., សាលារៀនជំនាន់ថ្មី / New Generation School)"
                    disabled={!canEdit || saving || uploading}
                    required
                    className="h-10"
                    maxLength={100}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>ឈ្មោះផ្លូវការរបស់សាលារៀន</span>
                    <span>{name.length}/100</span>
                  </div>
                </div>

                {/* School Address */}
                <div className="space-y-2">
                  <Label htmlFor="school-address" className="font-medium flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    អាសយដ្ឋានសាលារៀន (School Address) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="school-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="បញ្ចូលអាសយដ្ឋានសាលារៀនពេញលេញ (e.g., ផ្លូវលេខ..., សង្កាត់..., ខណ្ឌ..., រាជធានីភ្នំពេញ)"
                    disabled={!canEdit || saving || uploading}
                    required
                    className="h-10"
                    maxLength={200}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>ទីតាំងភូមិសាស្ត្រ ឬអាសយដ្ឋានទំនាក់ទំនង</span>
                    <span>{address.length}/200</span>
                  </div>
                </div>

                {/* School Logo Section */}
                <div className="space-y-3 pt-2">
                  <Label className="font-medium flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    រូបសញ្ញាសាលារៀន (School Logo)
                  </Label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    disabled={!canEdit || saving || uploading}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    {/* Upload Box */}
                    <div
                      onClick={() => {
                        if (canEdit && !saving && !uploading) {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 hover:bg-muted/40 ${
                        logoFile ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                      } ${!canEdit || saving || uploading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {uploading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Upload className="h-5 w-5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-foreground">
                          {uploading
                            ? "កំពុងផ្ទុកឡើងទៅ Cloudinary..."
                            : "ចុចទីនេះដើម្បីជ្រើសរើសរូបសញ្ញាថ្មី"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          PNG, JPG, WEBP, SVG (ទំហំអតិបរមា 10MB)
                        </p>
                      </div>
                      {logoFile && (
                        <Badge variant="secondary" className="text-[10px] mt-1 font-mono">
                          {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                        </Badge>
                      )}
                    </div>

                    {/* Preview Box */}
                    <div className="border rounded-xl p-4 bg-muted/20 flex flex-col items-center justify-center min-h-[140px] text-center gap-3">
                      {logoPreview ? (
                        <>
                          <div className="relative group">
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="h-20 w-20 rounded-lg object-contain bg-background border p-1 shadow-xs"
                            />
                            {canEdit && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6 absolute -top-2 -right-2 rounded-full shadow-xs"
                                onClick={handleRemoveLogo}
                                disabled={saving || uploading}
                                title="លុបរូបភាព"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[11px] text-muted-foreground">
                              {uploadSuccess
                                ? "ផ្ទុកឡើងទៅ Cloudinary រួចរាល់"
                                : logoFile
                                ? "រូបភាពថ្មី"
                                : "រូបសញ្ញាបច្ចុប្បន្ន"}
                            </span>
                            {uploadSuccess && (
                              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Cloudinary Ready
                              </Badge>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground space-y-1">
                          <ImageIcon className="h-8 w-8 mx-auto stroke-1" />
                          <p className="text-xs">មិនទាន់មានរូបសញ្ញា</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload progress bar */}
                  {uploading && (
                    <div className="space-y-1.5 pt-2 bg-primary/5 p-3 rounded-lg border border-primary/20">
                      <div className="flex justify-between text-xs font-medium text-primary">
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          កំពុងផ្ទុកឡើងទៅកាន់ Cloudinary...
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Optional URL direct input */}
                  <div className="pt-2">
                    <Label htmlFor="direct-logo-url" className="text-xs text-muted-foreground">
                      ឬបញ្ចូលតំណភ្ជាប់រូបភាពផ្ទាល់ (Or direct image URL):
                    </Label>
                    <Input
                      id="direct-logo-url"
                      type="url"
                      value={logoUrl}
                      onChange={(e) => {
                        setLogoUrl(e.target.value);
                        if (!logoFile) setLogoPreview(e.target.value || null);
                      }}
                      placeholder="https://res.cloudinary.com/.../school-logo.png"
                      disabled={!canEdit || saving || uploading}
                      className="h-9 mt-1 text-xs font-mono"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-3 border-t pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={!isChanged || saving || uploading}
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  កំណត់ឡើងវិញ (Reset)
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !canEdit ||
                    saving ||
                    uploading ||
                    !name.trim() ||
                    !address.trim() ||
                    !isChanged
                  }
                  className="min-w-[150px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      កំពុងរក្សាទុក...
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      កំពុងផ្ទុកឡើង...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      រក្សាទុកការកែប្រែ (Save)
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
