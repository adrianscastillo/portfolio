# Adobe Fonts Setup Guide

## ✅ Changes Made

The website has been updated to use Adobe Fonts (Typekit) for the Guyot font families instead of self-hosting. Here's what was changed:

### Files Updated:
1. **styles.css** - Removed all `@font-face` declarations for Guyot fonts (kept Nautica self-hosted)
2. **index.html** - Added Adobe Fonts embed code
3. **work.html** - Added Adobe Fonts embed code
4. **about.html** - Added Adobe Fonts embed code
5. **musings.html** - Added Adobe Fonts embed code
6. **sw.js** - Removed Guyot font from service worker cache
7. **public/sw.js** - Removed Guyot font from service worker cache

## 🔧 Next Steps

### 1. Get Your Adobe Fonts Project ID

1. Go to [Adobe Fonts](https://fonts.adobe.com/)
2. Sign in with your Adobe Creative Cloud account
3. Navigate to **My Fonts** → **Web Projects**
4. Create a new web project or select an existing one
5. Add the following Guyot fonts to your project:
   - **Guyot Press** (Regular, Regular Italic)
   - **Guyot Headline** (Regular, Regular Italic, Bold, Light)
6. Copy your **Project ID** from the embed code

### 2. Update HTML Files

Replace `YOUR_PROJECT_ID` in all HTML files with your actual Adobe Fonts project ID:

**Files to update:**
- `index.html`
- `work.html`
- `about.html`
- `musings.html`

**Find this line:**
```html
<link rel="stylesheet" href="https://use.typekit.net/YOUR_PROJECT_ID.css">
```

**Replace with:**
```html
<link rel="stylesheet" href="https://use.typekit.net/abc123xyz.css">
```
(Replace `abc123xyz` with your actual project ID)

### 3. Verify Font Names

The font family names in your CSS should match exactly what Adobe Fonts provides. The current CSS uses:
- `'Guyot Press'` for body text
- `'Guyot Headline'` for headlines

If Adobe Fonts uses different names, you may need to update the CSS variables in `styles.css`:
- `--font-primary`
- `--font-headline`

### 4. Test the Setup

1. Start your dev server: `npm run dev`
2. Check the browser console for any font loading errors
3. Verify fonts are loading correctly using browser DevTools → Network tab
4. Test on different pages to ensure fonts load everywhere

## 📝 Notes

- **Nautica font** is still self-hosted (not changed)
- The font family names (`'Guyot Press'` and `'Guyot Headline'`) should remain the same in your CSS
- Adobe Fonts will handle all font loading, optimization, and CDN delivery
- No need to remove the Guyot font files from `/assets/fonts/` - they're just not being used anymore

## 🔍 Troubleshooting

**Fonts not loading?**
- Verify your project ID is correct
- Check that the fonts are published in your Adobe Fonts project
- Ensure your domain is added to the allowed domains in Adobe Fonts project settings
- Check browser console for CORS or loading errors

**Font names don't match?**
- Check the exact font family names in your Adobe Fonts project
- Update CSS variables in `styles.css` if needed

## 📚 Resources

- [Adobe Fonts Documentation](https://fonts.adobe.com/help)
- [Adobe Fonts Web Projects](https://fonts.adobe.com/my_fonts/web_projects)

