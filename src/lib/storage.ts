import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import imageCompression from 'browser-image-compression';

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
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const ext = file.name.split('.').pop() || (resourceType === 'video' ? 'mp4' : 'jpg');
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const filePath = `${folder}/${fileName}`;
  
  let fileToUpload = file;
  
  if (resourceType === 'image') {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      fileToUpload = await imageCompression(file, options);
    } catch (error) {
      console.error("Image compression failed:", error);
    }
  }

  const storageRef = ref(storage, filePath);
  
  // Upload file
  const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          public_id: filePath,
          secure_url: downloadURL,
          resource_type: resourceType,
          format: ext,
        });
      }
    );
  });
}
