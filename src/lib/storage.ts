import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface FileUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: "image" | "video";
  format: string;
}

export async function uploadToStorage(
  file: File,
  folder: string
): Promise<FileUploadResult> {
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const ext = file.name.split('.').pop() || (resourceType === 'video' ? 'mp4' : 'jpg');
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const filePath = `${folder}/${fileName}`;
  
  const storageRef = ref(storage, filePath);
  
  // Upload file
  await uploadBytesResumable(storageRef, file);
  
  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);

  return {
    public_id: filePath,
    secure_url: downloadURL,
    resource_type: resourceType,
    format: ext,
  };
}
