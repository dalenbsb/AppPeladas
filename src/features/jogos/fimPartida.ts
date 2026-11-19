/**
 * Rotação de times ao fim da partida (vitória ou regra de empate).
 *
 * Fluxo padrão (há vencedor / “fica quem está ganhando”):
 * 1) Time perdedor entra no fim da fila de próximos times (bloco intacto).
 * 2) O próximo time completo (N) da fila entra no lugar do perdedor.
 * 3) Vencedor permanece no seu lado; ordem = branco + preto + fila.
 *
 * Empate: respeita `regraEmpate` (sai os dois / pênaltis / fica quem está ganhando).
 */
import type { RegraEmpate, TimeSide } from '@/domain/types';

import { montarTimesDaFila } from './montarTimes';

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

/** Vencedor permanece no lado; perdedor vai ao fim da fila; entra o próximo bloco completo de N. */
export function rotacionarVencedorFica(
  ordemChegada: string[],
  timeBrancoIds: string[],
  timePretoIds: string[],
  vencedor: TimeSide,
  n: number,
): Pick<FimPartidaResult, 'ordemChegada' | 'timeBrancoIds' | 'timePretoIds' | 'rotacionou'> {
  const size = Math.max(1, Math.floor(n) || 1);
  const winners = vencedor === 'branco' ? [...timeBrancoIds] : [...timePretoIds];
  const losers = vencedor === 'branco' ? [...timePretoIds] : [...timeBrancoIds];
  const onField = new Set([...winners, ...losers]);
  const waiting = ordemChegada.filter((id) => !onField.has(id));

  // Só entra time completo de N; senão vencedor fica e o lado adversário fica vazio.
  const temProximoTime = waiting.length >= size;
  const nextTeam = temProximoTime ? waiting.slice(0, size) : [];
  const restoEspera = temProximoTime ? waiting.slice(size) : waiting;

  // Perdedor no fim da fila de próximos (após quem já esperava).
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
    };
  }

  return {
    ordemChegada: newOrdem,
    timeBrancoIds: novoBranco,
    timePretoIds: novoPreto,
    rotacionou: true,
  };
}

/** Empate: os dois saem se houver 2 times esperando; senão não rotaciona. */
export function rotacionarSaiOsDois(
  ordemChegada: string[],
  timeBrancoIds: string[],
  timePretoIds: string[],
  n: number,
): Pick<FimPartidaResult, 'ordemChegada' | 'timeBrancoIds' | 'timePretoIds' | 'rotacionou' | 'mensagem'> {
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
  };
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
      mensagem:
        vencedor === 'branco'
          ? 'Camisa branco venceu e permanece. Camisa preta vai para o fim da fila.'
          : 'Camisa preta venceu e permanece. Camisa branco vai para o fim da fila.',
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
    mensagem:
      stay === 'branco'
        ? 'Empate: permanece Camisa branco (vantagem no ciclo). Camisa preta sai.'
        : 'Empate: permanece Camisa preta (vantagem no ciclo). Camisa branco sai.',
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
 * O que sai vai para o fim dos próximos; o times em campo (lados) permanecem.
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

  const swap = (ids: string[]) => ids.map((id) => (id === atletaId ? entrouId : id));
  const novoBranco = swap(timeBrancoIds);
  const novoPreto = swap(timePretoIds);
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
