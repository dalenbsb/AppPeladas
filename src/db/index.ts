/** API do banco usada pelo app. Adapter Node (smoke) fica em betterSqliteAdapter.ts. */
export { openAppDatabase, resetAppDatabaseCache } from './expoSqliteAdapter';
export { migrate } from './migrate';
export { createRepositories } from './repositories';
export type { Repositories } from './repositories';
export type { SqlExecutor } from './sqlExecutor';
