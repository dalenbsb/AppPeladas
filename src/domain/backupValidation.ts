import { DEFAULT_COR_TIME1, DEFAULT_COR_TIME2 } from './teamColors';
import {
  BACKUP_JSON_VERSION,
  type Atleta,
  type BackupJsonV1,
  type BackupMediaItem,
  type EventoPartida,
  type Partida,
  type Pelada,
  type SessaoJogo,
} from './types';

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupValidationError';
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isNumberOrNull(value: unknown): value is number | null {
  return value === null || typeof value === 'number';
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new BackupValidationError(message);
  }
}

function validatePelada(item: unknown, index: number): Pelada {
  assert(isObject(item), `peladas[${index}] deve ser objeto`);
  assert(isString(item.id), `peladas[${index}].id inválido`);
  assert(isString(item.nome), `peladas[${index}].nome inválido`);
  assert(isStringOrNull(item.descricao), `peladas[${index}].descricao inválida`);
  assert(isNumberOrNull(item.duracaoMin), `peladas[${index}].duracaoMin inválida`);
  assert(isNumberOrNull(item.limiteGols), `peladas[${index}].limiteGols inválido`);
  assert(
    typeof item.jogadoresPorEquipe === 'number',
    `peladas[${index}].jogadoresPorEquipe inválido`,
  );
  assert(isStringArray(item.criteriosSorteio), `peladas[${index}].criteriosSorteio inválido`);
  assert(isString(item.regraEmpate), `peladas[${index}].regraEmpate inválida`);
  assert(isBoolean(item.telaSempreLigada), `peladas[${index}].telaSempreLigada inválida`);
  // Aceita campo novo (0–5) ou legado booleano `amareloDoisMinutos`.
  let amareloMinutosFora = 0;
  if (typeof item.amareloMinutosFora === 'number') {
    assert(
      Number.isInteger(item.amareloMinutosFora) &&
        item.amareloMinutosFora >= 0 &&
        item.amareloMinutosFora <= 5,
      `peladas[${index}].amareloMinutosFora inválido`,
    );
    amareloMinutosFora = item.amareloMinutosFora;
  } else if (isBoolean(item.amareloDoisMinutos)) {
    amareloMinutosFora = item.amareloDoisMinutos ? 2 : 0;
  } else {
    assert(false, `peladas[${index}].amareloMinutosFora inválido`);
  }
  const corTime1 =
    typeof item.corTime1 === 'string' && item.corTime1.trim()
      ? item.corTime1.trim()
      : DEFAULT_COR_TIME1;
  const corTime2 =
    typeof item.corTime2 === 'string' && item.corTime2.trim()
      ? item.corTime2.trim()
      : DEFAULT_COR_TIME2;
  assert(isString(item.createdAt), `peladas[${index}].createdAt inválido`);
  assert(isString(item.updatedAt), `peladas[${index}].updatedAt inválido`);
  return {
    ...(item as unknown as Pelada),
    amareloMinutosFora,
    corTime1,
    corTime2,
  };
}

function validateAtleta(item: unknown, index: number): Atleta {
  assert(isObject(item), `atletas[${index}] deve ser objeto`);
  assert(isString(item.id), `atletas[${index}].id inválido`);
  assert(isString(item.peladaId), `atletas[${index}].peladaId inválido`);
  assert(isStringOrNull(item.fotoUri), `atletas[${index}].fotoUri inválido`);
  assert(isString(item.nome), `atletas[${index}].nome inválido`);
  assert(isString(item.posicao), `atletas[${index}].posicao inválida`);
  assert(isStringOrNull(item.celular), `atletas[${index}].celular inválido`);
  assert(isStringOrNull(item.dataNascimento), `atletas[${index}].dataNascimento inválida`);
  assert(isBoolean(item.ativo), `atletas[${index}].ativo inválido`);
  assert(isBoolean(item.mensalista), `atletas[${index}].mensalista inválido`);
  assert(
    item.numeroCamisa === null || typeof item.numeroCamisa === 'number',
    `atletas[${index}].numeroCamisa inválido`,
  );
  assert(item.melhorPe === null || isString(item.melhorPe), `atletas[${index}].melhorPe inválido`);
  assert(isString(item.createdAt), `atletas[${index}].createdAt inválido`);
  assert(isString(item.updatedAt), `atletas[${index}].updatedAt inválido`);
  return item as unknown as Atleta;
}

function validateSessao(item: unknown, index: number): SessaoJogo {
  assert(isObject(item), `sessoes[${index}] deve ser objeto`);
  assert(isString(item.id), `sessoes[${index}].id inválido`);
  assert(isString(item.peladaId), `sessoes[${index}].peladaId inválido`);
  assert(isStringArray(item.ordemChegada), `sessoes[${index}].ordemChegada inválida`);
  assert(isStringArray(item.timeBrancoIds), `sessoes[${index}].timeBrancoIds inválido`);
  assert(isStringArray(item.timePretoIds), `sessoes[${index}].timePretoIds inválido`);
  assert(isString(item.status), `sessoes[${index}].status inválido`);
  assert(isString(item.createdAt), `sessoes[${index}].createdAt inválido`);
  assert(isString(item.updatedAt), `sessoes[${index}].updatedAt inválido`);
  return item as unknown as SessaoJogo;
}

