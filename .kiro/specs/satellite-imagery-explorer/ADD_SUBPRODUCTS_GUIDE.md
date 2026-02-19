# Guide: Adding Sub-Products to Commercial Imagery

## Overview
This guide explains how to add the 7 sub-products (VHR, SAR, DOM, DSM, DEM, IR, Hyperspectral) to the Commercial Imagery product.

## Sub-Products to Add

1. **VHR (Very High Resolution)**
   - Slug: `vhr`
   - Description: Sub-meter resolution imagery for detailed analysis and precise measurements
   - Order: 1

2. **SAR (Synthetic Aperture Radar)**
   - Slug: `sar`
   - Description: All-weather radar imagery that penetrates clouds and works day or night
   - Order: 2

3. **DOM (Digital Orthophoto Map)**
   - Slug: `dom`
   - Description: Geometrically corrected aerial photographs with uniform scale
   - Order: 3

4. **DSM (Digital Surface Model)**
   - Slug: `dsm`
   - Description: 3D surface elevation data including buildings, vegetation, and infrastructure
   - Order: 4

5. **DEM (Digital Elevation Model)**
   - Slug: `dem`
   - Description: Bare earth terrain elevation data with vegetation and structures removed
   - Order: 5

6. **IR (Infrared)**
   - Slug: `ir`
   - Description: Infrared spectrum imagery for thermal analysis and vegetation health monitoring
   - Order: 6

7. **Hyperspectral**
   - Slug: `hyperspectral`
   - Description: Multi-band spectral imaging for material identification and classification
   - Order: 7

## Method 1: Via Admin Panel (Recommended)

### Steps:

1. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Login as admin**
   - Go to `http://localhost:8081`
   - Click "Sign In"
   - Use admin credentials

3. **Navigate to Products Management**
   - Click on your profile dropdown
   - Select "Admin Panel"
   - Click "Products Management" from the sidebar

4. **Edit Commercial Imagery**
   - Find "Commercial Imagery" in the products list
   - Click the "Edit" button (pencil icon)

5. **Add Sub-Products**
   - Scroll down to the "Sub-Products" section
   - Click "Add Sub-Product" button 7 times
   - Fill in each sub-product:

   **Sub-Product 1:**
   - Name: `VHR (Very High Resolution)`
   - Slug: `vhr` (auto-generated)
   - Description: `Sub-meter resolution imagery for detailed analysis and precise measurements. Ideal for urban planning, infrastructure monitoring, and detailed asset inspection.`
   - Order: `1`

   **Sub-Product 2:**
   - Name: `SAR (Synthetic Aperture Radar)`
   - Slug: `sar`
   - Description: `All-weather radar imagery that penetrates clouds and works day or night. Perfect for monitoring in challenging weather conditions and detecting ground deformation.`
   - Order: `2`

   **Sub-Product 3:**
   - Name: `DOM (Digital Orthophoto Map)`
   - Slug: `dom`
   - Description: `Geometrically corrected aerial photographs with uniform scale. Essential for mapping, GIS applications, and creating accurate base maps.`
   - Order: `3`

   **Sub-Product 4:**
   - Name: `DSM (Digital Surface Model)`
   - Slug: `dsm`
   - Description: `3D surface elevation data including buildings, vegetation, and infrastructure. Critical for urban modeling, flood analysis, and line-of-sight studies.`
   - Order: `4`

   **Sub-Product 5:**
   - Name: `DEM (Digital Elevation Model)`
   - Slug: `dem`
   - Description: `Bare earth terrain elevation data with vegetation and structures removed. Used for hydrological modeling, terrain analysis, and engineering applications.`
   - Order: `5`

   **Sub-Product 6:**
   - Name: `IR (Infrared)`
   - Slug: `ir`
   - Description: `Infrared spectrum imagery for thermal analysis and vegetation health monitoring. Valuable for agriculture, environmental monitoring, and heat loss detection.`
   - Order: `6`

   **Sub-Product 7:**
   - Name: `Hyperspectral)`
   - Slug: `hyperspectral`
   - Description: `Multi-band spectral imaging for material identification and classification. Advanced applications in mineral exploration, precision agriculture, and environmental assessment.`
   - Order: `7`

