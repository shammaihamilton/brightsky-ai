export interface ToolResult<T = unknown> {
  success: boolean;
  data: { results: T };
  error?: string;
}

export abstract class BaseTool {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly aliases: string[];

  abstract canHandle(toolName: string): boolean;
  abstract execute(query: string): Promise<ToolResult>;

  protected createSuccessResult<T>(data: T): ToolResult<T> {
    return {
      success: true,
      data: { results: data },
    };
  }

  protected createErrorResult<T = unknown>(error: string): ToolResult<T> {
    return {
      success: false,
      error,
      data: { results: {} as T },
    };
  }

  protected cleanQuery(query: string, stopWords: string[] = []): string {
    const defaultStopWords = [
      'the',
      'a',
      'an',
      'in',
      'for',
      'at',
      'what',
      'is',
      'whats',
    ];
    const allStopWords = [...defaultStopWords, ...stopWords];

    return query
      .replace(new RegExp(`\\b(${allStopWords.join('|')})\\b`, 'gi'), '')
      .trim()
      .replace(/\s+/g, ' ');
  }
}