function validatePartida(item: unknown, index: number): Partida {
  assert(isObject(item), `partidas[${index}] deve ser objeto`);
  assert(isString(item.id), `partidas[${index}].id inválido`);
  assert(isString(item.peladaId), `partidas[${index}].peladaId inválido`);
  assert(isStringOrNull(item.sessaoId), `partidas[${index}].sessaoId inválido`);
  assert(typeof item.placarBranco === 'number', `partidas[${index}].placarBranco inválido`);
  assert(typeof item.placarPreto === 'number', `partidas[${index}].placarPreto inválido`);
  // Backups da Fase 1–4 podem não ter tempoDecorridoMs.
  if (item.tempoDecorridoMs !== undefined) {
    assert(
      typeof item.tempoDecorridoMs === 'number',
      `partidas[${index}].tempoDecorridoMs inválido`,
    );
  }
  // Backups anteriores à Fase 6 podem não ter elenco.
  if (item.timeBrancoIds !== undefined) {
    assert(isStringArray(item.timeBrancoIds), `partidas[${index}].timeBrancoIds inválido`);
  }
  if (item.timePretoIds !== undefined) {
    assert(isStringArray(item.timePretoIds), `partidas[${index}].timePretoIds inválido`);
  }
  assert(isStringOrNull(item.iniciadaEm), `partidas[${index}].iniciadaEm inválido`);
  assert(isBoolean(item.pausada), `partidas[${index}].pausada inválido`);
  assert(isStringOrNull(item.encerradaEm), `partidas[${index}].encerradaEm inválido`);
  assert(
    item.motivoFim === null || isString(item.motivoFim),
    `partidas[${index}].motivoFim inválido`,
  );
  assert(isString(item.createdAt), `partidas[${index}].createdAt inválido`);
  assert(isString(item.updatedAt), `partidas[${index}].updatedAt inválido`);
  const corTime1 =
    typeof item.corTime1 === 'string' && item.corTime1.trim()
      ? item.corTime1.trim()
      : DEFAULT_COR_TIME1;
  const corTime2 =
    typeof item.corTime2 === 'string' && item.corTime2.trim()
      ? item.corTime2.trim()
      : DEFAULT_COR_TIME2;
  return {
    ...(item as unknown as Partida),
    tempoDecorridoMs:
      typeof item.tempoDecorridoMs === 'number' ? item.tempoDecorridoMs : 0,
    segmentStartedAtMs:
      typeof item.segmentStartedAtMs === 'number' ? item.segmentStartedAtMs : null,
    timeBrancoIds: isStringArray(item.timeBrancoIds) ? item.timeBrancoIds : [],
    timePretoIds: isStringArray(item.timePretoIds) ? item.timePretoIds : [],
    corTime1,
    corTime2,
  };
}

function validateEvento(item: unknown, index: number): EventoPartida {
  assert(isObject(item), `eventos[${index}] deve ser objeto`);
  assert(isString(item.id), `eventos[${index}].id inválido`);
  assert(isString(item.partidaId), `eventos[${index}].partidaId inválido`);
  assert(isString(item.tipo), `eventos[${index}].tipo inválido`);
  assert(isString(item.atletaId), `eventos[${index}].atletaId inválido`);
  assert(item.meta === null || isObject(item.meta), `eventos[${index}].meta inválido`);
  assert(isString(item.createdAt), `eventos[${index}].createdAt inválido`);
  return item as unknown as EventoPartida;
}

function validateMedia(item: unknown, index: number): BackupMediaItem {
  assert(isObject(item), `media[${index}] deve ser objeto`);
  assert(isString(item.id), `media[${index}].id inválido`);
  assert(isString(item.mimeType), `media[${index}].mimeType inválido`);
  assert(isString(item.base64), `media[${index}].base64 inválido`);
  if (item.atletaId !== undefined) {
    assert(isString(item.atletaId), `media[${index}].atletaId inválido`);
  }
  return item as unknown as BackupMediaItem;
}

/**
 * Valida o schema do backup JSON v1.
 * Em falha lança BackupValidationError — o banco não deve ser alterado.
 */
export function validateBackupJson(raw: unknown): BackupJsonV1 {
  assert(isObject(raw), 'Backup deve ser um objeto JSON');
  assert(raw.version === BACKUP_JSON_VERSION, `version deve ser ${BACKUP_JSON_VERSION}`);
  assert(isString(raw.exportedAt), 'exportedAt deve ser string ISO-8601');
  assert(Array.isArray(raw.peladas), 'peladas deve ser array');
  assert(Array.isArray(raw.atletas), 'atletas deve ser array');
  assert(Array.isArray(raw.sessoes), 'sessoes deve ser array');
  assert(Array.isArray(raw.partidas), 'partidas deve ser array');
  assert(Array.isArray(raw.eventos), 'eventos deve ser array');
  assert(Array.isArray(raw.media), 'media deve ser array');

  return {
    version: BACKUP_JSON_VERSION,
    exportedAt: raw.exportedAt,
    peladas: raw.peladas.map(validatePelada),
    atletas: raw.atletas.map(validateAtleta),
    sessoes: raw.sessoes.map(validateSessao),
    partidas: raw.partidas.map(validatePartida),
    eventos: raw.eventos.map(validateEvento),
    media: raw.media.map(validateMedia),
  };
}
