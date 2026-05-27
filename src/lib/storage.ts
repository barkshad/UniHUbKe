export interface FileUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: "image" | "video";
  format: string;
}

export async function uploadToStorage(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<FileUploadResult> {
  const CLOUDINARY_CLOUD_NAME = 'dilrcexxe';
  const CLOUDINARY_UPLOAD_PRESET = 'MingleKe';
  
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            public_id: data.public_id,
            secure_url: data.secure_url,
            resource_type: data.resource_type,
            format: data.format,
          });
        } catch (error) {
          reject(new Error("Failed to parse Cloudinary response"));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };

    xhr.send(formData);
  });
}
