import type {
  Atleta,
  CriterioSorteio,
  EventoPartida,
  EventoPartidaMeta,
  MelhorPe,
  MotivoFimPartida,
  Partida,
  Pelada,
  PosicaoAtleta,
  RegraEmpate,
  SessaoJogo,
  SessaoStatus,
  TipoEventoPartida,
} from '@/domain/types';

export interface PeladaRow {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_min: number | null;
  limite_gols: number | null;
  jogadores_por_equipe: number;
  criterios_sorteio_json: string;
  regra_empate: string;
  tela_sempre_ligada: number;
  amarelo_dois_minutos: number;
  created_at: string;
  updated_at: string;
}

export interface AtletaRow {
  id: string;
  pelada_id: string;
  foto_uri: string | null;
  nome: string;
  posicao: string;
  celular: string | null;
  data_nascimento: string | null;
  ativo: number;
  mensalista: number;
  numero_camisa: number | null;
  melhor_pe: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessaoRow {
  id: string;
  pelada_id: string;
  ordem_chegada_json: string;
  time_branco_ids_json: string;
  time_preto_ids_json: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PartidaRow {
  id: string;
  pelada_id: string;
  sessao_id: string | null;
  placar_branco: number;
  placar_preto: number;
  iniciada_em: string | null;
  pausada: number;
  encerrada_em: string | null;
  motivo_fim: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventoRow {
  id: string;
  partida_id: string;
  tipo: string;
  atleta_id: string;
  meta_json: string | null;
  created_at: string;
}

export function mapPelada(row: PeladaRow): Pelada {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    duracaoMin: row.duracao_min,
    limiteGols: row.limite_gols,
    jogadoresPorEquipe: row.jogadores_por_equipe,
    criteriosSorteio: JSON.parse(row.criterios_sorteio_json) as CriterioSorteio[],
    regraEmpate: row.regra_empate as RegraEmpate,
    telaSempreLigada: Boolean(row.tela_sempre_ligada),
    amareloDoisMinutos: Boolean(row.amarelo_dois_minutos),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAtleta(row: AtletaRow): Atleta {
  return {
    id: row.id,
    peladaId: row.pelada_id,
    fotoUri: row.foto_uri,
    nome: row.nome,
    posicao: row.posicao as PosicaoAtleta,
    celular: row.celular,
    dataNascimento: row.data_nascimento,
    ativo: Boolean(row.ativo),
    mensalista: Boolean(row.mensalista),
    numeroCamisa: row.numero_camisa,
    melhorPe: (row.melhor_pe as MelhorPe | null) ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSessao(row: SessaoRow): SessaoJogo {
  return {
    id: row.id,
    peladaId: row.pelada_id,
    ordemChegada: JSON.parse(row.ordem_chegada_json) as string[],
    timeBrancoIds: JSON.parse(row.time_branco_ids_json) as string[],
    timePretoIds: JSON.parse(row.time_preto_ids_json) as string[],
    status: row.status as SessaoStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPartida(row: PartidaRow): Partida {
  return {
    id: row.id,
    peladaId: row.pelada_id,
    sessaoId: row.sessao_id,
    placarBranco: row.placar_branco,
    placarPreto: row.placar_preto,
    iniciadaEm: row.iniciada_em,
    pausada: Boolean(row.pausada),
    encerradaEm: row.encerrada_em,
    motivoFim: (row.motivo_fim as MotivoFimPartida) ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEvento(row: EventoRow): EventoPartida {
  return {
    id: row.id,
    partidaId: row.partida_id,
    tipo: row.tipo as TipoEventoPartida,
    atletaId: row.atleta_id,
    meta: row.meta_json ? (JSON.parse(row.meta_json) as EventoPartidaMeta) : null,
    createdAt: row.created_at,
  };
}