6. **Save**
   - Click "Update Product" button at the bottom
   - Wait for success message

7. **Verify**
   - Go to the main website
   - Hover over "Products" in the navigation
   - You should see "Commercial Imagery" with a submenu showing all 7 sub-products

## Method 2: Via Script (When Backend is Running)

### Prerequisites:
- Backend server must be running
- You need an admin token

### Steps:

1. **Get Admin Token**
   ```bash
   cd backend
   node scripts/get-admin-token.js
   ```
   Copy the token from the output

2. **Run the Script**
   ```bash
   node scripts/add-subproducts-via-api.js YOUR_ADMIN_TOKEN_HERE
   ```

3. **Verify**
   - Refresh the website
   - Check the Products dropdown

## Method 3: Via MongoDB Direct Update

### Prerequisites:
- MongoDB connection access
- MongoDB Compass or mongosh CLI

### Using MongoDB Compass:

1. Connect to your database
2. Navigate to `earth-intelligence` database
3. Open `products` collection
4. Find the document with `slug: "commercial-imagery"`
5. Click "Edit Document"
6. Add the `subProducts` array:

```json
{
  "subProducts": [
    {
      "name": "VHR (Very High Resolution)",
      "slug": "vhr",
      "description": "Sub-meter resolution imagery for detailed analysis and precise measurements. Ideal for urban planning, infrastructure monitoring, and detailed asset inspection.",
      "order": 1
    },
    {
      "name": "SAR (Synthetic Aperture Radar)",
      "slug": "sar",
      "description": "All-weather radar imagery that penetrates clouds and works day or night. Perfect for monitoring in challenging weather conditions and detecting ground deformation.",
      "order": 2
    },
    {
      "name": "DOM (Digital Orthophoto Map)",
      "slug": "dom",
      "description": "Geometrically corrected aerial photographs with uniform scale. Essential for mapping, GIS applications, and creating accurate base maps.",
      "order": 3
    },
    {
      "name": "DSM (Digital Surface Model)",
      "slug": "dsm",
      "description": "3D surface elevation data including buildings, vegetation, and infrastructure. Critical for urban modeling, flood analysis, and line-of-sight studies.",
      "order": 4
    },
    {
      "name": "DEM (Digital Elevation Model)",
      "slug": "dem",
      "description": "Bare earth terrain elevation data with vegetation and structures removed. Used for hydrological modeling, terrain analysis, and engineering applications.",
      "order": 5
    },
    {
      "name": "IR (Infrared)",
      "slug": "ir",
      "description": "Infrared spectrum imagery for thermal analysis and vegetation health monitoring. Valuable for agriculture, environmental monitoring, and heat loss detection.",
      "order": 6
    },
    {
      "name": "Hyperspectral",
      "slug": "hyperspectral",
      "description": "Multi-band spectral imaging for material identification and classification. Advanced applications in mineral exploration, precision agriculture, and environmental assessment.",
      "order": 7
    }
  ]
}
```

7. Click "Update"

### Using mongosh CLI:

