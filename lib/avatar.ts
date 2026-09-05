import { createClient } from "./supabase/client";

/**
 * Generates a clean, professional, dynamic avatar URL based on the lawyer's name.
 * Uses official brand coral (#e11d48) with white bold initials.
 */
export function getDefaultAvatar(name?: string): string {
  const safeName = name?.trim() || "Advocate";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=e11d48&color=ffffff&size=256&bold=true&font-size=0.4`;
}

export interface AvatarUploadResult {
  url?: string;
  error?: string;
}

/**
 * Converts a browser File to base64 Data URL for instant, zero-latency preview
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a user-selected image to Supabase Storage 'avatars' bucket
 * and returns the public URL.
 */
export async function uploadAvatarToSupabase(
  file: File,
  userId?: string
): Promise<AvatarUploadResult> {
  // Validate MIME type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      error: "Please upload an image file (JPG, PNG, WEBP, or GIF).",
    };
  }

  // Validate size: 5MB maximum
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return {
      error: "Image size exceeds 5MB limit. Please choose a smaller photo.",
    };
  }

  const supabase = createClient();
  if (!supabase) {
    return {
      error: "Supabase connection is not available.",
    };
  }

  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const sanitizedExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanUserId = userId ? userId.replace(/[^a-zA-Z0-9_-]/g, "") : "lawyer";
    const fileName = `${cleanUserId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${sanitizedExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { error: uploadError.message };
    }

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (!publicData?.publicUrl) {
      return { error: "Failed to generate public image URL." };
    }

    return { url: publicData.publicUrl };
  } catch (err: any) {
    console.error("Unexpected upload error:", err);
    return { error: err.message || "Failed to upload image." };
  }
}
