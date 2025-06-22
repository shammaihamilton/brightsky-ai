<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Floating Widget Project Instructions

This is a React + TypeScript project featuring a floating draggable widget component with the following characteristics:

## Project Structure
- **React 18** with TypeScript
- **Vite** as the build tool
- **Tailwind CSS** for styling
- Modular component architecture

## Key Components
- `FloatingWidget`: Main draggable widget component
- `WidgetPanel`: Collapsible panel with actions and chat area
- Custom hooks: `useDrag` for drag functionality, `useLocalStorage` for persistence

## Development Guidelines
- Use TypeScript for all components with proper typing
- Follow React hooks best practices
- Use Tailwind CSS classes for styling
- Ensure accessibility with proper ARIA labels and keyboard navigation
- Maintain responsive design principles
- Keep components modular and reusable

## Features Implemented
- Drag and drop functionality with viewport boundaries
- Position persistence using localStorage
- Responsive design for mobile devices
- Accessible keyboard navigation
- Smooth animations and transitions
- Collapsible panel with placeholder content