```javascript
use earth-intelligence

db.products.updateOne(
  { slug: "commercial-imagery" },
  {
    $set: {
      subProducts: [
        {
          name: "VHR (Very High Resolution)",
          slug: "vhr",
          description: "Sub-meter resolution imagery for detailed analysis and precise measurements. Ideal for urban planning, infrastructure monitoring, and detailed asset inspection.",
          order: 1
        },
        {
          name: "SAR (Synthetic Aperture Radar)",
          slug: "sar",
          description: "All-weather radar imagery that penetrates clouds and works day or night. Perfect for monitoring in challenging weather conditions and detecting ground deformation.",
          order: 2
        },
        {
          name: "DOM (Digital Orthophoto Map)",
          slug: "dom",
          description: "Geometrically corrected aerial photographs with uniform scale. Essential for mapping, GIS applications, and creating accurate base maps.",
          order: 3
        },
        {
          name: "DSM (Digital Surface Model)",
          slug: "dsm",
          description: "3D surface elevation data including buildings, vegetation, and infrastructure. Critical for urban modeling, flood analysis, and line-of-sight studies.",
          order: 4
        },
        {
          name: "DEM (Digital Elevation Model)",
          slug: "dem",
          description: "Bare earth terrain elevation data with vegetation and structures removed. Used for hydrological modeling, terrain analysis, and engineering applications.",
          order: 5
        },
        {
          name: "IR (Infrared)",
          slug: "ir",
          description: "Infrared spectrum imagery for thermal analysis and vegetation health monitoring. Valuable for agriculture, environmental monitoring, and heat loss detection.",
          order: 6
        },
        {
          name: "Hyperspectral",
          slug: "hyperspectral",
          description: "Multi-band spectral imaging for material identification and classification. Advanced applications in mineral exploration, precision agriculture, and environmental assessment.",
          order: 7
        }
      ]
    }
  }
)
```

## Verification Checklist

After adding sub-products, verify:

### Navigation Dropdown
- [ ] Hover over "Products" in the header
- [ ] "Commercial Imagery" shows a right arrow (▶)
- [ ] Hovering over "Commercial Imagery" shows submenu
- [ ] All 7 sub-products are listed
- [ ] "View All Commercial Imagery" link appears at bottom
- [ ] Clicking a sub-product navigates correctly

### Mobile Menu
- [ ] Open mobile menu
- [ ] "Products" section shows "Commercial Imagery"
- [ ] All 7 sub-products are indented under it
- [ ] "View All Commercial Imagery" link appears
- [ ] Links work correctly

### Product Page
- [ ] Visit `/products/commercial-imagery`
- [ ] "Available Options" section appears
- [ ] All 7 sub-products shown as cards
- [ ] Cards display name and description
- [ ] Hover effect works
- [ ] Clicking card navigates to sub-product page

### Admin Panel
- [ ] Go to `/admin/products`
- [ ] Edit "Commercial Imagery"
- [ ] Scroll to "Sub-Products" section
- [ ] All 7 sub-products are listed
- [ ] Can edit each sub-product
- [ ] Can remove sub-products
- [ ] Can add more sub-products

## Troubleshooting

### Sub-products not showing in dropdown
- Clear browser cache
- Refresh the page
- Check browser console for errors
- Verify product has `status: 'active'`

### Sub-products not showing on product page
- Check that product slug is correct
- Verify sub-products array is not empty
- Check browser console for errors

### Can't edit sub-products in admin
- Verify you're logged in as admin
- Check that form loaded correctly
- Try refreshing the page

### Script fails to connect
- Verify MongoDB connection string in `.env`
- Check network connectivity
- Try using admin panel method instead

## Adding Images to Sub-Products (Future Enhancement)

Currently, sub-products don't have individual images. To add this feature:

1. Update `backend/models/Product.js`:
   ```javascript
   const subProductSchema = new mongoose.Schema({
     name: String,
     slug: String,
     description: String,
     image: String,  // Add this
     order: Number
   });
   ```

2. Update `src/pages/admin/ProductFormPage.tsx`:
   - Add ImageUpload component for each sub-product

3. Update `src/pages/ProductDetailPage.tsx`:
   - Display sub-product images in cards

## Summary

The easiest method is **Method 1: Via Admin Panel**. It's visual, user-friendly, and doesn't require any scripts or database access.

Once added, the sub-products will immediately appear in:
- Navigation dropdown (desktop & mobile)
- Product detail page
- Admin panel for editing

The system is fully functional and ready to use!
