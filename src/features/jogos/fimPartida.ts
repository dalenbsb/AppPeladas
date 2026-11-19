/**
 * Rotação de times ao fim da partida (vitória ou regra de empate).
 *
 * Fluxo padrão (há vencedor / “fica quem está ganhando”):
 * 1) Time perdedor entra no fim da fila de próximos times (bloco intacto).
 * 2) Se o vencedor está incompleto (expulso/machucado etc.) e há próximos,
 *    exige preencher a última vaga ANTES de montar o adversário.
 * 3) Com vencedor completo: o próximo time completo (N) da fila entra no lugar do perdedor.
 * 4) Vencedor permanece no seu lado; ordem = branco + preto + fila.
 *
 * Empate: respeita `regraEmpate` (sai os dois / pênaltis / fica quem está ganhando).
 */
import type { RegraEmpate, TimeSide } from '@/domain/types';

import { montarTimesDaFila } from './montarTimes';

/** Copy PT-BR: vaga do vencedor deve ser preenchida antes do próximo time. */
export const MSG_PREENCHER_VAGA_VENCEDOR =
  'O jogador expulso ou machucado deve ser substituído';

export type FimPartidaInput = {
  ordemChegada: string[];
  timeBrancoIds: string[];
  timePretoIds: string[];
  placarBranco: number;
  placarPreto: number;
  regraEmpate: RegraEmpate;
  jogadoresPorEquipe: number;
  /** Lado que venceu a partida anterior (ciclo); usado em empate “fica quem está ganhando”. */
  ultimoVencedor: TimeSide | null;
};

export type FimPartidaResult = {
  ordemChegada: string[];
  timeBrancoIds: string[];
  timePretoIds: string[];
  /** Mensagem para o organizador (pênaltis, falta de times, etc.). */
  mensagem: string;
  rotacionou: boolean;
  vencedor: TimeSide | 'empate';
  /**
   * Vencedor (ou time que fica no empate) está abaixo de N e há alguém na fila:
   * bloqueia montagem do adversário até preencher a última vaga.
   */
  precisaPreencherVaga: boolean;
  /** Lado que permanece e precisa da vaga (quando `precisaPreencherVaga`). */
  ladoQueFica: TimeSide | null;
};

