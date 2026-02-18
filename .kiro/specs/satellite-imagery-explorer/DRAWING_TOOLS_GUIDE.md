# Drawing Tools Guide

## How to Use the Drawing Tools

### 🔲 Rectangle Tool

**How it works:**
1. Click the **rectangle icon** in the toolbar (top-right of map)
2. **Click once** on the map to set the first corner
3. **Move your mouse** (don't click yet) - you'll see the rectangle preview
4. **Click again** to set the opposite corner and complete the rectangle

**Important:**
- ✅ **Click-Move-Click** (NOT click-and-drag)
- ✅ The rectangle follows your mouse after the first click
- ✅ You'll see a yellow preview as you move the mouse
- ✅ Click the second time to finish

**Common Mistakes:**
- ❌ Trying to click-and-drag (this doesn't work)
- ❌ Clicking too quickly (give it a moment to register)
- ❌ Not moving the mouse after first click

---

### 🔷 Polygon Tool

**How it works:**
1. Click the **polygon icon** in the toolbar
2. **Click** on the map to place the first vertex
3. **Click** again to place the second vertex
4. **Continue clicking** to add more vertices (3+ vertices required)
5. **Double-click** on the last vertex to complete the polygon
   - OR click on the first vertex to close the shape

**Important:**
- ✅ Minimum 3 vertices required
- ✅ Double-click to finish
- ✅ You'll see a yellow line connecting the vertices
- ✅ The shape fills in when you complete it

**Common Mistakes:**
- ❌ Only clicking 2 points (need at least 3)
- ❌ Forgetting to double-click to finish
- ❌ Trying to drag vertices while drawing (use edit mode for that)

---

### ✏️ Edit Tool

**How it works:**
1. Draw a shape first (rectangle or polygon)
2. Click the **edit icon** (pencil) in the toolbar
3. **Drag the vertices** (corner points) to reshape
4. **Drag the middle points** to add new vertices
5. Click **Save** to apply changes
6. Click **Cancel** to discard changes

**Important:**
- ✅ You can move any vertex by dragging
- ✅ Small white circles appear on the shape edges
- ✅ Drag these to add new vertices
- ✅ The area updates in real-time

---

### 🗑️ Delete Tool

**How it works:**
1. Click the **trash icon** in the toolbar
2. **Click on the shape** you want to delete
3. The shape will be highlighted
4. Click **Delete** to confirm
5. Click **Cancel** to keep the shape

**Important:**
- ✅ Only one shape can exist at a time
- ✅ Drawing a new shape automatically removes the old one
- ✅ Deleting clears the AOI from the sidebar

---

## Visual Guide

### Rectangle Drawing Steps:

```
Step 1: Click rectangle tool
   [🔲] ← Click this

Step 2: Click on map (first corner)
   📍 ← Click here

Step 3: Move mouse (don't click)
   📍 -------- 🖱️
   |          |
   |          |
   ------------ 
   ↑ Rectangle preview appears

Step 4: Click again (opposite corner)
   📍 -------- 📍
   |          |
   |          |
   📍 -------- 📍
   ✅ Rectangle complete!
```

### Polygon Drawing Steps:

```
Step 1: Click polygon tool
   [🔷] ← Click this

Step 2: Click points on map
   📍 ← Click 1
   
   📍 ← Click 2
   
   📍 ← Click 3
   
   📍 ← Double-click to finish

Result:
   📍 -------- 📍
    \        /
     \      /
      \    /
       \  /
        📍
   ✅ Polygon complete!
```

---

## Troubleshooting

### Rectangle not drawing properly?

**Problem:** Rectangle appears as a line or doesn't show
**Solution:** 
1. Make sure you're clicking **twice** (not dragging)
2. Move your mouse between clicks
3. Wait for the preview to appear before second click
4. Try clicking further apart on the map

### Polygon won't close?

**Problem:** Can't finish the polygon
**Solution:**
1. Make sure you have at least 3 points
2. **Double-click** on the last point
3. OR click on the first point to close
4. Look for the tooltip that says "Click to finish"

### Shape disappeared?

**Problem:** Drew a shape but it's gone
**Solution:**
1. Check if you drew another shape (only one allowed)
2. Check the sidebar - it should show the AOI info
3. Try zooming out to see if it's visible
4. Refresh the page and try again

### Can't edit the shape?

**Problem:** Edit mode not working
**Solution:**
1. Make sure you clicked the edit tool (pencil icon)
2. Look for white circles on the shape
3. Click and drag the circles (don't just click)
4. Click "Save" when done

---

## Tips & Tricks

### For Better Accuracy:

1. **Zoom in** before drawing for precise placement
2. **Use the search** to find your location first
3. **Draw larger shapes** for easier editing
4. **Use polygon** for irregular areas
5. **Use rectangle** for square/rectangular areas

### For Faster Drawing:

1. **Rectangle** is faster for square areas
2. **Polygon** gives more control for complex shapes
3. **Edit mode** lets you fine-tune after drawing
4. **Delete and redraw** if you make a mistake

### For Mobile/Touch:

1. **Tap once** for each point (don't hold)
2. **Tap and drag** vertices in edit mode
3. **Pinch to zoom** before drawing
4. **Use rectangle** for easier touch interaction

---

## Current Behavior

### Rectangle Tool:
- ✅ Click-Move-Click interaction
- ✅ Shows preview while moving mouse
- ✅ Yellow outline with 20% fill
- ✅ Area calculated automatically

### Polygon Tool:
- ✅ Click-Click-Click interaction
- ✅ Double-click to finish
- ✅ Minimum 3 vertices
- ✅ Yellow outline with 20% fill

### Edit Tool:
- ✅ Drag vertices to reshape
- ✅ Small white circles (8px)
- ✅ Real-time area updates
- ✅ Save/Cancel options

### Delete Tool:
- ✅ Click shape to select
- ✅ Confirm deletion
- ✅ Clears AOI data

---

## Known Limitations

1. **Only one shape at a time** - Drawing a new shape removes the old one
2. **No undo** - Must delete and redraw if you make a mistake
3. **No circle tool yet** - Coming in Phase 5
4. **No file upload yet** - Coming in Phase 5 (KML/GeoJSON)

---

## Need Help?

If the drawing tools aren't working as expected:

1. **Refresh the page** (Ctrl+F5 or Cmd+Shift+R)
2. **Try a different browser** (Chrome recommended)
3. **Check the browser console** for errors (F12)
4. **Clear browser cache** if tools are unresponsive
5. **Report the issue** with screenshots

---

**Last Updated:** February 17, 2026  
**Version:** 1.0.0
