import { Injectable, Logger } from '@nestjs/common';
import {
  ParameterValidator,
  ValidationResult,
  ToolDefinition,
} from '../interfaces/tool.interface';

@Injectable()
export class JsonSchemaValidator implements ParameterValidator {
  private readonly logger = new Logger(JsonSchemaValidator.name);

  validate(
    tool: ToolDefinition,
    params: Record<string, unknown>,
  ): ValidationResult {
    const errors: string[] = [];

    for (const [paramName, paramDef] of Object.entries(tool.parameters)) {
      // Check required parameters
      if (paramDef.required && !(paramName in params)) {
        errors.push(`Required parameter '${paramName}' is missing`);
        continue;
      }

      if (paramName in params) {
        const value = params[paramName];

        // Type validation
        if (!this.validateType(value, paramDef.type)) {
          errors.push(
            `Parameter '${paramName}' must be of type ${paramDef.type}`,
          );
        }

        // Enum validation
        if (paramDef.enum && !paramDef.enum.includes(value as string)) {
          errors.push(
            `Parameter '${paramName}' must be one of: ${paramDef.enum.join(', ')}`,
          );
        }

        // Format validation
        if (
          paramDef.format &&
          !this.validateFormat(value as string, paramDef.format)
        ) {
          errors.push(
            `Parameter '${paramName}' must match format: ${paramDef.format}`,
          );
        }
      }
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
    };

    if (!result.isValid) {
      this.logger.warn(`Parameter validation failed for tool ${tool.name}`, {
        errors,
      });
    }

    return result;
  }

  private validateType(value: unknown, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return (
          typeof value === 'object' && value !== null && !Array.isArray(value)
        );
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  private validateFormat(value: string, format: string): boolean {
    switch (format) {
      case 'date-time':
        return !isNaN(Date.parse(value)) && value.includes('T');
      case 'date':
        return !isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}/.test(value);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'uuid':
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value,
        );
      default:
        return true;
    }
  }
}
