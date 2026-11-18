/** Migration inicial — schema AppPeladas v1. */

export const MIGRATION_001_INITIAL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS peladas (
  id TEXT PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_min INTEGER,
  limite_gols INTEGER,
  jogadores_por_equipe INTEGER NOT NULL,
  criterios_sorteio_json TEXT NOT NULL,
  regra_empate TEXT NOT NULL,
  tela_sempre_ligada INTEGER NOT NULL DEFAULT 0,
  amarelo_dois_minutos INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS atletas (
  id TEXT PRIMARY KEY NOT NULL,
  pelada_id TEXT NOT NULL,
  foto_uri TEXT,
  nome TEXT NOT NULL,
  posicao TEXT NOT NULL,
  celular TEXT,
  data_nascimento TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  mensalista INTEGER NOT NULL DEFAULT 0,
  numero_camisa INTEGER,
  melhor_pe TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (pelada_id) REFERENCES peladas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_atletas_pelada ON atletas(pelada_id);

CREATE TABLE IF NOT EXISTS sessoes (
  id TEXT PRIMARY KEY NOT NULL,
  pelada_id TEXT NOT NULL,
  ordem_chegada_json TEXT NOT NULL,
  time_branco_ids_json TEXT NOT NULL,
  time_preto_ids_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (pelada_id) REFERENCES peladas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessoes_pelada ON sessoes(pelada_id);

CREATE TABLE IF NOT EXISTS partidas (
  id TEXT PRIMARY KEY NOT NULL,
  pelada_id TEXT NOT NULL,
  sessao_id TEXT,
  placar_branco INTEGER NOT NULL DEFAULT 0,
  placar_preto INTEGER NOT NULL DEFAULT 0,
  iniciada_em TEXT,
  pausada INTEGER NOT NULL DEFAULT 0,
  encerrada_em TEXT,
  motivo_fim TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (pelada_id) REFERENCES peladas(id) ON DELETE CASCADE,
  FOREIGN KEY (sessao_id) REFERENCES sessoes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_partidas_pelada ON partidas(pelada_id);

CREATE TABLE IF NOT EXISTS eventos_partida (
  id TEXT PRIMARY KEY NOT NULL,
  partida_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  atleta_id TEXT NOT NULL,
  meta_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
  FOREIGN KEY (atleta_id) REFERENCES atletas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_eventos_partida ON eventos_partida(partida_id);

CREATE TABLE IF NOT EXISTS backup_media (
  id TEXT PRIMARY KEY NOT NULL,
  atleta_id TEXT,
  mime_type TEXT NOT NULL,
  base64 TEXT NOT NULL,
  FOREIGN KEY (atleta_id) REFERENCES atletas(id) ON DELETE SET NULL
);
`;

export const MIGRATION_001_VERSION = 1;
