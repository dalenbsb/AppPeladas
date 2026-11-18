/**
 * Abstração mínima de SQLite para rodar no app (expo-sqlite)
 * e no smoke test Node (`node:sqlite`).
 */
export interface SqlExecutor {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getFirst<T>(sql: string, params?: unknown[]): Promise<T | null>;
  getAll<T>(sql: string, params?: unknown[]): Promise<T[]>;
  withTransaction<T>(fn: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