function uniquePreserve(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/**
 * Remonta a ordem canônica: time 1 (branco) + time 2 (preto) + fila de próximos.
 * Assim a aba Partida e a aba Próximos times leem a mesma fila.
 */
export function remontarOrdemAposRotacao(
  timeBrancoIds: string[],
  timePretoIds: string[],
  filaProximos: string[],
): string[] {
  return uniquePreserve([...timeBrancoIds, ...timePretoIds, ...filaProximos]);
}

/** True se o time que fica está abaixo de N. */
export function timeIncompleto(ids: string[], n: number): boolean {
  const size = Math.max(1, Math.floor(n) || 1);
  return ids.length < size;
}

/**
 * Vencedor permanece no lado; perdedor vai ao fim da fila.
 * Se o vencedor está incompleto e há próximos, NÃO monta o adversário ainda
 * (`precisaPreencherVaga`); senão entra o próximo bloco completo de N.
 */
export function rotacionarVencedorFica(
  ordemChegada: string[],
  timeBrancoIds: string[],
  timePretoIds: string[],
  vencedor: TimeSide,
  n: number,
): Pick<
  FimPartidaResult,
  | 'ordemChegada'
  | 'timeBrancoIds'
  | 'timePretoIds'
  | 'rotacionou'
  | 'precisaPreencherVaga'
  | 'ladoQueFica'
> {
  const size = Math.max(1, Math.floor(n) || 1);
  const winners = vencedor === 'branco' ? [...timeBrancoIds] : [...timePretoIds];
  const losers = vencedor === 'branco' ? [...timePretoIds] : [...timeBrancoIds];
  const onField = new Set([...winners, ...losers]);
  const waiting = ordemChegada.filter((id) => !onField.has(id));

  // Perdedor no fim da fila de próximos (após quem já esperava).
  const filaAposPerdedor = [...waiting, ...losers];

  // Vencedor incompleto + alguém na fila → bloqueia montagem do adversário.
  if (timeIncompleto(winners, size) && filaAposPerdedor.length > 0) {
    const novoBranco = vencedor === 'branco' ? winners : [];
    const novoPreto = vencedor === 'preto' ? winners : [];
    return {
      ordemChegada: remontarOrdemAposRotacao(novoBranco, novoPreto, filaAposPerdedor),
      timeBrancoIds: novoBranco,
      timePretoIds: novoPreto,
      rotacionou: true,
      precisaPreencherVaga: true,
      ladoQueFica: vencedor,
    };
  }

  // Só entra time completo de N; senão vencedor fica e o lado adversário fica vazio.
  const temProximoTime = waiting.length >= size;
  const nextTeam = temProximoTime ? waiting.slice(0, size) : [];
  const restoEspera = temProximoTime ? waiting.slice(size) : waiting;
  const filaProximos = [...restoEspera, ...losers];

  const novoBranco = vencedor === 'branco' ? winners : nextTeam;
  const novoPreto = vencedor === 'preto' ? winners : nextTeam;
  const newOrdem = remontarOrdemAposRotacao(novoBranco, novoPreto, filaProximos);

  // Com times completos, a remontagem pela fila deve bater com os lados explícitos.
  if (novoBranco.length === size && novoPreto.length === size) {
    const pelaFila = montarTimesDaFila(newOrdem, size);
    return {
      ordemChegada: newOrdem,
      timeBrancoIds: pelaFila.timeBrancoIds,
      timePretoIds: pelaFila.timePretoIds,
      rotacionou: true,
      precisaPreencherVaga: false,
      ladoQueFica: null,
    };
  }

  return {
    ordemChegada: newOrdem,
    timeBrancoIds: novoBranco,
    timePretoIds: novoPreto,
    rotacionou: true,
    precisaPreencherVaga: false,
    ladoQueFica: null,
  };
}

/**
 * Coloca o atleta escolhido na última vaga do time que ficou.
 * Se o time completa N, monta o adversário com o próximo bloco completo da fila.
 * Se ainda faltar vaga e houver fila, mantém `precisaPreencherVaga`.
 */
export function preencherVagaVencedorEMontarAdversario(
  ordemChegada: string[],
  timeBrancoIds: string[],
  timePretoIds: string[],
  ladoQueFica: TimeSide,
  entraId: string,
  n: number,
): Pick<
  FimPartidaResult,
  | 'ordemChegada'
  | 'timeBrancoIds'
  | 'timePretoIds'
  | 'rotacionou'
  | 'precisaPreencherVaga'
  | 'ladoQueFica'
  | 'mensagem'
> | null {
  const size = Math.max(1, Math.floor(n) || 1);
  const winners = ladoQueFica === 'branco' ? [...timeBrancoIds] : [...timePretoIds];
  const opposing = ladoQueFica === 'branco' ? [...timePretoIds] : [...timeBrancoIds];
  // Enquanto falta preencher, o adversário deve estar vazio.
  if (opposing.length > 0) return null;
  if (!timeIncompleto(winners, size)) return null;

  const onField = new Set([...winners, ...opposing]);
  const waiting = ordemChegada.filter((id) => !onField.has(id));
  if (!waiting.includes(entraId)) return null;

  const novaEspera = waiting.filter((id) => id !== entraId);
  const winnersComVaga = [...winners, entraId];

  if (timeIncompleto(winnersComVaga, size)) {
    const aindaPrecisa = novaEspera.length > 0;
    const novoBranco = ladoQueFica === 'branco' ? winnersComVaga : [];
    const novoPreto = ladoQueFica === 'preto' ? winnersComVaga : [];
    return {
      ordemChegada: remontarOrdemAposRotacao(novoBranco, novoPreto, novaEspera),
      timeBrancoIds: novoBranco,
      timePretoIds: novoPreto,
      rotacionou: true,
      precisaPreencherVaga: aindaPrecisa,
      ladoQueFica: aindaPrecisa ? ladoQueFica : null,
      mensagem: aindaPrecisa
        ? MSG_PREENCHER_VAGA_VENCEDOR
        : 'Vaga preenchida. Aguarde mais atletas na fila para montar o adversário.',
    };
  }

  // Time completo: monta adversário com bloco de N (se houver).
  const temProximoTime = novaEspera.length >= size;
  const nextTeam = temProximoTime ? novaEspera.slice(0, size) : [];
  const restoEspera = temProximoTime ? novaEspera.slice(size) : novaEspera;
  const novoBranco = ladoQueFica === 'branco' ? winnersComVaga : nextTeam;
  const novoPreto = ladoQueFica === 'preto' ? winnersComVaga : nextTeam;
  const newOrdem = remontarOrdemAposRotacao(novoBranco, novoPreto, restoEspera);

  if (novoBranco.length === size && novoPreto.length === size) {
    const pelaFila = montarTimesDaFila(newOrdem, size);
    return {
      ordemChegada: newOrdem,
      timeBrancoIds: pelaFila.timeBrancoIds,
      timePretoIds: pelaFila.timePretoIds,
      rotacionou: true,
      precisaPreencherVaga: false,
      ladoQueFica: null,
      mensagem:
        ladoQueFica === 'branco'
          ? 'Vaga preenchida. Camisa branco permanece; próximo time entrou como Camisa preta.'
          : 'Vaga preenchida. Camisa preta permanece; próximo time entrou como Camisa branco.',
    };
  }

  return {
    ordemChegada: newOrdem,
    timeBrancoIds: novoBranco,
    timePretoIds: novoPreto,
    rotacionou: true,
    precisaPreencherVaga: false,
    ladoQueFica: null,
    mensagem: 'Vaga preenchida. Aguarde mais atletas na fila para montar o adversário.',
  };
}

/** Empate: os dois saem se houver 2 times esperando; senão não rotaciona. */
export function rotacionarSaiOsDois(
  ordemChegada: string[],
  timeBrancoIds: string[],
  timePretoIds: string[],
  n: number,
): Pick<
  FimPartidaResult,
  | 'ordemChegada'
  | 'timeBrancoIds'
  | 'timePretoIds'
  | 'rotacionou'
  | 'mensagem'
  | 'precisaPreencherVaga'
  | 'ladoQueFica'
> {
  const size = Math.max(1, Math.floor(n) || 1);
  const onField = new Set([...timeBrancoIds, ...timePretoIds]);
  const waiting = ordemChegada.filter((id) => !onField.has(id));
  if (waiting.length < size * 2) {
    return {
      ordemChegada,
      timeBrancoIds,
      timePretoIds,
      rotacionou: false,
      mensagem:
        'Empate: sai os dois só quando houver 2 times na fila. Mantenha os times ou ajuste a ordem.',
      precisaPreencherVaga: false,
      ladoQueFica: null,
    };
  }
  const novoBranco = waiting.slice(0, size);
  const novoPreto = waiting.slice(size, size * 2);
  const resto = waiting.slice(size * 2);
  const sairam = [...timeBrancoIds, ...timePretoIds];
  const filaProximos = [...resto, ...sairam];
  const newOrdem = remontarOrdemAposRotacao(novoBranco, novoPreto, filaProximos);
  const pelaFila = montarTimesDaFila(newOrdem, size);
  return {
    ordemChegada: newOrdem,
    timeBrancoIds: pelaFila.timeBrancoIds,
    timePretoIds: pelaFila.timePretoIds,
    rotacionou: true,
    mensagem: 'Empate: os dois times saíram; entraram os próximos da fila.',
    precisaPreencherVaga: false,
    ladoQueFica: null,
  };
}

function mensagemRotacaoVencedor(
  vencedor: TimeSide,
  precisaPreencherVaga: boolean,
  contexto: 'vitoria' | 'empate_fica',
): string {
  if (precisaPreencherVaga) return MSG_PREENCHER_VAGA_VENCEDOR;
  if (contexto === 'empate_fica') {
    return vencedor === 'branco'
      ? 'Empate: permanece Camisa branco (vantagem no ciclo). Camisa preta sai.'
      : 'Empate: permanece Camisa preta (vantagem no ciclo). Camisa branco sai.';
  }
  return vencedor === 'branco'
    ? 'Camisa branco venceu e permanece. Camisa preta vai para o fim da fila.'
    : 'Camisa preta venceu e permanece. Camisa branco vai para o fim da fila.';
}

export function aplicarFimPartida(input: FimPartidaInput): FimPartidaResult {
  const {
    ordemChegada,
    timeBrancoIds,
    timePretoIds,
    placarBranco,
    placarPreto,
    regraEmpate,
    jogadoresPorEquipe: n,
    ultimoVencedor,
  } = input;

  if (placarBranco !== placarPreto) {
    const vencedor: TimeSide = placarBranco > placarPreto ? 'branco' : 'preto';
    const rotated = rotacionarVencedorFica(
      ordemChegada,
      timeBrancoIds,
      timePretoIds,
      vencedor,
      n,
    );
    return {
      ...rotated,
      vencedor,
      mensagem: mensagemRotacaoVencedor(
        vencedor,
        rotated.precisaPreencherVaga,
        'vitoria',
      ),
    };
  }

  // Empate
  if (regraEmpate === 'penaltis') {
    return {
      ordemChegada,
      timeBrancoIds,
      timePretoIds,
      rotacionou: false,
      vencedor: 'empate',
      mensagem: 'Empate: dispute nos pênaltis. Os times permanecem em campo.',
      precisaPreencherVaga: false,
      ladoQueFica: null,
    };
  }

  if (regraEmpate === 'sai_os_dois') {
    const r = rotacionarSaiOsDois(ordemChegada, timeBrancoIds, timePretoIds, n);
    return { ...r, vencedor: 'empate' };
  }

  // fica_quem_esta_ganhando
  const stay: TimeSide = ultimoVencedor ?? 'branco';
  const rotated = rotacionarVencedorFica(
    ordemChegada,
    timeBrancoIds,
    timePretoIds,
    stay,
    n,
  );
  return {
    ...rotated,
    vencedor: 'empate',
    mensagem: mensagemRotacaoVencedor(
      stay,
      rotated.precisaPreencherVaga,
      'empate_fica',
    ),
  };
}

export function vencedorDaPartida(
  placarBranco: number,
  placarPreto: number,
): TimeSide | null {
  if (placarBranco === placarPreto) return null;
  return placarBranco > placarPreto ? 'branco' : 'preto';
}

/**
 * Restaura o lado em vantagem no ciclo a partir do histórico (mais recente primeiro).
 * Empates são ignorados — a vantagem vem da última vitória de fato.
 */
export function ultimoVencedorDoCiclo(
  partidasMaisRecentePrimeiro: Array<{ placarBranco: number; placarPreto: number }>,
): TimeSide | null {
  for (const p of partidasMaisRecentePrimeiro) {
    const v = vencedorDaPartida(p.placarBranco, p.placarPreto);
    if (v) return v;
  }
  return null;
}

/** Move atleta para o fim da ordem e remove dos times em campo. */
export function enviarAoFimDaFila(
  ordemChegada: string[],
  timeBrancoIds: string[],
  timePretoIds: string[],
  atletaId: string,
): {
  ordemChegada: string[];
  timeBrancoIds: string[];
  timePretoIds: string[];
} {
  const semAtleta = (ids: string[]) => ids.filter((id) => id !== atletaId);
  const ordemSem = semAtleta(ordemChegada);
  return {
    ordemChegada: [...ordemSem, atletaId],
    timeBrancoIds: semAtleta(timeBrancoIds),
    timePretoIds: semAtleta(timePretoIds),
  };
}

/**
 * Troca um atleta em campo pelo próximo da fila de espera.
 * Quem sai vai para o fim dos próximos; quem entra vai ao **fim** do time
 * (não ocupa o índice vacante). O outro lado permanece intacto.
 */
export function substituirPorProximo(
  ordemChegada: string[],
  timeBrancoIds: string[],
  timePretoIds: string[],
  atletaId: string,
): {
  ordemChegada: string[];
  timeBrancoIds: string[];
  timePretoIds: string[];
  entrouId: string;
} | null {
  const onField = new Set([...timeBrancoIds, ...timePretoIds]);
  if (!onField.has(atletaId)) return null;

  const waiting = ordemChegada.filter((id) => !onField.has(id));
  const entrouId = waiting[0];
  if (!entrouId) return null;

  /** Remove quem sai e anexa o substituto no fim do elenco do time. */
  const appendSub = (ids: string[]) => {
    if (!ids.includes(atletaId)) return ids;
    return [...ids.filter((id) => id !== atletaId), entrouId];
  };
  const novoBranco = appendSub(timeBrancoIds);
  const novoPreto = appendSub(timePretoIds);
  const novaEspera = [...waiting.slice(1), atletaId];
  return {
    ordemChegada: remontarOrdemAposRotacao(novoBranco, novoPreto, novaEspera),
    timeBrancoIds: novoBranco,
    timePretoIds: novoPreto,
    entrouId,
  };
}

/**
 * Reordena só a fila de próximos, preservando os times em campo.
 * `novaFilaProximos` deve conter exatamente os IDs que estavam fora de campo.
 */
export function reordenarProximos(
  timeBrancoIds: string[],
  timePretoIds: string[],
  novaFilaProximos: string[],
): {
  ordemChegada: string[];
  timeBrancoIds: string[];
  timePretoIds: string[];
} {
  const onField = new Set([...timeBrancoIds, ...timePretoIds]);
  const limpa = uniquePreserve(novaFilaProximos.filter((id) => !onField.has(id)));
  return {
    ordemChegada: remontarOrdemAposRotacao(timeBrancoIds, timePretoIds, limpa),
    timeBrancoIds: [...timeBrancoIds],
    timePretoIds: [...timePretoIds],
  };
}
