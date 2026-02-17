/**
 * Convert relative image URLs to absolute URLs
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns Full URL to the image
 */
export function getImageUrl(imageUrl: string): string {
  if (!imageUrl) return '/placeholder.svg';
  
  // If already a full URL (http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path starting with /uploads, prepend backend URL
  if (imageUrl.startsWith('/uploads')) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  }
  
  // Otherwise return as is (might be a public path like /placeholder.svg)
  return imageUrl;
}
