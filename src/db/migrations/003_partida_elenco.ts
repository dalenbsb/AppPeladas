/** Migration 003 — elenco da partida (snapshot para estatísticas). */

export const MIGRATION_003_PARTIDA_ELENCO = `
ALTER TABLE partidas ADD COLUMN time_branco_ids_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE partidas ADD COLUMN time_preto_ids_json TEXT NOT NULL DEFAULT '[]';
`;

export const MIGRATION_003_VERSION = 3;
