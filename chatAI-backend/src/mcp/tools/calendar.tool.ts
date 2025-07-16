import { Injectable, Logger } from '@nestjs/common';
import { BaseTool } from './base/base.tool';
import { ParameterDefinition } from '../interfaces/tool.interface';

export interface CalendarParams {
  startDate: string;
  endDate: string;
  maxResults?: number;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  location?: string;
  description?: string;
  attendees?: string[];
}

export interface CalendarResult {
  events: CalendarEvent[];
  totalCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

@Injectable()
export class CalendarTool extends BaseTool {
  private readonly logger = new Logger(CalendarTool.name);

  readonly name = 'calendar';
  readonly description = 'Get calendar events for a date range';
  readonly parameters: Record<string, ParameterDefinition> = {
    startDate: {
      type: 'string',
      description: 'Start date in ISO format (YYYY-MM-DDTHH:MM:SSZ)',
      format: 'date-time',
      required: true,
    },
    endDate: {
      type: 'string',
      description: 'End date in ISO format (YYYY-MM-DDTHH:MM:SSZ)',
      format: 'date-time',
      required: true,
    },
    maxResults: {
      type: 'number',
      description: 'Maximum number of events to return (default: 10)',
      required: false,
    },
  };
  async execute(params: Record<string, unknown>): Promise<CalendarResult> {
    const {
      startDate,
      endDate,
      maxResults = 10,
    } = params as unknown as CalendarParams;

    this.logger.log(`Getting calendar events from ${startDate} to ${endDate}`);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Mock calendar data - in production, integrate with Google Calendar API
    const allEvents = this.generateMockEvents();
    const filteredEvents = allEvents.slice(0, maxResults);

    return {
      events: filteredEvents,
      totalCount: filteredEvents.length,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  private generateMockEvents(): CalendarEvent[] {
    const events: CalendarEvent[] = [
      {
        id: '1',
        summary: 'Team Standup',
        start: { dateTime: '2025-07-15T09:00:00Z' },
        end: { dateTime: '2025-07-15T09:30:00Z' },
        location: 'Conference Room A',
        description: 'Daily team standup meeting',
        attendees: ['team@company.com'],
      },
      {
        id: '2',
        summary: 'Project Review',
        start: { dateTime: '2025-07-15T14:00:00Z' },
        end: { dateTime: '2025-07-15T15:30:00Z' },
        location: 'Online - Zoom',
        description: 'Review project progress and deliverables',
        attendees: ['pm@company.com', 'dev@company.com'],
      },
      {
        id: '3',
        summary: 'Client Call',
        start: { dateTime: '2025-07-16T09:00:00Z' },
        end: { dateTime: '2025-07-16T10:00:00Z' },
        location: 'Phone',
        description: 'Discuss requirements and timeline',
        attendees: ['client@example.com'],
      },
      {
        id: '4',
        summary: 'Code Review',
        start: { dateTime: '2025-07-16T11:00:00Z' },
        end: { dateTime: '2025-07-16T12:00:00Z' },
        location: 'Dev Room',
        description: 'Review pull requests and code quality',
        attendees: ['dev-team@company.com'],
      },
      {
        id: '5',
        summary: 'Lunch Meeting',
        start: { dateTime: '2025-07-16T12:30:00Z' },
        end: { dateTime: '2025-07-16T13:30:00Z' },
        location: 'Restaurant Downtown',
        description: 'Business lunch with partners',
        attendees: ['partner@business.com'],
      },
    ];

    return events;
  }
}
