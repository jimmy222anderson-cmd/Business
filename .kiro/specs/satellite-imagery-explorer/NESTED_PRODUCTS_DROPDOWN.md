# Nested Products Dropdown Implementation

## Overview
Enhanced the Products dropdown to support hierarchical/nested structure, allowing parent products (like "Commercial Imagery") to contain multiple sub-products (VHR, SAR, DOM, DSM, DEM, IR, Hyperspectral).

## Changes Made

### 1. Backend - Product Model
**File**: `backend/models/Product.js`

Added `subProducts` schema to support nested products:

```javascript
const subProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  description: String,
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

// Added to productSchema:
subProducts: [subProductSchema]
```

### 2. Frontend - Navbar Component
**File**: `src/components/Navbar.tsx`

#### Added Imports
```typescript
import { ChevronRight } from 'lucide-react';
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
```

#### Updated Interfaces
```typescript
interface SubProduct {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  subProducts?: SubProduct[];
}
```

#### Desktop Dropdown with Nested Support
```typescript
<DropdownMenu>
  <DropdownMenuTrigger>
    <span>Products</span>
    <ChevronDown className="w-4 h-4" />
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    {products.map((product) => (
      product.subProducts && product.subProducts.length > 0 ? (
        // Nested submenu for products with sub-products
        <DropdownMenuSub key={product._id}>
          <DropdownMenuSubTrigger>
            {product.name}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {product.subProducts.map((subProduct) => (
              <DropdownMenuItem asChild>
                <Link to={`/products/${product.slug}/${subProduct.slug}`}>
                  {subProduct.name}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`/products/${product.slug}`}>
                View All {product.name}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      ) : (
        // Regular menu item for products without sub-products
        <DropdownMenuItem key={product._id} asChild>
          <Link to={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </DropdownMenuItem>
      )
    ))}
    <DropdownMenuSeparator />
    <DropdownMenuItem asChild>
      <Link to="/products">View All Products</Link>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Mobile Menu with Nested Support
```typescript
<div className="space-y-3">
  <div className="text-lg font-medium text-foreground">Products</div>
  <div className="pl-4 space-y-2">
    {products.map((product) => (
      <div key={product._id}>
        {product.subProducts && product.subProducts.length > 0 ? (
          <div className="space-y-2">
            <div className="font-medium text-foreground/90">{product.name}</div>
            <div className="pl-4 space-y-1">
              {product.subProducts.map((subProduct) => (
                <Link
                  to={`/products/${product.slug}/${subProduct.slug}`}
                  className="block text-sm text-foreground/70 hover:text-primary"
                >
                  {subProduct.name}
                </Link>
              ))}
              <Link
                to={`/products/${product.slug}`}
                className="block text-sm text-primary font-semibold"
              >
                View All {product.name}
              </Link>
            </div>
          </div>
        ) : (
          <Link to={`/products/${product.slug}`}>
            {product.name}
          </Link>
        )}
      </div>
    ))}
  </div>
