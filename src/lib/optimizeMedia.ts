export const optimizeCloudinaryUrl = (
  url: string,
  resourceType: 'image' | 'video' = 'image'
): string => {
  if (!url || !url.includes('cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  if (parts[1].match(/f_auto|q_auto/)) {
    return url;
  }

  const transformations = resourceType === 'video' 
    ? 'q_auto,f_auto,vc_auto' 
    : 'q_auto,f_auto,c_limit,w_1200';

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};

export const optimizeThumbnailUrl = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  // Transform to small square image for thumbnails
  return `${parts[0]}/upload/f_auto,q_auto,c_fill,w_300,h_300/${parts[1].replace(/\.(mp4|webm|ogg)$/i, '.jpg')}`;
};

export const getCloudinaryPosterNode = (url: string): string => {
  if (!url || !url.includes('cloudinary.com') || !url.match(/\.(mp4|webm|ogg)$/i)) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  // Create image thumbnail URL from video
  return `${parts[0]}/upload/f_auto,q_auto,so_0/${parts[1].replace(/\.(mp4|webm|ogg)$/i, '.jpg')}`;
};
