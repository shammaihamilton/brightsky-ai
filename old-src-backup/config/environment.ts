import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables immediately when this module is imported
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment variables are loaded above
// Don't load dotenv here to avoid conflicts

export interface AIProviderConfig {
  apiKey: string;
  maxTokens: number;
  temperature: number;
  model?: string;
}

export interface ToolConfig {
  weatherEnabled: boolean;
  databaseEnabled: boolean;
  webSearchEnabled: boolean;
  // Add more tools as needed
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface ServerConfig {
  port: number;
  corsOrigin: string;
  jwtSecret: string;
  nodeEnv: string;
}

class EnvironmentConfig {
  public readonly server: ServerConfig;
  public readonly ai: {
    openai: AIProviderConfig;
    claude: AIProviderConfig;
    gemini: AIProviderConfig;
  };
  public readonly features: ToolConfig;
  public readonly database: DatabaseConfig;

  constructor() {
    this.server = {
      port: parseInt(process.env.PORT || '3001'),
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      nodeEnv: process.env.NODE_ENV || 'development',
    };

    this.ai = {
      openai: {
        apiKey: this.getRequiredEnv('OPENAI_API_KEY'),
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        model: process.env.OPENAI_MODEL || 'gpt-4',
      },
      claude: {
        apiKey: this.getRequiredEnv('CLAUDE_API_KEY'),
        maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7'),
        model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
      },
      gemini: {
        apiKey: this.getRequiredEnv('GEMINI_API_KEY'),
        maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest',
      },
    };

    // Tool configuration - controlled by environment variables
    this.features = {
      weatherEnabled: this.getBooleanEnv('WEATHER_TOOL_ENABLED', true),
      databaseEnabled: this.getBooleanEnv('DATABASE_TOOL_ENABLED', true),
      webSearchEnabled: this.getBooleanEnv('WEB_SEARCH_TOOL_ENABLED', true),
    };

    this.database = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'brightsky',
    };
  }

  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      console.warn(`Warning: Required environment variable ${key} is not set`);
      return 'placeholder-key'; // Allow development without all keys
    }
    return value;
  }

  private getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }
}

export const config = new EnvironmentConfig();
