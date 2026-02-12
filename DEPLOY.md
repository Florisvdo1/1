# OEVER.ART Website Upgrade - Deployment Guide

## Overview
This upgrade includes:
- ✅ Real artwork thumbnails for all product cards (fetched from Werk aan de Muur)
- ✅ 5 navigable process sections with anchors (Inquiry, Consultancy, Creation, Review, Delivery)
- ✅ Working inquiry modal form with mailto + localStorage fallback
- ✅ Footer with embedded Google Maps
- ✅ Lazy loading for all images
- ✅ Responsive design improvements

## Project Structure
```
oever-art-upgrade/
├── index.html                 # Main HTML file with all upgrades
├── css/
│   └── oever-upgrade.css      # Additional styles for new components
├── js/
│   ├── thumbnails.js          # Thumbnail manager (embedded in HTML)
│   ├── inquiry-modal.js       # Modal form handler (embedded in HTML)
│   └── scroll-anchors.js      # Smooth scroll for anchor links (embedded in HTML)
├── scripts/
│   └── resolve-thumbnails.js  # Build script to fetch thumbnails from WADM
├── data/
│   └── thumbnails.json        # Cache of resolved thumbnail URLs
└── DEPLOY.md                  # This file
```

## Build Information

### Stack
- **Type**: Static HTML/CSS/JS website
- **No build step required** for basic deployment
- **Optional**: Run `node scripts/resolve-thumbnails.js` to refresh thumbnail cache

### Build Command
```bash
# No build command needed for static deployment
# Or if you want to refresh thumbnails:
node scripts/resolve-thumbnails.js
```

### Publish Directory
```
/
```
(Root directory containing index.html)

## Deployment Steps

### Option 1: Direct Netlify Deploy (Recommended)

1. **Login to Netlify**: https://app.netlify.com

2. **Add New Site** → **Deploy manually**

3. **Drag and drop** the entire `oever-art-upgrade` folder

4. **Configure custom domain**:
   - Go to Site settings → Domain management
   - Add custom domain: `oever-art.com`
   - Configure DNS as instructed by Netlify

### Option 2: GitHub + Netlify Continuous Deployment

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "OEVER.ART website upgrade"
   git remote add origin https://github.com/FLORISVDO1/1.git
   git push -u origin main
   ```

2. **Configure Netlify**:
   - Login to https://app.netlify.com
   - "Add new site" → "Import an existing project"
   - Select GitHub → Authorize → Select `FLORISVDO1/1` repository
   - Branch: `main`
   - Build command: *(leave blank - static site)*
   - Publish directory: `/`
   - Click "Deploy site"

3. **Configure custom domain**:
   - Site settings → Domain management
   - Add custom domain: `oever-art.com`
   - Netlify will provide DNS records:
     ```
     oever-art.com.  A     75.2.60.5
     oever-art.com.  A     99.83.231.61
     www.oever-art.com.  CNAME  [your-site].netlify.app
     ```
   - Update DNS at your registrar

### Option 3: Manual DNS Configuration

If Netlify shows DNS records, use these generic steps:

1. **Login to your domain registrar** (where oever-art.com is managed)

2. **Add A records**:
   - Host: `@` (root)
   - Points to: `75.2.60.5`
   - Host: `@` (root)
   - Points to: `99.83.231.61`

3. **Add CNAME record**:
   - Host: `www`
   - Points to: `[your-site].netlify.app`

4. **Wait for DNS propagation** (5 minutes to 48 hours)

## Environment Variables

Optional environment variable for thumbnail refresh:

```bash
REFRESH_THUMBNAILS=true  # Set to force re-fetch all thumbnails
```

## QA Checklist

Before deploying, verify:

- [ ] All 12 product cards display real artwork thumbnails (not placeholder letters)
- [ ] Product cards link correctly to Werk aan de Muur
- [ ] Category filter buttons work (All, Flowers, Portrait, etc.)
- [ ] Clicking "Commission a Portrait" opens inquiry modal
- [ ] Inquiry modal has all fields: Name, Email, Type, Budget, Message
- [ ] Form submission opens mailto with correct subject/body
- [ ] All 5 process sections have working anchors (#inquiry, #consultancy, etc.)
- [ ] Clicking process steps scrolls to correct section
- [ ] Footer map displays Haarlem location
- [ ] "Open in Google Maps" link works
- [ ] Site is responsive on mobile devices
- [ ] No console errors

## Thumbnail Refresh

To update thumbnails (if artwork changes on WADM):

```bash
cd scripts
node resolve-thumbnails.js
```

This will:
1. Fetch each product page from Werk aan de Muur
2. Extract the best available image (og:image, twitter:image, etc.)
3. Update `data/thumbnails.json`
4. Only fetch missing/new URLs (unless `REFRESH_THUMBNAILS=true`)

## Fallback Behavior

If thumbnail fetching fails:
- Product cards will still display and link correctly
- The original placeholder styling is preserved
- No broken images will show

## Support

For issues or questions:
- Email: floris@oever.art
- Instagram: @oever.art

---

**Deployed**: 2026-02-12
**Version**: 2.0.0
