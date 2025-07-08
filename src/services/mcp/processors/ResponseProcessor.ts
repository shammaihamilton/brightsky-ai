import type { ChatMessage } from "../../ai/interfaces/types";

interface ToolResult<T = unknown> {
  success: boolean;
  data: { results: T };
  error?: string;
}

export interface ResponseProcessor {
  processResult(
    toolResult: ToolResult,
    originalMessage: string,
    history: ChatMessage[]
  ): Promise<string>;
}
