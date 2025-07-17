export interface OpenAIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  capabilities: string[];
  speed: 'fast' | 'medium' | 'slow';
  cost: 'low' | 'medium' | 'high';
  icon: string;
  recommended?: boolean;
}

export const OPENAI_MODELS: OpenAIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model for complex reasoning and analysis',
    maxTokens: 8192,
    capabilities: ['Advanced Reasoning', 'Code Generation', 'Creative Writing', 'Analysis'],
    speed: 'slow',
    cost: 'high',
    icon: '🧠',
    recommended: true
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Latest GPT-4 model with improved performance',
    maxTokens: 128000,
    capabilities: ['Long Context', 'Fast Processing', 'Code', 'Analysis'],
    speed: 'medium',
    cost: 'high',
    icon: '🚀'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most conversational tasks',
    maxTokens: 16384,
    capabilities: ['Chat', 'Q&A', 'Summarization', 'Translation'],
    speed: 'fast',
    cost: 'low',
    icon: '⚡'
  },
  {
    id: 'gpt-3.5-turbo-16k',
    name: 'GPT-3.5 Turbo 16K',
    description: 'Extended context version of GPT-3.5 Turbo',
    maxTokens: 16384,
    capabilities: ['Long Text', 'Document Analysis', 'Chat', 'Summarization'],
    speed: 'fast',
    cost: 'medium',
    icon: '📚'
  }
];

export const getModelById = (id: string): OpenAIModel | undefined => {
  return OPENAI_MODELS.find(model => model.id === id);
};

export const getRecommendedModel = (): OpenAIModel => {
  return OPENAI_MODELS.find(model => model.recommended) || OPENAI_MODELS[0];
};
