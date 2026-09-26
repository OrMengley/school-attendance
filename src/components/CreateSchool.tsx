import React, { useState, useRef } from "react";
import API from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { School, ArrowLeft, Save, Upload, Image as ImageIcon, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { uploadToCloudinary } from "../lib/cloudinary";
import { toast } from "sonner";

export default function CreateSchool() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must not exceed 10MB");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadToCloudinary(file, {
        folder: "schools",
        onProgress: (p) => setUploadProgress(p),
      });
      setLogoUrl(url);
      setLogoPreview(url);
      toast.success("Logo uploaded to Cloudinary successfully!");
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      toast.error(err?.response?.data?.error?.message || err?.message || "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalLogoUrl = logoUrl;
      if (logoFile && !finalLogoUrl) {
        setUploading(true);
        const url = await uploadToCloudinary(logoFile, {
          folder: "schools",
          onProgress: (p) => setUploadProgress(p),
        });
        finalLogoUrl = url;
        setUploading(false);
      }

      const schoolData = {
        _id: uuidv4(),
        name: name.trim(),
        address: address.trim(),
        logo_url: finalLogoUrl || "",
        is_active: true,
      };

      await API.post("/schools", schoolData);
      toast.success("School created successfully!");
      navigate("/view/schools");
    } catch (err: any) {
      console.error("Failed to create school:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Unknown error occurred";
      toast.error(`Failed to create school: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/view/schools")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schools
        </Button>

        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <School className="h-8 w-8 text-primary" />
            Create New School
          </h1>
          <p className="text-muted-foreground mt-2">
            Add a new school to the system with name, address, and logo
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
          <CardDescription>
            Please provide the basic information for the new school
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter school name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting || uploading}
                maxLength={100}
              />
              {name.length > 80 && (
                <p className="text-sm text-muted-foreground">
                  {100 - name.length} characters remaining
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter complete school address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={isSubmitting || uploading}
                maxLength={200}
              />
              {address.length > 150 && (
                <p className="text-sm text-muted-foreground">
                  {200 - address.length} characters remaining
                </p>
              )}
            </div>

            {/* School Logo */}
            <div className="space-y-2 pt-1">
              <Label className="flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                School Logo
              </Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isSubmitting || uploading}
              />

              <div className="flex items-center gap-4">
                <div
                  onClick={() => {
                    if (!isSubmitting && !uploading) {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-4 flex-1 text-center cursor-pointer transition-colors hover:bg-muted/40 ${
                    logoFile ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-medium text-foreground">
                      {uploading ? `Uploading (${uploadProgress}%)...` : "Click to select logo"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Uploads directly to Cloudinary (PNG, JPG, WEBP)
                  </p>
                </div>

                {logoPreview && (
                  <div className="relative group">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-16 h-16 rounded-lg object-contain border bg-background p-1"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-5 w-5 absolute -top-1.5 -right-1.5 rounded-full"
                      onClick={handleRemoveLogo}
                      disabled={isSubmitting || uploading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {logoUrl && (
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Cloudinary URL generated</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || uploading || !name.trim() || !address.trim()}
                className="flex items-center gap-2 min-w-[130px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create School
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/view/schools")}
                disabled={isSubmitting || uploading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}