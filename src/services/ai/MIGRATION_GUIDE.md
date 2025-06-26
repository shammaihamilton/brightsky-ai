# AI Services Refactoring - Migration Guide

## Overview
The AI services have been refactored to follow SOLID principles with better separation of concerns, extensibility, and maintainability.

## New Architecture

### Directory Structure
```
src/services/ai/
├── index.ts                    # Main exports and convenience functions
├── base/
│   └── BaseAIService.ts       # Abstract base class for all AI services
├── enums/
│   └── AIProvider.ts          # Enums for providers and tones
├── interfaces/
│   ├── IAIService.ts          # Interface that all AI services implement
│   └── types.ts               # Shared types and interfaces
├── providers/
│   ├── OpenAIService.ts       # OpenAI-specific implementation
│   ├── ClaudeService.ts       # Claude-specific implementation
│   └── GeminiService.ts       # Gemini-specific implementation
├── factory/
│   └── AIServiceFactory.ts   # Factory for creating service instances
└── router/
    └── AIServiceRouter.ts     # Central router for delegating requests
```

## Key Benefits

1. **Single Responsibility Principle**: Each AI provider has its own service class
2. **Open/Closed Principle**: Easy to add new providers without modifying existing code
3. **Dependency Inversion**: Router depends on abstractions, not concrete implementations
4. **Better Error Handling**: Provider-specific error handling and validation
5. **Type Safety**: Comprehensive TypeScript interfaces and enums
6. **Caching**: Service instances are cached for better performance

## Migration Instructions

### Before (Old Usage)
```typescript
import { AIService } from "./services/aiService";

const aiService = new AIService({
  provider: "openai",
  apiKey: "your-api-key",
  maxTokens: 1000,
  temperature: 0.7,
  tone: "Friendly"
});

const response = await aiService.sendMessage("Hello", [], onChunk);
```

### After (New Usage)

#### Option 1: Using the Router (Recommended)
```typescript
import { AIServiceRouter, AIProvider, ConversationTone } from "./services/ai";

const router = new AIServiceRouter();

const response = await router.sendMessage(
  {
    provider: AIProvider.OPENAI,
    apiKey: "your-api-key",
    maxTokens: 1000,
    temperature: 0.7,
    tone: ConversationTone.FRIENDLY
  },
  "Hello",
  [],
  onChunk
);
```

#### Option 2: Using Convenience Functions
```typescript
import { sendAIMessage, AIProvider, ConversationTone } from "./services/ai";

const response = await sendAIMessage(
  {
    provider: AIProvider.OPENAI,
    apiKey: "your-api-key",
    maxTokens: 1000,
    temperature: 0.7,
    tone: ConversationTone.FRIENDLY
  },
  "Hello",
  [],
  onChunk
);
```

#### Option 3: Direct Service Usage
```typescript
import { OpenAIService, ConversationTone } from "./services/ai";

const openAIService = new OpenAIService({
  apiKey: "your-api-key",
  maxTokens: 1000,
  temperature: 0.7,
  tone: ConversationTone.FRIENDLY
});

const response = await openAIService.sendMessage("Hello", [], onChunk);
```

## Key Changes

1. **Enums Instead of Strings**: Use `AIProvider.OPENAI` instead of `"openai"`
2. **Type Safety**: All configurations are now strongly typed
3. **Error Handling**: Better error messages with provider-specific information
4. **Validation**: Built-in API key validation for each provider
5. **Caching**: Service instances are automatically cached for performance

## Adding New Providers

To add a new AI provider:

1. Add the provider to the `AIProvider` enum
2. Create a new service class extending `BaseAIService`
3. Update the `AIServiceFactory` to handle the new provider
4. The router will automatically support the new provider

Example:
```typescript
// In enums/AIProvider.ts
export enum AIProvider {
  // ...existing providers
  OLLAMA = "ollama",
}

// Create providers/OllamaService.ts
export class OllamaService extends BaseAIService {
  // Implementation
}

// Update factory/AIServiceFactory.ts
case AIProvider.OLLAMA:
  return new OllamaService(config);
```

## Backward Compatibility

The original `aiService.ts` has been updated to use the new architecture internally while maintaining the same public API, ensuring backward compatibility for existing code.
