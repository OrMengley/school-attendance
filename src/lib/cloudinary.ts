import axios from "axios";

export interface CloudinaryUploadOptions {
  folder?: string;
  resourceType?: "image" | "raw" | "auto" | "video";
  onProgress?: (progressPercent: number) => void;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  url: string;
  public_id: string;
  format: string;
  bytes: number;
  resource_type: string;
  created_at: string;
  [key: string]: any;
}

/**
 * Uploads a file (image, document, etc.) to Cloudinary via unsigned upload preset.
 * Configured using VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env
 */
export async function uploadToCloudinary(
  file: File | Blob,
  options: CloudinaryUploadOptions = {}
): Promise<string> {
  const { folder, resourceType = "auto", onProgress } = options;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

  if (!cloudName || !uploadPreset) {
    const missing = [];
    if (!cloudName) missing.push("VITE_CLOUDINARY_CLOUD_NAME");
    if (!uploadPreset) missing.push("VITE_CLOUDINARY_UPLOAD_PRESET");
    throw new Error(
      `Cloudinary configuration missing (${missing.join(", ")}). Please add them to your .env file.`
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (folder) {
    formData.append("folder", folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  // Use a clean axios request without application Authorization bearer tokens
  const response = await axios.post<CloudinaryUploadResponse>(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    transformRequest: [
      (data, headers) => {
        if (headers && "Authorization" in headers) {
          delete (headers as any).Authorization;
        }
        return data;
      },
    ],
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data.secure_url;
}

export default uploadToCloudinary;
