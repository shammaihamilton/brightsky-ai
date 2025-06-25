# Settings Integration Guide

## Overview

The floating chat widget uses **two complementary settings slices** that work together:

### 1. **API Settings** (`settingsSlice.ts`)
- **Purpose**: Chrome extension and AI provider configuration
- **Storage**: Chrome storage (shared between popup and content script)
- **Used by**: Popup settings panel, AI service, authentication

**Contains:**
- `apiKey` - OpenAI, Claude, or Gemini API key
- `provider` - AI provider selection ('openai' | 'claude' | 'gemini')
- `theme` - Extension theme ('light' | 'dark' | 'auto') 
- `maxTokens` - AI response length limit
- `temperature` - AI creativity level
- `isConfigured` - Whether extension is ready to use

### 2. **Chat Settings** (`chatSettingsSlice.ts`)
- **Purpose**: Chat widget appearance, behavior, and accessibility
- **Storage**: localStorage (persists chat UI preferences)
- **Used by**: Chat widget components, styling, UX features

**Contains:**
- `assistantName` - Display name for AI assistant
- `tone` - Conversation tone preference
- `theme` - Chat widget theme (synced from API settings)
- `buttonSize`, `defaultPosition` - Widget appearance
- `notifications` - Sound, email, desktop notification settings
- `accessibility` - High contrast, reduced motion, screen reader options
- `privacy` - History saving, auto-clear preferences

## Integration Features

### Theme Synchronization
- When API theme changes in popup → Chat theme automatically syncs
- Uses Redux middleware for real-time synchronization
- Supports system theme detection for 'auto' mode

### Unified Selectors
- `selectAllSettings` - Combines both settings slices
- `selectEffectiveTheme` - Resolves current theme considering system preferences
- Individual selectors available for specific needs

### Usage Examples

```typescript
// Get API configuration
const { apiKey, provider, isConfigured } = useAppSelector(selectApiSettings);

// Get chat preferences  
const { assistantName, tone, buttonSize } = useAppSelector(selectChatSettingsState);

// Get everything combined
const allSettings = useAppSelector(selectAllSettings);

// Get current effective theme
const currentTheme = useAppSelector(selectEffectiveTheme);
```

## Why Two Slices?

### Separation of Concerns
- **API Settings**: Extension functionality, security-sensitive data
- **Chat Settings**: User experience, visual preferences

### Different Storage Requirements
- **Chrome Storage**: Required for popup ↔ content script communication
- **localStorage**: Simpler for chat widget UI preferences

### Independent Evolution
- API settings change with new providers, features
- Chat settings evolve with UI/UX improvements
- Clean separation prevents conflicts

## Best Practices

1. **Use `selectApiSettings` for AI functionality**
2. **Use chat selectors for UI/styling**
3. **Use `selectAllSettings` when you need both**
4. **Theme changes should go through API settings** (will auto-sync to chat)
5. **Test theme sync between popup and widget**
