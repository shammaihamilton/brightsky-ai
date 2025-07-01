<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Floating Widget Project – Copilot Instructions

This project uses **React 18** with **TypeScript**, **Vite** as the build tool, and **CSS Modules/SCSS** for styling. Please follow these guidelines for all Copilot suggestions and code generation:

## Project Structure
- React 18 with TypeScript
- Vite as the build tool
- CSS Modules (`.module.css`/`.module.scss`) and SCSS for styling
- Modular component architecture

## Key Components
- `FloatingWidgetOOP`: Main draggable widget container (OOP version), implements SOLID principles, drag-and-drop, position persistence, and advanced UI features using context and hooks.
- `WidgetPanel`: Collapsible panel for main content (chat, actions, settings), manages transitions and accessibility.
- `FloatingButton`: Button to open/close the widget, fully accessible.
- `ChatPanel`: Chat interface, manages messages, input, and AI service integration.
- `DropdownMenu`: Contextual menu for actions or tool selection.
- `ChatInput`: Multiline, accessible input for chat messages.
- Custom hooks: `useDrag`, `useLocalStorage`, `useAIChat` for encapsulating logic.
- Context Providers: `WidgetContextProvider`, `Providers` for state/configuration.
- Popup components: `PopupApp`, `PopupHeader`, `SettingsPanel` for extension settings UI.
- Services: `aiService`, `notificationService` for API and notification logic.
- Store: Redux slices, selectors, thunks for chat, settings, and privacy.

## Development Guidelines
- Use TypeScript with strict typing for all components, hooks, and context.
- Use CSS Modules/SCSS for all component styles; organize by component or feature.
- Prefer BEM or similar naming conventions for SCSS class names.
- Follow React hooks best practices and keep components modular and reusable.
- Apply SOLID principles in all code and architecture decisions.
- Ensure accessibility with ARIA labels and keyboard navigation.
- Maintain responsive design for all components.
- Use Redux Toolkit for global state and custom hooks for local state.
- Use `useLocalStorage` or Redux-persist for persistence.
- Write unit/integration tests for components, hooks, and services.
- Use ESLint and Prettier for code quality and formatting.
- Document all public APIs, hooks, and complex logic.

## Features Implemented
- Draggable floating widget with viewport boundaries
- Position persistence using localStorage
- Responsive design for mobile and desktop
- Accessible keyboard navigation and ARIA support
- Smooth animations and transitions
- Collapsible panel with extensible content
- Modular, maintainable, and extensible codebase

---

For any Copilot suggestions, always prefer CSS Modules/SCSS for styling and follow the above architecture and best practices. Do not suggest Tailwind CSS or other styling frameworks unless explicitly requested.
