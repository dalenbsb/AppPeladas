/**
 * @deprecated Use `createNodeSqliteExecutor` em `nodeSqliteAdapter.ts`.
 * Mantido só para reexport durante a transição; não depende de better-sqlite3.
 */
export { createNodeSqliteExecutor as createBetterSqliteExecutor } from './nodeSqliteAdapter';
