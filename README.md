# Floating Widget Chrome Extension

A React + TypeScript Chrome Extension that injects a floating draggable widget into every webpage using Manifest V3.

## Features

- 🎯 **Floating Widget**: Appears on every webpage as a draggable circular button
- 🖱️ **Drag & Drop**: Smooth dragging functionality with viewport boundary constraints
- 📱 **Responsive Design**: Works on desktop and mobile browsers
- 💾 **Position Persistence**: Remembers widget position using localStorage
- 🎨 **Clean UI**: Modern design with inline styles (no Tailwind conflicts)
- ⚡ **Performance**: Lightweight and fast using React 18 and Vite
- 🔒 **Manifest V3**: Uses the latest Chrome Extension standards

## Project Structure

```
chrome extansion/
├── extension/
│   ├── dist/                     # Built extension files
│   │   ├── content.js            # Bundled React content script
│   │   ├── content.css           # Widget styles
│   │   ├── manifest.json         # Extension manifest
│   │   └── popup.html            # Extension popup
│   ├── src/
│   │   ├── components/
│   │   │   ├── FloatingWidget.tsx    # Main widget component
│   │   │   └── WidgetPanel.tsx       # Collapsible panel
│   │   ├── hooks/
│   │   │   ├── useDrag.ts            # Drag functionality
│   │   │   └── useLocalStorage.ts    # localStorage persistence
│   │   └── content/
│   │       ├── index.tsx             # Content script entry point
│   │       └── content.css           # Reset styles
│   ├── manifest.json             # Extension manifest
│   └── popup.html               # Extension popup
├── src/                         # Development React app
├── vite.config.extension.ts     # Vite config for extension build
└── package.json
```

## Installation

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the extension:**
   ```bash
   npm run build:extension
   ```

### Load Extension in Chrome

1. **Open Chrome and navigate to:**
   ```
   chrome://extensions/
   ```

2. **Enable Developer mode** (toggle in the top right)

3. **Click "Load unpacked"** and select the `extension/dist` folder

4. **The extension is now installed!** Visit any website to see the floating widget.

### Development Workflow

- **Build extension:** `npm run build:extension`
- **Watch mode:** `npm run dev:extension` (rebuilds on file changes)
- **Regular React app:** `npm run dev` (for testing components)

## Extension Components

### Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "Floating Widget Extension",
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": ["<all_urls>"],
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "css": ["content.css"],
    "run_at": "document_end"
  }],
  "web_accessible_resources": [{
    "resources": ["content.js", "content.css", "assets/*"],
    "matches": ["<all_urls>"]
  }]
}
```

### Content Script Injection

The extension automatically:
1. Creates a root div with ID `chrome-extension-floating-widget-root`
2. Injects React component using `createRoot()`
3. Applies reset styles to prevent page interference
4. Uses maximum z-index (2147483647) to stay on top

### Widget Features

- **Drag & Drop**: Click and drag to move anywhere on the page
- **Panel Toggle**: Click to open/close the action panel
- **Position Memory**: Remembers position across page refreshes
- **Boundary Constraints**: Stays within viewport bounds
- **Responsive**: Adapts to window resizing

## Technical Details

### Build Process

- **Vite**: Bundles React app into single `content.js` file
- **TypeScript**: Full type safety throughout
- **IIFE Format**: Ensures proper isolation in content script environment
- **Inline Styles**: Prevents conflicts with page styles

### Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ✅ Opera (Chromium-based)
- ❌ Firefox (uses different extension system)

### Performance

- **Small Bundle**: ~574KB gzipped (~99KB)
- **No External Dependencies**: Self-contained
- **Minimal DOM Impact**: Single root element injection
- **Event Cleanup**: Proper event listener management

## Customization

### Styling
Edit `extension/src/components/FloatingWidget.tsx` to modify:
- Widget appearance
- Colors and gradients
- Animations
- Icon design

### Panel Content
Edit `extension/src/components/WidgetPanel.tsx` to customize:
- Action buttons
- Chat interface
- Panel layout
- Content sections

### Permissions
Modify `extension/manifest.json` to adjust:
- Host permissions
- API access
- Content script injection rules

## Deployment

1. **Build for production:**
   ```bash
   npm run build:extension
   ```

2. **Zip the dist folder:**
   ```bash
   cd extension/dist
   zip -r floating-widget-extension.zip .
   ```

3. **Upload to Chrome Web Store** or distribute the zip file

## Troubleshooting

### Widget Not Appearing
- Check browser console for errors
- Verify extension is enabled
- Try reloading the page
- Check if CSP (Content Security Policy) blocks the extension

### Styling Issues
- Extension uses inline styles to avoid conflicts
- Check for `!important` CSS rules on the page
- Verify z-index is sufficient (extension uses max value)

### Performance Issues
- Widget uses efficient React patterns
- Position updates are throttled during drag
- localStorage operations are minimal

## Development Notes

- Uses React 18 with createRoot API
- TypeScript for type safety
- Vite for fast builds
- ESLint for code quality
- Manifest V3 compliance
- No external CSS dependencies

## License

MIT License - Feel free to use and modify for your projects!
