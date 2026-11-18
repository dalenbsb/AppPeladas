import Database from 'better-sqlite3';

import type { SqlExecutor } from './sqlExecutor';

/** Adapter Node para smoke tests — mesma interface do app. */
export function createBetterSqliteExecutor(filePath = ':memory:'): SqlExecutor {
  const db = new Database(filePath);
  db.pragma('foreign_keys = ON');

  return {
    async exec(sql: string) {
      db.exec(sql);
    },
    async run(sql: string, params: unknown[] = []) {
      const result = db.prepare(sql).run(...params);
      return {
        changes: result.changes,
        lastInsertRowId: Number(result.lastInsertRowid),
      };
    },
    async getFirst<T>(sql: string, params: unknown[] = []) {
      const row = db.prepare(sql).get(...params) as T | undefined;
      return row ?? null;
    },
    async getAll<T>(sql: string, params: unknown[] = []) {
      return db.prepare(sql).all(...params) as T[];
    },
    async withTransaction<T>(fn: () => Promise<T>) {
      db.exec('BEGIN');
      try {
        const value = await fn();
        db.exec('COMMIT');
        return value;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    async close() {
      db.close();
    },
  };
}
