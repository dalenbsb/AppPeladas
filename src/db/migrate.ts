import { MIGRATION_001_INITIAL, MIGRATION_001_VERSION } from './migrations/001_initial';
import {
  MIGRATION_002_PARTIDA_TEMPO,
  MIGRATION_002_VERSION,
} from './migrations/002_partida_tempo';
import {
  MIGRATION_003_PARTIDA_ELENCO,
  MIGRATION_003_VERSION,
} from './migrations/003_partida_elenco';
import type { SqlExecutor } from './sqlExecutor';

const MIGRATIONS: { version: number; sql: string }[] = [
  { version: MIGRATION_001_VERSION, sql: MIGRATION_001_INITIAL },
  { version: MIGRATION_002_VERSION, sql: MIGRATION_002_PARTIDA_TEMPO },
  { version: MIGRATION_003_VERSION, sql: MIGRATION_003_PARTIDA_ELENCO },
];

export async function migrate(db: SqlExecutor): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = await db.getAll<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC',
  );
  const appliedSet = new Set(applied.map((row) => row.version));

  for (const migration of MIGRATIONS) {
    if (appliedSet.has(migration.version)) {
      continue;
    }
    await db.withTransaction(async () => {
      await db.exec(migration.sql);
      await db.run('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)', [
        migration.version,
        new Date().toISOString(),
      ]);
    });
  }
}
