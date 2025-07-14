// database/database.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

// TypeScript interfaces for better type safety
interface SchemaColumn {
  table_name: string;
  column_name: string;
  data_type: string;
}

interface TableColumn {
  column: string;
  type: string;
}

interface DatabaseSchema {
  [tableName: string]: TableColumn[];
}

@Injectable()
export class DatabaseService {
  constructor(private dataSource: DataSource) {}

  /**
   * Execute SQL query safely with validation
   */
  async executeQuery(sqlQuery: string): Promise<unknown[]> {
    try {
      // Validate the SQL query for security
      this.validateSQLQuery(sqlQuery);

      // Execute the query
      const result = await this.dataSource.query(sqlQuery);
      // Limit results to prevent memory issues
      return Array.isArray(result) ? result.slice(0, 1000) : [];
    } catch (error: unknown) {
      console.error('Database query error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown database error';
      throw new Error(`Database query failed: ${errorMessage}`);
    }
  }

  /**
   * Validate SQL query for security (basic validation)
   */
  private validateSQLQuery(sql: string): void {
    const normalizedSQL = sql.toLowerCase().trim();

    // Only allow SELECT statements
    if (!normalizedSQL.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }

    // Block dangerous keywords
    const dangerousKeywords = [
      'drop',
      'delete',
      'insert',
      'update',
      'alter',
      'create',
      'truncate',
      'exec',
      'execute',
      'sp_',
      'xp_',
    ];

    for (const keyword of dangerousKeywords) {
      if (normalizedSQL.includes(keyword)) {
        throw new Error(`SQL query contains forbidden keyword: ${keyword}`);
      }
    }

    // Basic SQL injection patterns
    const injectionPatterns = [
      /;.*drop/i,
      /;.*delete/i,
      /union.*select/i,
      /'\s*or\s*'/i,
      /'\s*or\s*1\s*=\s*1/i,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(sql)) {
        throw new Error('Potentially malicious SQL detected');
      }
    }
  }

  /**
   * Get database schema information for AI context
   */
  async getSchemaInfo(): Promise<DatabaseSchema> {
    try {
      // Get table information (PostgreSQL syntax)
      const tables = (await this.dataSource.query(`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `)) as SchemaColumn[];

      // Group by table
      const schema: DatabaseSchema = {};
      tables.forEach((row: SchemaColumn) => {
        if (!schema[row.table_name]) {
          schema[row.table_name] = [];
        }
        schema[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
        });
      });

      return schema;
    } catch (error: unknown) {
      console.error('Schema info error:', error);
      return {};
    }
  }
}
