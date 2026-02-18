# Z-Index System for Explorer Page

## Current Z-Index Hierarchy (Organized)

### Base Layer (0-100)
- `z-10` - Sidebar, Navigation elements, Carousel controls
- `z-20` - Sidebar resize handle
- `z-50` - Tooltips, Popovers, Menubar dropdowns, Sheet overlays, SearchBar dropdowns

### Mid Layer (100-1000)
- `z-[100]` - Toast notifications

### Map Layer (1000-1999)
- `z-[1000]` - Map controls (Total Area Badge, Drawing controls)
- `z-[1001]` - Back to Website button (needs to be above map controls)

### Modal Layer (9000-9999)
- `z-[9999]` - Dialog overlay and content (Request Form Modal)

### Dropdown Layer (10000+)
- `z-[10000]` - Select dropdowns (must be above modals)

## Recommended Z-Index System

### Layer 1: Base Content (0-99)
- `z-0` - Default content
- `z-10` - Sidebar, Navigation, Base overlays
- `z-20` - Interactive handles and controls

### Layer 2: Floating UI (100-999)
- `z-50` - Tooltips, Popovers, Context menus
- `z-100` - Toast notifications
- `z-500` - SearchBar dropdowns (when not in modal)

### Layer 3: Map & Page Controls (1000-8999)
- `z-1000` - Map controls, badges, overlays
- `z-1001` - Page-level buttons (Back button)

### Layer 4: Modals & Dialogs (9000-9999)
- `z-9000` - Modal overlays
- `z-9500` - Modal content

### Layer 5: Critical Dropdowns (10000+)
- `z-10000` - Dropdowns within modals (Select, Combobox)

## Issues Found and Fixed

1. ✅ Dialog z-index: Changed from `z-50` to `z-[9999]`
2. ✅ Select dropdown: Changed from `z-50` to `z-[10000]`
3. ✅ SearchBar dropdown: Currently `z-50` - OK for sidebar use
4. ⚠️ Toast notifications: `z-[100]` - Should be higher to appear above everything

## Recommendations

1. Keep the current system as it's working well
2. Consider increasing Toast z-index to `z-[10001]` to appear above all modals
3. Document this system for future developers
