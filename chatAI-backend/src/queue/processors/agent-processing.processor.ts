import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { MessageProcessingData } from '../queue.service';
import { AgentService } from '../../agent/agent.service';
import { SessionService } from '../../session/session.service';
import { ChatGateway } from '../../chat/chat.gateway';

@Injectable()
@Processor('agent-processing')
export class AgentProcessingProcessor {
  private readonly logger = new Logger(AgentProcessingProcessor.name);

  constructor(
    private readonly agentService: AgentService,
    private readonly sessionService: SessionService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Process('process-message')
  async processMessage(job: Job<MessageProcessingData>) {
    const { sessionId, messageId, content, metadata } = job.data;

    try {
      this.logger.log(
        `Processing message ${messageId} for session ${sessionId}`,
      );

      // Send thinking status
      await this.chatGateway.sendAgentThinking(sessionId, true);

      // Get session context
      const session = await this.sessionService.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Process with agent
      const agentResponse = await this.agentService.processMessage(
        content,
        session.conversationHistory,
        session.context,
        metadata,
      );

      // Save agent response to session
      const responseMessage = {
        id: `msg_${Date.now()}_response`,
        role: 'assistant' as const,
        content: agentResponse.content,
        timestamp: new Date(),
        metadata: agentResponse.metadata,
      };

      await this.sessionService.addMessage(sessionId, responseMessage);

      // Send response to client
      await this.chatGateway.sendAgentResponse(sessionId, {
        type: 'agent_response',
        content: agentResponse.content,
        metadata: agentResponse.metadata,
      });

      // Update session context if needed
      if (agentResponse.updatedContext) {
        await this.sessionService.updateSession(sessionId, {
          context: { ...session.context, ...agentResponse.updatedContext },
        });
      }

      this.logger.log(`Message ${messageId} processed successfully`);
    } catch (error) {
      this.logger.error(`Error processing message ${messageId}:`, error);

      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';

      // Send error to client
      await this.chatGateway.sendAgentResponse(sessionId, {
        type: 'error',
        content: 'Sorry, I encountered an error processing your message.',
        metadata: { error: errorMessage },
      });

      throw error; // Re-throw to mark job as failed
    } finally {
      // Always stop thinking status
      await this.chatGateway.sendAgentThinking(sessionId, false);
    }
  }
}
