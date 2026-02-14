# PWA Icons Guide

This directory contains SVG source files for PWA icons. For best compatibility, these should be converted to PNG format.

## Current Icons

- `pwa-192x192.svg` - 192x192 icon source
- `pwa-512x512.svg` - 512x512 icon source
- `apple-touch-icon.svg` - Apple touch icon source

## Converting SVG to PNG

You have several options to convert SVG to PNG:

### Option 1: Using Online Tools
1. Visit [CloudConvert](https://cloudconvert.com/svg-to-png) or similar
2. Upload each SVG file
3. Set dimensions:
   - `pwa-192x192.svg` → 192x192 pixels
   - `pwa-512x512.svg` → 512x512 pixels
   - `apple-touch-icon.svg` → 180x180 pixels
4. Download and save as:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `apple-touch-icon.png`

### Option 2: Using ImageMagick (Command Line)
```bash
# Convert 192x192 icon
magick convert -background none -resize 192x192 pwa-192x192.svg pwa-192x192.png

# Convert 512x512 icon
magick convert -background none -resize 512x512 pwa-512x512.svg pwa-512x512.png

# Convert apple touch icon
magick convert -background none -resize 180x180 apple-touch-icon.svg apple-touch-icon.png
```

### Option 3: Using Inkscape
```bash
# 192x192
inkscape pwa-192x192.svg --export-type=png --export-width=192 --export-height=192 --export-filename=pwa-192x192.png

# 512x512
inkscape pwa-512x512.svg --export-type=png --export-width=512 --export-height=512 --export-filename=pwa-512x512.png

# Apple touch icon
inkscape apple-touch-icon.svg --export-type=png --export-width=180 --export-height=180 --export-filename=apple-touch-icon.png
```

## Favicon

For the favicon, you can use an online tool to convert `pwa-192x192.png` to `favicon.ico`:
- Visit [favicon.io](https://favicon.io/favicon-converter/)
- Upload `pwa-192x192.png`
- Download the generated `favicon.ico`

## Notes

- The SVG files use QalamFlow brand colors (#6366f1 primary, #f59e0b secondary)
- Icons feature a pen (qalam) and book design
- All icons have rounded corners for modern appearance
- Icons are designed to work on both light and dark backgrounds
