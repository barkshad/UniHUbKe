import { uploadToStorage } from './storage';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const result = await uploadToStorage(file, 'media');
  return result.secure_url;
};
