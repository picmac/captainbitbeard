# 🏴‍☠️ PWA Icon Generation

## Overview

This project includes a script (`generate-icons.mjs`) to automatically generate PWA (Progressive Web App) icons with the Captain Bitbeard theme.

## Quick Start

```bash
# Generate all required PWA icons
node generate-icons.mjs
```

## Generated Icons

The script creates four icon files in the `public/` directory:

| File | Size | Purpose |
|------|------|---------|
| `pwa-192x192.png` | 192x192 | PWA icon (standard) |
| `pwa-512x512.png` | 512x512 | PWA icon (high-res) |
| `apple-touch-icon.png` | 180x180 | iOS/macOS home screen |
| `favicon.png` | 32x32 | Browser favicon |

## Icon Design

The generated icons feature:
- **Background**: Ocean dark blue (`#191970`)
- **Border**: Pirate gold ring (`#FFD700`)
- **Symbol**: White cross (`#F5F5DC`) representing a simplified skull and crossbones

## Customization

### Modifying Colors

Edit the color constants in `generate-icons.mjs`:

```javascript
const OCEAN_DARK = hexToRgb('#191970');  // Background color
const PIRATE_GOLD = hexToRgb('#FFD700'); // Border color
const SKULL_WHITE = hexToRgb('#F5F5DC'); // Symbol color
```

### Changing the Design

The icon design is created programmatically using the `pngjs` library. Key design elements:

- **Circular border**: Gold ring at 40-45% of icon radius
- **Inner circle**: Dark blue background
- **Symbol**: White cross pattern in the center

To modify the design, edit the `createIcon()` function in `generate-icons.mjs`.

### Using Custom Icons

If you want to use custom-designed icons instead:

1. Create your icons with the required sizes (192x192, 512x512, 180x180, 32x32)
2. Save them as PNG files in the `public/` directory
3. Name them according to the table above
4. Rebuild the frontend: `npm run build`

## Technical Details

### Dependencies

The script uses:
- **pngjs**: Pure JavaScript PNG encoder/decoder (no native dependencies)
- **Node.js built-ins**: `fs`, `path`

Install dependencies:
```bash
npm install pngjs
```

### How It Works

1. Creates a blank PNG image using `pngjs`
2. Iterates over each pixel
3. Calculates pixel distance from center
4. Applies colors based on design rules (border, inner circle, symbol)
5. Writes the PNG file to disk

### Integration with Vite PWA

The icons are automatically included in the PWA build process:

1. **Build time**: Icons from `public/` are copied to `dist/`
2. **Service worker**: Icons are precached for offline use
3. **Manifest**: References to icons are included in `manifest.webmanifest`

See `vite.config.ts` for PWA configuration.

## Troubleshooting

### Icons not appearing in PWA

1. Verify icons exist in `public/` directory:
   ```bash
   ls -lah public/*.png
   ```

2. Rebuild the frontend:
   ```bash
   npm run build
   ```

3. Check icons were copied to `dist/`:
   ```bash
   ls -lah dist/*.png
   ```

4. Verify manifest references correct paths:
   ```bash
   cat dist/manifest.webmanifest
   ```

### Script fails to run

**Error: Cannot find module 'pngjs'**
- Solution: `npm install pngjs`

**Error: Permission denied**
- Solution: `chmod +x generate-icons.mjs` or run with `node generate-icons.mjs`

## Production Recommendations

For production deployments, consider:

1. **Professional design**: Hire a designer or use tools like Figma to create custom pirate-themed icons
2. **Multiple formats**: Create .ico file for better browser compatibility
3. **Maskable icons**: Design icons that work with Android's adaptive icons
4. **Brand consistency**: Ensure icons match your overall branding

## Resources

- [PWA Icon Guidelines](https://web.dev/add-manifest/)
- [Android Adaptive Icons](https://web.dev/maskable-icon/)
- [Favicon Generator](https://realfavicongenerator.net/)
- [pngjs Documentation](https://github.com/lukeapage/pngjs)

## License

Same as the main project.

---

**Generated Icons Preview:**

```
┌─────────────────┐
│                 │
│   ╔═══════╗    │  Ocean Dark (#191970)
│   ║       ║    │  Gold Border (#FFD700)
│   ║   ╬   ║    │  White Cross (#F5F5DC)
│   ║       ║    │
│   ╚═══════╝    │
│                 │
└─────────────────┘
```

🏴‍☠️ Ready to set sail with your PWA!
