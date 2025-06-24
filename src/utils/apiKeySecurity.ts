// Utility for API key encryption/obfuscation
export class ApiKeySecurity {
  private static readonly OBFUSCATION_PREFIX = 'obs_';
  private static readonly SALT = 'bright-sky-salt-2025';

  // Enhanced obfuscation with salt
  static obfuscate(apiKey: string): string {
    if (!apiKey || apiKey.startsWith(this.OBFUSCATION_PREFIX)) {
      return apiKey; // Already obfuscated or empty
    }

    try {
      // Step 1: Add salt and reverse
      const salted = apiKey + this.SALT;
      const reversed = salted.split('').reverse().join('');
      
      // Step 2: Base64 encode
      const encoded = btoa(reversed);
      
      // Step 3: Add prefix to identify obfuscated keys
      return this.OBFUSCATION_PREFIX + encoded;
    } catch (error) {
      console.warn('Failed to obfuscate API key:', error);
      return apiKey; // Return original if obfuscation fails
    }
  }

  static deobfuscate(obfuscatedKey: string): string {
    if (!obfuscatedKey || !obfuscatedKey.startsWith(this.OBFUSCATION_PREFIX)) {
      return obfuscatedKey; // Not obfuscated or empty
    }

    try {
      // Step 1: Remove prefix
      const withoutPrefix = obfuscatedKey.substring(this.OBFUSCATION_PREFIX.length);
      
      // Step 2: Base64 decode
      const decoded = atob(withoutPrefix);
      
      // Step 3: Reverse and remove salt
      const unreversed = decoded.split('').reverse().join('');
      const original = unreversed.substring(0, unreversed.length - this.SALT.length);
      
      return original;
    } catch (error) {
      console.warn('Failed to deobfuscate API key:', error);
      return obfuscatedKey; // Return as-is if deobfuscation fails
    }
  }

  // Validate if a key looks like a valid API key format
  static validateKeyFormat(apiKey: string, provider: 'openai' | 'claude' | 'gemini'): boolean {
    if (!apiKey) return false;

    switch (provider) {
      case 'openai':
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      case 'claude':
        return apiKey.startsWith('sk-ant-') && apiKey.length > 30;
      case 'gemini':
        return apiKey.length > 20 && !apiKey.includes(' ');
      default:
        return apiKey.length > 10;
    }
  }

  // Check if key is obfuscated
  static isObfuscated(key: string): boolean {
    return key?.startsWith(this.OBFUSCATION_PREFIX) || false;
  }
}