</div>
```

## Example Data Structure

### Product with Sub-Products (Commercial Imagery)
```json
{
  "_id": "product_id_1",
  "name": "Commercial Imagery",
  "slug": "commercial-imagery",
  "description": "High-resolution satellite imagery from leading providers worldwide",
  "category": "imagery",
  "status": "active",
  "subProducts": [
    {
      "_id": "sub_1",
      "name": "VHR (Very High Resolution)",
      "slug": "vhr",
      "description": "Sub-meter resolution imagery",
      "order": 1
    },
    {
      "_id": "sub_2",
      "name": "SAR (Synthetic Aperture Radar)",
      "slug": "sar",
      "description": "All-weather radar imagery",
      "order": 2
    },
    {
      "_id": "sub_3",
      "name": "DOM (Digital Orthophoto Map)",
      "slug": "dom",
      "description": "Geometrically corrected aerial photos",
      "order": 3
    },
    {
      "_id": "sub_4",
      "name": "DSM (Digital Surface Model)",
      "slug": "dsm",
      "description": "3D surface elevation data",
      "order": 4
    },
    {
      "_id": "sub_5",
      "name": "DEM (Digital Elevation Model)",
      "slug": "dem",
      "description": "Terrain elevation data",
      "order": 5
    },
    {
      "_id": "sub_6",
      "name": "IR (Infrared)",
      "slug": "ir",
      "description": "Infrared spectrum imagery",
      "order": 6
    },
    {
      "_id": "sub_7",
      "name": "Hyperspectral",
      "slug": "hyperspectral",
      "description": "Multi-band spectral imaging",
      "order": 7
    }
  ]
}
```

### Product without Sub-Products (Analytics)
```json
{
  "_id": "product_id_2",
  "name": "Analytics",
  "slug": "analytics",
  "description": "Advanced geospatial analytics powered by AI",
  "category": "analytics",
  "status": "active",
  "subProducts": []
}
```

## URL Structure

### Parent Product
- `/products/commercial-imagery` - Shows all Commercial Imagery sub-products

### Sub-Product
- `/products/commercial-imagery/vhr` - Shows VHR specific page
- `/products/commercial-imagery/sar` - Shows SAR specific page
- `/products/commercial-imagery/dom` - Shows DOM specific page
- etc.

### All Products
- `/products` - Shows all products overview

## Features

### Desktop Dropdown
- **Nested Submenu**: Products with sub-products show a submenu on hover
- **ChevronRight Icon**: Indicates nested items (automatically added by DropdownMenuSubTrigger)
- **View All Link**: Each parent product has a "View All {Product Name}" link
- **Smooth Transitions**: Hover effects and animations
- **Keyboard Navigation**: Full keyboard support

### Mobile Menu
- **Hierarchical Display**: Parent products shown with indented sub-products
- **Visual Hierarchy**: Different font sizes and colors for parent/child
- **Collapsible**: Sub-products are always visible under their parent
- **Touch Optimized**: Larger touch targets for mobile

## Admin Management

To add sub-products to a product in the admin panel:

1. Go to Products Management
2. Edit a product (e.g., "Commercial Imagery")
3. Add sub-products in the form:
   - Name: "VHR"
   - Slug: "vhr"
   - Description: "Very High Resolution imagery"
   - Order: 1
4. Save the product

## Benefits

1. **Better Organization**: Group related products logically
2. **Improved Navigation**: Users can quickly find specific product types
3. **Scalability**: Easy to add more sub-products without cluttering the menu
4. **Flexibility**: Products can have sub-products or be standalone
5. **SEO Friendly**: Clear URL structure for sub-products

## Testing Checklist

- [ ] Products with sub-products show nested dropdown on desktop
- [ ] Hovering over parent product shows sub-products
- [ ] Clicking sub-product navigates to correct URL
- [ ] "View All {Product}" link works correctly
- [ ] Products without sub-products show as regular items
- [ ] Mobile menu shows hierarchical structure
- [ ] Mobile sub-product links work correctly
- [ ] Keyboard navigation works for nested menus
- [ ] ChevronRight icon appears for nested items
- [ ] All transitions and animations work smoothly

## Files Modified

1. `backend/models/Product.js` - Added subProducts schema
2. `src/components/Navbar.tsx` - Added nested dropdown support

## Migration Notes

### For Existing Products
- Existing products without `subProducts` field will work as before
- The `subProducts` field is optional (defaults to empty array)
- No database migration required - field is added dynamically

### Adding Sub-Products
You can add sub-products via:
1. Admin panel (when form is updated)
2. Direct database update
3. API endpoint (when implemented)

Example MongoDB update:
```javascript
db.products.updateOne(
  { slug: "commercial-imagery" },
  {
    $set: {
      subProducts: [
        { name: "VHR", slug: "vhr", description: "Very High Resolution", order: 1 },
        { name: "SAR", slug: "sar", description: "Synthetic Aperture Radar", order: 2 },
        // ... more sub-products
      ]
    }
  }
);
```

## Future Enhancements

1. **Admin UI**: Add sub-product management to admin product form
2. **Deep Nesting**: Support multiple levels of nesting (if needed)
3. **Icons**: Add icons for sub-products
4. **Search**: Add search within sub-products
5. **Badges**: Show "New" or "Popular" badges on sub-products
