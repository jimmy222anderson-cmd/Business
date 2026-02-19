# Quick Start Guide - Sub-Products System

## 🎯 What's Been Done

All 7 Commercial Imagery sub-products are now live with:
- Individual detail pages
- Rich content (descriptions, features, specs)
- Image upload capability
- Full admin panel management

## 🚀 Quick Access

### View Sub-Products (Frontend)
1. **Navigation Dropdown**
   ```
   Products → Commercial Imagery → [See 7 sub-products]
   ```

2. **Product Page**
   ```
   http://localhost:8081/products/commercial-imagery
   ```

3. **Individual Sub-Product Pages**
   ```
   http://localhost:8081/products/commercial-imagery/vhr
   http://localhost:8081/products/commercial-imagery/sar
   http://localhost:8081/products/commercial-imagery/dom
   http://localhost:8081/products/commercial-imagery/dsm
   http://localhost:8081/products/commercial-imagery/dem
   http://localhost:8081/products/commercial-imagery/ir
   http://localhost:8081/products/commercial-imagery/hyperspectral
   ```

### Manage Sub-Products (Admin)
1. **Login**
   ```
   http://localhost:8081/admin/dashboard
   ```

2. **Edit Product**
   ```
   Products Management → Edit "Commercial Imagery"
   ```

3. **Upload Images**
   - Scroll to sub-product card
   - Click "Choose File" in Image Upload section
   - Select image
   - Click "Update Product"

## 📸 Upload Images Now

### Recommended Image Specs
- **Size:** 1200x800px (or similar 3:2 ratio)
- **Format:** JPEG or PNG
- **Quality:** High resolution for detail pages
- **Content:** Relevant to each sub-product type

### Upload Process (5 minutes per image)
1. Login to admin panel
2. Go to Products Management
3. Click "Edit" on Commercial Imagery
4. Scroll to Sub-Products section
5. For each sub-product:
   - Find the sub-product card
   - Click "Choose File" in Image Upload
   - Select appropriate image
   - Image auto-uploads
6. Click "Update Product" at bottom
7. Done! Images now appear on frontend

## 🎨 Current Sub-Products

| # | Name | Slug | URL |
|---|------|------|-----|
| 1 | VHR (Very High Resolution) | vhr | `/products/commercial-imagery/vhr` |
| 2 | SAR (Synthetic Aperture Radar) | sar | `/products/commercial-imagery/sar` |
| 3 | DOM (Digital Orthophoto Map) | dom | `/products/commercial-imagery/dom` |
| 4 | DSM (Digital Surface Model) | dsm | `/products/commercial-imagery/dsm` |
| 5 | DEM (Digital Elevation Model) | dem | `/products/commercial-imagery/dem` |
| 6 | IR (Infrared) | ir | `/products/commercial-imagery/ir` |
| 7 | Hyperspectral | hyperspectral | `/products/commercial-imagery/hyperspectral` |

## ✅ What Each Sub-Product Has

### Content
- ✅ Name and slug
- ✅ Short description (for cards)
- ✅ Long description (3+ paragraphs)
- ✅ 3 key features
- ✅ 5 technical specifications
- ✅ Display order
- ⏳ Image (placeholder - ready for upload)

### Pages
- ✅ Individual detail page
- ✅ Breadcrumb navigation
- ✅ Features section
- ✅ Specifications table
- ✅ Related sub-products
- ✅ Inquiry form

## 🔧 Admin Panel Features

### What You Can Do
- ✅ Edit all sub-product content
- ✅ Upload individual images
- ✅ Add/remove sub-products
- ✅ Reorder sub-products
- ✅ Add features and specifications
- ✅ Update descriptions

### How to Edit
1. Login to admin panel
2. Products Management
3. Edit Commercial Imagery
4. Scroll to Sub-Products section
5. Click on any sub-product card to expand
6. Edit fields
7. Upload image if needed
8. Save product

## 📁 Where Images Are Stored

```
backend/uploads/products/
  ├── commercial-imagery-vhr.jpg
  ├── commercial-imagery-sar.jpg
  ├── commercial-imagery-dom.jpg
  ├── commercial-imagery-dsm.jpg
  ├── commercial-imagery-dem.jpg
  ├── commercial-imagery-ir.jpg
  └── commercial-imagery-hyperspectral.jpg
```

## 🎯 Next Actions

### Priority 1: Upload Images
Upload actual images for all 7 sub-products via admin panel.

### Priority 2: Test Pages
Visit each sub-product page and verify:
- Content displays correctly
- Navigation works
- Images appear (after upload)
- Inquiry form works

### Priority 3: Customize (Optional)
- Adjust descriptions if needed
- Add more features/specs
- Update display order

## 💡 Tips

### Image Selection
- VHR: High-resolution satellite imagery
- SAR: Radar imagery (all-weather)
- DOM: Orthophoto map example
- DSM: 3D surface model visualization
- DEM: Terrain elevation map
- IR: Infrared/thermal imagery
- Hyperspectral: Multi-band spectral image

### Content Editing
- Keep short descriptions under 200 characters
- Long descriptions should be 3-5 paragraphs
- Features should highlight key benefits
- Specifications should be technical and precise

## 🆘 Troubleshooting

### Images Not Showing?
1. Check if image was uploaded successfully
2. Verify image path in admin panel
3. Check browser console for errors
4. Ensure image file is in `backend/uploads/products/`

### Sub-Product Page Not Loading?
1. Verify slug is correct
2. Check if sub-product exists in database
3. Clear browser cache
4. Check browser console for errors

### Can't Edit in Admin Panel?
1. Ensure you're logged in as admin
2. Check admin token is valid
3. Verify backend server is running
4. Check browser console for API errors

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend server logs
3. Verify database connection
4. Review implementation docs in `.kiro/specs/`

## ✨ Summary

Everything is set up and ready! Just upload images via the admin panel and you're done. All 7 sub-products have rich content and are accessible via their own pages.

**Total Time to Complete:** ~30 minutes to upload all images
**Result:** Professional sub-product pages with full content
