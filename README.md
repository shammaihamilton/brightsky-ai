# Floating Widget Component

A React + TypeScript floating draggable widget component with Tailwind CSS styling.

## Features

- **Draggable Widget**: Smooth drag and drop functionality with viewport boundary constraints
- **Collapsible Panel**: Click to open/close a panel with actions and chat area
- **Position Persistence**: Widget position is saved to localStorage and restored on page reload
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: Full keyboard navigation support with proper ARIA labels
- **Modern Styling**: Beautiful design with Tailwind CSS and smooth animations

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── FloatingWidget.tsx    # Main widget component
│   ├── WidgetPanel.tsx       # Collapsible panel component
│   └── index.ts              # Component exports
├── hooks/
│   ├── useDrag.ts            # Drag functionality hook
│   └── useLocalStorage.ts    # localStorage persistence hook
├── App.tsx                   # Main application
└── main.tsx                  # Application entry point
```

## Component Usage

```tsx
import { FloatingWidget } from './components';

function App() {
  return (
    <div className="min-h-screen">
      {/* Your app content */}
      <FloatingWidget />
    </div>
  );
}
```

## Customization

### Widget Panel Content
Modify `WidgetPanel.tsx` to customize the panel content:
- Add your own action buttons
- Replace the chat area with your components
- Update styling and layout

### Widget Appearance
Customize the widget button in `FloatingWidget.tsx`:
- Change colors and gradients
- Update the icon
- Modify animations and effects

### Position and Behavior
Adjust drag behavior in `useDrag.ts`:
- Modify boundary constraints
- Change drag sensitivity
- Update position calculations

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Custom Hooks** - Reusable logic

## Browser Support

- Modern browsers supporting ES2015+
- Mobile browsers with touch support
- Keyboard navigation compatible

## License

MIT License
    ...reactDom.configs.recommended.rules,
  },
})
```
