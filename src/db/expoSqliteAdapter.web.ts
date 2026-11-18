import type { SqlExecutor } from './sqlExecutor';

/**
 * Stub web — v1 é mobile-first (iOS/Android).
 * Evita que o Metro puxe `expo-sqlite/web/worker.ts` + wa-sqlite.wasm.
 */
export async function openAppDatabase(): Promise<SqlExecutor> {
  throw new Error(
    'AppPeladas v1 não roda no navegador. Use Expo Go / Android / iOS (npx expo start --android).',
  );
}

export async function resetAppDatabaseCache(): Promise<void> {
  // no-op no web
}
