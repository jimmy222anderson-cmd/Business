# Blog Image Display Fix

## Issue
The Climate Change blog post image was not displaying on the blog listing page because it had a relative path (`/uploads/blog/...`) instead of a full URL.

## Root Cause
- The Climate Change blog post was using a local file path: `/uploads/blog/climate-change-monitoring-earth-observation-1771513847214.gif`
- Other blog posts were using Unsplash URLs (full HTTP URLs)
- The BlogPage component wasn't handling relative paths correctly

## Solution
Updated `src/pages/BlogPage.tsx` to use the existing `getImageUrl()` utility function that properly handles:
- Full HTTP/HTTPS URLs (returns as-is)
- Relative paths starting with `/uploads` (prepends backend URL)
- Fallback to placeholder for missing images

## Changes Made

### 1. Updated BlogPage.tsx
- Added import for `getImageUrl` utility
- Changed image src from direct URL to `getImageUrl(post.featured_image_url || post.featuredImage)`
- Added error handler to fallback to placeholder on image load failure

### 2. Verified BlogPostPage.tsx
- Already using `getImageUrl()` utility correctly
- No changes needed

## How It Works

The `getImageUrl()` utility (in `src/lib/utils/image.ts`):
```typescript
export function getImageUrl(imageUrl: string): string {
  if (!imageUrl) return '/placeholder.svg';
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If relative path with /uploads, prepend backend URL
  if (imageUrl.startsWith('/uploads')) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  }
  
  return imageUrl;
}
```

## Result
✅ All blog post images now display correctly on both:
- Blog listing page (`/blog`)
- Blog detail pages (`/blog/:slug`)

## Blog Posts Status
All 6 blog posts now have working images:
1. Climate Change Monitoring - Local file (now handled correctly)
2. Urban Planning - Unsplash URL
3. Precision Agriculture - Unsplash URL
4. Disaster Response - Unsplash URL
5. Satellite Data Agriculture - Unsplash URL
6. SAR vs Optical - Unsplash URL
