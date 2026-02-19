# Image Upload Directory Fix

## Issue
When uploading images for satellite products in the admin form, images were being saved to `uploads/general` instead of `uploads/satelliteproduct`.

## Root Cause
The `ImageUpload` component in the `SatelliteProductForm` was using `category="general"` instead of `category="satelliteproduct"`.

Additionally, the backend upload route and the TypeScript interface didn't include `satelliteproduct` as a valid category.

## Solution

### 1. Frontend Changes

#### File: `src/components/admin/SatelliteProductForm.tsx`
Changed the ImageUpload component category prop:
```typescript
// Before
<ImageUpload
  value={formData.sample_image_url}
  onChange={(url) => setFormData({ ...formData, sample_image_url: url })}
  label="Sample Image"
  category="general"  // ❌ Wrong category
  customName={formData.name.toLowerCase().replace(/\s+/g, '-')}
/>

// After
<ImageUpload
  value={formData.sample_image_url}
  onChange={(url) => setFormData({ ...formData, sample_image_url: url })}
  label="Sample Image"
  category="satelliteproduct"  // ✅ Correct category
  customName={formData.name.toLowerCase().replace(/\s+/g, '-')}
/>
```

#### File: `src/components/ImageUpload.tsx`
Updated the TypeScript interface to include the new category:
```typescript
// Before
interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  category?: 'products' | 'industries' | 'partners' | 'blog' | 'general';
  customName?: string;
}

// After
interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  category?: 'products' | 'industries' | 'partners' | 'blog' | 'general' | 'satelliteproduct';
  customName?: string;
}
```

### 2. Backend Changes

#### File: `backend/routes/upload.js`
Added `satelliteproduct` to the categories directory configuration:
```javascript
// Before
const categoriesDir = {
  products: path.join(uploadsDir, 'products'),
  industries: path.join(uploadsDir, 'industries'),
  partners: path.join(uploadsDir, 'partners'),
  blog: path.join(uploadsDir, 'blog'),
  general: path.join(uploadsDir, 'general')
};

// After
const categoriesDir = {
  products: path.join(uploadsDir, 'products'),
  industries: path.join(uploadsDir, 'industries'),
  partners: path.join(uploadsDir, 'partners'),
  blog: path.join(uploadsDir, 'blog'),
  general: path.join(uploadsDir, 'general'),
  satelliteproduct: path.join(uploadsDir, 'satelliteproduct')  // ✅ Added
};
```

Updated the JSDoc comment:
```javascript
/**
 * POST /api/upload
 * Upload an image file to organized folders
 * Requires authentication
 * Body params: category (products|industries|partners|blog|general|satelliteproduct), name (optional custom name)
 */
```

## Result
Now when admins upload images for satellite products:
1. Images are saved to `backend/uploads/satelliteproduct/` directory
2. The directory is automatically created if it doesn't exist
3. Images are named with the product name (sanitized) + timestamp
4. The URL stored in the database is `/uploads/satelliteproduct/{filename}`

## Testing
To verify the fix:
1. Go to `/admin/satellite-products/new` or edit an existing product
2. Upload an image in the "Sample Image" section
3. Check that the image is saved to `backend/uploads/satelliteproduct/`
4. Verify the image displays correctly in the form preview
5. Save the product and verify the image displays in the products table

## Files Modified
- `src/components/admin/SatelliteProductForm.tsx` - Changed category prop
- `src/components/ImageUpload.tsx` - Updated TypeScript interface
- `backend/routes/upload.js` - Added satelliteproduct category

## Notes
- The backend automatically creates the `satelliteproduct` directory if it doesn't exist
- Existing images in the `general` folder are not affected
- New uploads will go to the correct `satelliteproduct` folder
- The custom name feature uses the product name (sanitized) for better organization
