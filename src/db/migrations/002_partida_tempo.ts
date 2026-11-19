/** Migration 002 — tempo decorrido da partida (cronômetro persistido). */

export const MIGRATION_002_PARTIDA_TEMPO = `
ALTER TABLE partidas ADD COLUMN tempo_decorrido_ms INTEGER NOT NULL DEFAULT 0;
`;

export const MIGRATION_002_VERSION = 2;
