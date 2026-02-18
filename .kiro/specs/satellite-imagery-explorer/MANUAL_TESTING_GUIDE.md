# Manual Testing Guide: Satellite Imagery Explorer

**Development Server:** ✅ RUNNING  
**URL:** http://localhost:8081/explore  
**Date:** February 17, 2026

---

## 🚀 Quick Start

1. **Open your browser** and navigate to: http://localhost:8081/explore
2. **Follow the test scenarios** below in order
3. **Check off each test** as you complete it
4. **Report any issues** you find

---

## 📋 Test Scenarios

### Scenario 1: Draw a Polygon (2 minutes)

**Steps:**
1. Look for the drawing toolbar on the **top-right** of the map
2. Click the **polygon tool** (looks like a pentagon icon)
3. Click **4-5 points** on the map to create a polygon
4. **Double-click** to finish drawing

**Expected Results:**
- [ ] Polygon appears with **yellow color** (#EAB308)
- [ ] Polygon has **30% transparency**
- [ ] **Area label** appears at the center showing km²
- [ ] **Sidebar** updates with:
  - Type: "polygon"
  - Area: X.XX km²
  - Center coordinates
- [ ] **"Total Search Area"** badge appears at top of map
- [ ] **"Submit Request"** button becomes enabled

**If it fails:** Take a screenshot and note what went wrong

---

### Scenario 2: Edit the Polygon (1 minute)

**Steps:**
1. Click the **edit tool** in the toolbar (pencil icon)
2. **Drag a vertex** of your polygon to a new location
3. Click **Save** when done

**Expected Results:**
- [ ] Vertex moves smoothly as you drag
- [ ] **Area updates** in real-time
- [ ] **Area label** repositions to new center
- [ ] **Sidebar info** updates with new area and center

**If it fails:** Note which part didn't update

---

### Scenario 3: Delete and Draw Rectangle (1 minute)

**Steps:**
1. Click the **delete tool** (trash icon)
2. Click your polygon to select it
3. Click **Delete** to confirm
4. Click the **rectangle tool**
5. **Click and drag** to create a rectangle

**Expected Results:**
- [ ] Polygon is removed completely
- [ ] Area label disappears
- [ ] Sidebar shows "No area selected"
- [ ] Rectangle draws with same yellow styling
- [ ] New area calculation appears

**If it fails:** Check if old polygon was fully removed

---

### Scenario 4: Search for a Location (1 minute)

**Steps:**
1. Look at the **sidebar** on the left
2. Find the **"SEARCH LOCATION"** section
3. Type **"New York"** in the search bar
4. Wait for results to appear (should be ~300ms)
5. **Click** on the first result

**Expected Results:**
- [ ] Dropdown appears with search results
- [ ] Results show location name and coordinates
- [ ] Map **centers on New York** smoothly
- [ ] Map **zooms** to appropriate level
- [ ] Search input **clears** after selection

**If it fails:** Check browser console for errors

---

### Scenario 5: Test Keyboard Navigation (1 minute)

**Steps:**
1. Type **"London"** in the search bar
2. Press **Arrow Down** key twice
3. Press **Enter** to select
4. Type **"Paris"** in search bar
5. Press **Escape** to close dropdown

**Expected Results:**
- [ ] Arrow keys highlight different results
- [ ] Highlighted result has different background
- [ ] Enter selects the highlighted result
- [ ] Map centers on selected location
- [ ] Escape closes the dropdown

**If it fails:** Note which key doesn't work

---

### Scenario 6: Submit a Request (3 minutes)

**Steps:**
1. Make sure you have an **AOI drawn** on the map
2. Click the **"Submit Request"** button in sidebar
3. Fill out the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Company: "Test Company" (optional)
   - Urgency: "Standard"
   - Additional Requirements: "This is a test"
4. Click **"Submit Request"**

**Expected Results:**
- [ ] Form opens in a modal/dialog
- [ ] **AOI summary** is displayed at top showing:
  - Type (polygon/rectangle)
  - Area in km²
  - Center coordinates
  - Bounding box
- [ ] All form fields are present
- [ ] **Loading state** appears during submission
- [ ] **Success message** appears with request ID
- [ ] Form **closes after 2 seconds**
- [ ] **Toast notification** appears

**If it fails:** Check browser console and network tab

---

### Scenario 7: Test Form Validation (2 minutes)

**Steps:**
1. Draw an AOI and click "Submit Request"
2. Try to submit with **empty name** - click Submit
3. Enter name but use **invalid email** "notanemail" - click Submit
4. Fix email to "test@example.com"
5. Leave urgency unselected - click Submit
6. Select urgency and submit

**Expected Results:**
- [ ] **Error message** appears for empty name
- [ ] **Error message** appears for invalid email
- [ ] **Error message** appears for missing urgency
- [ ] Form **won't submit** with errors
- [ ] Error messages are **clear and helpful**
- [ ] Form **submits successfully** when all valid

**If it fails:** Note which validation didn't work

---

### Scenario 8: Test Responsive Design - Mobile (3 minutes)

**Steps:**
1. Open **Chrome DevTools** (F12)
2. Click **Toggle Device Toolbar** (Ctrl+Shift+M)
3. Select **iPhone SE** or set to **375x667**
4. Refresh the page

**Expected Results:**
- [ ] **Sidebar appears at top** (not side)
- [ ] Sidebar has **limited height** (~40% of screen)
- [ ] **Map appears below** sidebar
- [ ] Map has **adequate height** (~60% of screen)
- [ ] **Drawing tools** are accessible
- [ ] **Search bar** is usable
- [ ] **Submit button** is visible
- [ ] **No horizontal scrolling**
- [ ] Text is **readable** (not too small)

**If it fails:** Note what's cut off or unusable

---

### Scenario 9: Test Responsive Design - Tablet (2 minutes)

**Steps:**
1. In DevTools, select **iPad Mini** or set to **768x1024**
2. Refresh the page
3. Try drawing a polygon with mouse (simulating touch)

**Expected Results:**
- [ ] **Sidebar is on the left** (horizontal layout)
- [ ] Sidebar width is **appropriate** (~320px)
- [ ] **Map fills** remaining space
- [ ] **Drawing tools** are larger (touch-friendly)
- [ ] All features are **accessible**
- [ ] Layout looks **balanced**

**If it fails:** Note layout issues

---

### Scenario 10: Test Touch Interactions (if you have a touch device)

**Steps:**
1. Open http://localhost:8081/explore on your **phone or tablet**
2. Try to **draw a polygon** with your finger
3. Try to **edit** the polygon by dragging vertices
4. Try to **pan and zoom** the map

**Expected Results:**
- [ ] **Touch targets** are easy to tap (not too small)
- [ ] **Drawing** works smoothly with touch
- [ ] **Editing vertices** is possible with touch
- [ ] **Pan and zoom** gestures work
- [ ] **No accidental** interactions
- [ ] **Keyboard doesn't** obscure content when typing

**If it fails:** Note what's difficult to use

---

## 🐛 Bug Reporting Template

If you find any issues, use this template:

```
**Bug Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshot:** [Attach if possible]

**Browser:** Chrome / Firefox / Safari / Edge
**Device:** Desktop / Tablet / Mobile
**Screen Size:** [e.g., 1920x1080]

**Console Errors:** [Copy any errors from browser console]
```

---

## ✅ Test Completion Checklist

After completing all scenarios, verify:

- [ ] All 10 scenarios completed
- [ ] No critical bugs found
- [ ] Responsive design works on all sizes
- [ ] Form validation works correctly
- [ ] Search functionality works
- [ ] Drawing tools work smoothly
- [ ] Request submission succeeds
- [ ] Email notifications received (check inbox)

---

## 📊 Test Results Summary

**Total Tests:** 10  
**Passed:** ___  
**Failed:** ___  
**Bugs Found:** ___

**Overall Status:** ⬜ PASS / ⬜ FAIL

**Notes:**
[Add any additional observations or comments]

---

## 🔧 Troubleshooting

### Development Server Not Running
```bash
# Stop any existing process
# Then start fresh:
npm run dev
```

### Port Already in Use
The server will automatically try another port (8081, 8082, etc.)

### Browser Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Copy and report them

### Map Not Loading
- Check internet connection (map tiles need to load)
- Check browser console for errors
- Try refreshing the page

### Search Not Working
- Check if backend server is running
- Verify API endpoint in browser console
- Check network tab for failed requests

---

## 📝 Next Steps After Testing

1. **Document all bugs** found using the template above
2. **Create GitHub issues** for each bug (if using GitHub)
3. **Prioritize fixes** (Critical → High → Medium → Low)
4. **Retest after fixes** to verify resolution
5. **Sign off** when all critical bugs are fixed

---

## 🎯 Success Criteria

The testing is considered successful when:
- ✅ All 10 scenarios pass
- ✅ No critical bugs found
- ✅ Responsive design works on all target devices
- ✅ Form validation prevents invalid submissions
- ✅ Email notifications are received
- ✅ User experience is smooth and intuitive

---

**Happy Testing! 🚀**

If you encounter any issues, stop and document them before continuing.
