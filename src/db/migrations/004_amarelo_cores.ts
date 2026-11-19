/** Migration 004 — amarelo configurável (0–5 min) + cores dos times. */

export const MIGRATION_004_AMARELO_CORES = `
ALTER TABLE peladas ADD COLUMN amarelo_minutos_fora INTEGER NOT NULL DEFAULT 0;
ALTER TABLE peladas ADD COLUMN cor_time1 TEXT NOT NULL DEFAULT '#FFFFFF';
ALTER TABLE peladas ADD COLUMN cor_time2 TEXT NOT NULL DEFAULT '#111111';

UPDATE peladas
SET amarelo_minutos_fora = CASE WHEN amarelo_dois_minutos = 1 THEN 2 ELSE 0 END;

ALTER TABLE partidas ADD COLUMN cor_time1 TEXT NOT NULL DEFAULT '#FFFFFF';
ALTER TABLE partidas ADD COLUMN cor_time2 TEXT NOT NULL DEFAULT '#111111';
`;

export const MIGRATION_004_VERSION = 4;
