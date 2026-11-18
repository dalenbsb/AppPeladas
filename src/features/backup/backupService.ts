import { validateBackupJson } from '@/domain/backupValidation';
import {
  BACKUP_JSON_VERSION,
  type BackupJsonV1,
  type BackupMediaItem,
} from '@/domain/types';

import { createRepositories } from '@/db/repositories';
import type { SqlExecutor } from '@/db/sqlExecutor';

export interface BackupServiceOptions {
  /** Confirmação explícita exigida antes de substituir dados no import. */
  confirmReplace: boolean;
}

/**
 * Exporta todo o conteúdo do app no schema Backup JSON v1.
 */
export async function exportToJson(db: SqlExecutor): Promise<BackupJsonV1> {
  const repos = createRepositories(db);
  const [peladas, atletas, sessoes, partidas, eventos, mediaRows] = await Promise.all([
    repos.peladas.list(),
    repos.atletas.listAll(),
    repos.sessoes.listAll(),
    repos.partidas.listAll(),
    repos.eventos.listAll(),
    db.getAll<{ id: string; atleta_id: string | null; mime_type: string; base64: string }>(
      'SELECT id, atleta_id, mime_type, base64 FROM backup_media',
    ),
  ]);

  const media: BackupMediaItem[] = mediaRows.map((row) => ({
    id: row.id,
    ...(row.atleta_id ? { atletaId: row.atleta_id } : {}),
    mimeType: row.mime_type,
    base64: row.base64,
  }));

  return {
    version: BACKUP_JSON_VERSION,
    exportedAt: new Date().toISOString(),
    peladas,
    atletas,
    sessoes,
    partidas,
    eventos,
    media,
  };
}

/**
 * Valida o schema e, com confirmação, substitui TODOS os dados locais.
 * Sem confirmReplace === true, não altera o banco.
 */
export async function importFromJson(
  db: SqlExecutor,
  raw: unknown,
  options: BackupServiceOptions,
): Promise<BackupJsonV1> {
  const backup = validateBackupJson(raw);

  if (!options.confirmReplace) {
    throw new Error(
      'Importação cancelada: é necessário confirmar a substituição de todos os dados.',
    );
  }

  await db.withTransaction(async () => {
    // Ordem respeitando FKs
    await db.exec(`
      DELETE FROM eventos_partida;
      DELETE FROM partidas;
      DELETE FROM sessoes;
      DELETE FROM backup_media;
      DELETE FROM atletas;
      DELETE FROM peladas;
    `);

    const repos = createRepositories(db);

    for (const pelada of backup.peladas) {
      await repos.peladas.create(pelada);
    }
    for (const atleta of backup.atletas) {
      await repos.atletas.create(atleta);
    }
    for (const sessao of backup.sessoes) {
      await repos.sessoes.create(sessao);
    }
    for (const partida of backup.partidas) {
      await repos.partidas.create(partida);
    }
    for (const evento of backup.eventos) {
      await repos.eventos.create(evento);
    }
    for (const media of backup.media) {
      await db.run(
        `INSERT INTO backup_media (id, atleta_id, mime_type, base64) VALUES (?, ?, ?, ?)`,
        [media.id, media.atletaId ?? null, media.mimeType, media.base64],
      );
    }
  });

  return backup;
}

/** Apaga todos os dados de negócio (útil no smoke / reset). Mantém schema_migrations. */
export async function wipeAllData(db: SqlExecutor): Promise<void> {
  await db.withTransaction(async () => {
    await db.exec(`
      DELETE FROM eventos_partida;
      DELETE FROM partidas;
      DELETE FROM sessoes;
      DELETE FROM backup_media;
      DELETE FROM atletas;
      DELETE FROM peladas;
    `);
  });
}
