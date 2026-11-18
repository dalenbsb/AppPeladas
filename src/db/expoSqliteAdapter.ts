import * as SQLite from 'expo-sqlite';

import { migrate } from './migrate';
import type { SqlExecutor } from './sqlExecutor';

const DB_NAME = 'apppeladas.db';

function wrapExpoDatabase(database: SQLite.SQLiteDatabase): SqlExecutor {
  return {
    async exec(sql: string) {
      await database.execAsync(sql);
    },
    async run(sql: string, params: unknown[] = []) {
      const result = await database.runAsync(sql, params as SQLite.SQLiteBindParams);
      return {
        changes: result.changes,
        lastInsertRowId: result.lastInsertRowId,
      };
    },
    async getFirst<T>(sql: string, params: unknown[] = []) {
      const row = await database.getFirstAsync<T>(sql, params as SQLite.SQLiteBindParams);
      return row ?? null;
    },
    async getAll<T>(sql: string, params: unknown[] = []) {
      return database.getAllAsync<T>(sql, params as SQLite.SQLiteBindParams);
    },
    async withTransaction<T>(fn: () => Promise<T>) {
      // expo-sqlite tipa withTransactionAsync como Promise<void>; capturamos o valor.
      let result!: T;
      await database.withTransactionAsync(async () => {
        result = await fn();
      });
      return result;
    },
    async close() {
      await database.closeAsync();
    },
  };
}

let cached: SqlExecutor | null = null;

/** Abre (ou reutiliza) o banco do app e aplica migrations. */
export async function openAppDatabase(): Promise<SqlExecutor> {
  if (cached) {
    return cached;
  }
  const native = await SQLite.openDatabaseAsync(DB_NAME);
  await native.execAsync('PRAGMA foreign_keys = ON;');
  const executor = wrapExpoDatabase(native);
  await migrate(executor);
  cached = executor;
  return executor;
}

export async function resetAppDatabaseCache(): Promise<void> {
  if (cached) {
    await cached.close();
    cached = null;
  }
}
