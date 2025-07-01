# Floating Widget Project – Contributor & Development Instructions

Welcome to the Floating Widget Project! This repository contains a modular, accessible, and extensible React + TypeScript application featuring a draggable floating widget with advanced chat and settings capabilities. Please follow these instructions to ensure code quality, maintainability, and a consistent user experience.

---

## 🏗️ Project Structure

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** CSS Modules (`.module.css`/`.module.scss`) and SCSS, organized by component/feature
- **State Management:** Redux Toolkit (slices, selectors, thunks)
- **Architecture:** Modular, component-driven, SOLID principles

---

## 🧩 Key Components & Architecture

### Floating Widget System

- **`FloatingWidgetOOP`**  
  - Main container for the floating widget (Object-Oriented design).
  - Implements drag-and-drop, position persistence (localStorage), and viewport boundary logic.
  - Uses React Context for configuration and state sharing.
  - Delegates business logic to custom hooks.
  - Manages open/close state, accessibility, and advanced UI features.

- **`WidgetPanel`**  
  - Collapsible panel shown when the widget is expanded.
  - Contains chat, actions, settings, and may include tabs/menus.
  - Handles transitions, focus management, and accessibility.

- **`FloatingButton`**  
  - The entry point for users to open/close the widget.
  - Fully accessible (ARIA, keyboard navigation).
  - Provides visual feedback for interaction states.

- **`ChatPanel`**  
  - Chat interface for user/AI interaction.
  - Manages message display, input, streaming responses, and error handling.
  - Integrates with AI services via custom hooks and service modules.

- **`DropdownMenu`**  
  - Contextual menu for additional actions, tool selection, or quick settings.
  - Easily extendable for new features.

- **`ChatInput`**  
  - Multiline, accessible input for chat messages.
  - Supports keyboard shortcuts and integrates with chat state hooks.

### Custom Hooks

- **`useDrag`**: Handles drag-and-drop logic, ensuring the widget remains within the viewport and updates its position state.
- **`useLocalStorage`**: Provides persistent state management for widget position and user preferences.
- **`useAIChat`**: Manages chat state, message streaming, and AI service integration.

### Context Providers

- **`WidgetContextProvider`**: Supplies widget configuration, state, and actions to all child components, supporting dependency injection and modularity.
- **`Providers`**: Wraps the widget with Redux and other global providers for state management and theming.

### Popup & Settings

- **`PopupApp`, `PopupHeader`, `SettingsPanel`**:  
  - Manage the extension’s settings UI.
  - Allow users to configure API keys, preferences, and advanced options.
  - Integrate with Redux for persistent settings.

### Services

- **`aiService`, `notificationService`**:  
  - Abstract communication with AI providers and user notifications.
  - Keep external API logic separate from UI components.

### Store (Redux)

- **Slices, selectors, thunks** for chat, settings, and privacy.
- Centralize state management and enable advanced features like undo, persistence, and cross-component communication.

---

## 🛠️ Development Guidelines

- **TypeScript:**  
  - Use strict typing for all components, hooks, and context.
  - Define clear interfaces/types for props, state, and context values.

- **Styling:**  
  - Use CSS Modules (`.module.css`/`.module.scss`) for all component styles.
  - Organize SCSS files by component or feature for maintainability.
  - Prefer BEM or similar naming conventions for class names in SCSS.

- **React Best Practices:**  
  - Use functional components and React hooks.
  - Keep components small, focused, and reusable.
  - Avoid prop drilling by using context providers where appropriate.

- **SOLID Principles:**  
  - Ensure each component/hook/service has a single responsibility.
  - Design for extension and maintainability.
  - Use interfaces and dependency injection for flexibility.

- **Accessibility:**  
  - Add ARIA labels to all interactive elements.
  - Ensure full keyboard navigation and focus management.
  - Test with screen readers and on various devices.

- **Responsiveness:**  
  - Use responsive design principles for all components.
  - Test on mobile, tablet, and desktop viewports.

- **State Management:**  
  - Use Redux Toolkit for global state.
  - Use custom hooks for local/component state.

- **Persistence:**  
  - Use `useLocalStorage` or Redux-persist for saving user preferences and widget state.

- **Testing:**  
  - Write unit and integration tests for components, hooks, and services.
  - Use React Testing Library and Jest.

- **Code Quality:**  
  - Use ESLint and Prettier for linting and formatting.
  - Document all public APIs, hooks, and complex logic.

---

## 🚀 Features Implemented

- Draggable floating widget with viewport boundaries
- Position persistence using localStorage
- Responsive design for mobile and desktop
- Accessible keyboard navigation and ARIA support
- Smooth animations and transitions
- Collapsible panel with placeholder and extensible content
- Modular, maintainable, and extensible codebase

---

## 🤝 Contributing

1. Fork the repository and create a new branch for your feature or fix.
2. Follow the development guidelines above.
3. Write clear commit messages and update documentation as needed.
4. Submit a pull request with a description of your changes.

---

For any questions or suggestions, please open an issue or contact the maintainers. Thank you for contributing to the Floating Widget Project!

