/**
 * Supported AI providers
 */
// export const AIProvider = {
//   OPENAI: "openai",
//   CLAUDE: "claude",
//   GEMINI: "gemini",
// } as const;

export enum AIProvider {
  OPENAI = "openai",
  CLAUDE = "claude",
  GEMINI = "gemini",
}

export type AIProviderList = typeof AIProvider[keyof typeof AIProvider];

/**
 * Conversation tones
 */
export const ConversationTone = {
  PROFESSIONAL: "Professional",
  FRIENDLY: "Friendly",
  CASUAL: "Casual",
  CREATIVE: "Creative",
  ANALYTICAL: "Analytical",
} as const;

export type ConversationTone = typeof ConversationTone[keyof typeof ConversationTone];

/**
 * Type guard to check if a string is a valid AI provider
 */
export function isValidAIProvider(provider: string): provider is AIProvider {
  return Object.values(AIProvider).includes(provider as AIProvider);
}

/**
 * Type guard to check if a string is a valid conversation tone
 */
export function isValidConversationTone(tone: string): tone is ConversationTone {
  return Object.values(ConversationTone).includes(tone as ConversationTone);
}
