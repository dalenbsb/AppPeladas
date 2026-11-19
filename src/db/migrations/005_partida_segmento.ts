/** Migration 005 — âncora wall-clock do segmento do cronômetro (persiste ao sair da tela). */

export const MIGRATION_005_PARTIDA_SEGMENTO = `
ALTER TABLE partidas ADD COLUMN segment_started_at_ms INTEGER;
`;

export const MIGRATION_005_VERSION = 5;
