export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: "image" | "video";
  format: string;
}

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  if (CLOUDINARY_CLOUD_NAME === 'demo') {
    // Mock successful upload for demo if not configured
    await new Promise(r => setTimeout(r, 1000));
    return {
      public_id: `demo_${Date.now()}`,
      secure_url: URL.createObjectURL(file), // mock url
      resource_type: resourceType,
      format: file.type.split('/')[1] || 'jpg'
    };
  }

  const response = await fetch(endpoint, { method: "POST", body: formData });
  if (!response.ok) throw new Error("Failed to upload to Cloudinary");

  const data = await response.json();
  return {
    public_id: data.public_id,
    secure_url: data.secure_url,
    resource_type: data.resource_type,
    format: data.format,
  };
}
