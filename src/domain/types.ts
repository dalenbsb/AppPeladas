/** Domínio AppPeladas — tipos da Fase 1 (alinhados ao plano v1). */

export type PosicaoAtleta =
  'goleiro' | 'zagueiro' | 'lateral' | 'volante' | 'meia' | 'atacante' | 'sem_posicao';

export type MelhorPe = 'direito' | 'esquerdo';

export type CriterioSorteio =
  'ordem_chegada' | 'sem_sorteio' | 'considerar_posicao' | 'nivel_tecnico';

export type RegraEmpate = 'sai_os_dois' | 'penaltis' | 'fica_quem_esta_ganhando';

export type SessaoStatus = 'aberta' | 'em_partida' | 'encerrada';

export type MotivoFimPartida = 'tempo' | 'limite_gols' | 'manual' | 'empate_resolvido' | null;

export type TipoEventoPartida =
  'gol' | 'gol_contra' | 'assistencia' | 'amarelo' | 'vermelho' | 'remocao';

export interface Pelada {
  id: string;
  nome: string;
  descricao: string | null;
  duracaoMin: number | null;
  limiteGols: number | null;
  jogadoresPorEquipe: number;
  criteriosSorteio: CriterioSorteio[];
  regraEmpate: RegraEmpate;
  telaSempreLigada: boolean;
  /**
   * Minutos fora após cartão amarelo (0–5).
   * 0 = só registra o amarelo (sem suspensão temporal).
   */
  amareloMinutosFora: number;
  /** Cor da camisa do Time 1 (lado `branco` no domínio). */
  corTime1: string;
  /** Cor da camisa do Time 2 (lado `preto` no domínio). */
  corTime2: string;
  createdAt: string;
  updatedAt: string;
}

export interface Atleta {
  id: string;
  peladaId: string;
  fotoUri: string | null;
  nome: string;
  posicao: PosicaoAtleta;
  celular: string | null;
  dataNascimento: string | null;
  ativo: boolean;
  mensalista: boolean;
  numeroCamisa: number | null;
  melhorPe: MelhorPe | null;
  createdAt: string;
  updatedAt: string;
}

/** Sessão / fila de ordem de chegada e times em montagem. */
export interface SessaoJogo {
  id: string;
  peladaId: string;
  ordemChegada: string[];
  timeBrancoIds: string[];
  timePretoIds: string[];
  status: SessaoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Partida {
  id: string;
  peladaId: string;
  sessaoId: string | null;
  placarBranco: number;
  placarPreto: number;
  /** Tempo acumulado do cronômetro (ms), atualizado ao pausar/encerrar. */
  tempoDecorridoMs: number;
  /**
   * Epoch ms do início do segmento atual enquanto a partida está rodando.
   * Persistido para o cronômetro sobreviver a sair/reentrar na tela.
   * Null quando pausada, não iniciada ou encerrada.
   */
  segmentStartedAtMs: number | null;
  /** Snapshot do elenco em campo ao iniciar (para estatísticas). */
  timeBrancoIds: string[];
  timePretoIds: string[];
  /** Snapshot das cores dos times no momento da partida (histórico). */
  corTime1: string;
  corTime2: string;
  iniciadaEm: string | null;
  pausada: boolean;
  encerradaEm: string | null;
  motivoFim: MotivoFimPartida;
  createdAt: string;
  updatedAt: string;
}

export interface EventoPartidaMeta {
  assistenteId?: string;
  gravidadeVermelho?: 'leve' | 'grave';
  /** ISO — retorno após amarelo com minutos configurados fora. */
  retornaEm?: string;
  /**
   * Ms restantes da suspensão quando a partida está pausada
   * (congela o timer de retorno junto com o cronômetro).
   */
  retornaEmRestanteMs?: number;
  observacao?: string;
}

export type TimeSide = 'branco' | 'preto';


export interface EventoPartida {
  id: string;
  partidaId: string;
  tipo: TipoEventoPartida;
  atletaId: string;
  meta: EventoPartidaMeta | null;
  createdAt: string;
}

/** Item de mídia embutida no backup (ex.: foto em base64). */
export interface BackupMediaItem {
  id: string;
  atletaId?: string;
  mimeType: string;
  base64: string;
}

export const BACKUP_JSON_VERSION = 1 as const;

export interface BackupJsonV1 {
  version: typeof BACKUP_JSON_VERSION;
  exportedAt: string;
  peladas: Pelada[];
  atletas: Atleta[];
  sessoes: SessaoJogo[];
  partidas: Partida[];
  eventos: EventoPartida[];
  media: BackupMediaItem[];
}

export type NewPelada = Omit<Pelada, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NewAtleta = Omit<Atleta, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NewSessaoJogo = Omit<SessaoJogo, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NewPartida = Omit<
  Partida,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'tempoDecorridoMs'
  | 'segmentStartedAtMs'
  | 'timeBrancoIds'
  | 'timePretoIds'
  | 'corTime1'
  | 'corTime2'
> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  tempoDecorridoMs?: number;
  segmentStartedAtMs?: number | null;
  timeBrancoIds?: string[];
  timePretoIds?: string[];
  corTime1?: string;
  corTime2?: string;
};

export type NewEventoPartida = Omit<EventoPartida, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
};
