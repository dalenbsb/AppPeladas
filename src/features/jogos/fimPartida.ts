/**
 * Rotação de times ao fim da partida (vitória ou regra de empate).
 * Vencedor fica; perdedor vai para o fim da fila; próximo time entra.
 */
import type { RegraEmpate, TimeSide } from '@/domain/types';

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

/** Vencedor permanece no lado; perdedor vai ao fim; entra o próximo bloco de N. */
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
  const nextTeam = waiting.slice(0, size);
  const resto = waiting.slice(size);

  if (nextTeam.length === 0) {
    // Sem time na fila: perdedor só vai ao fim; vencedor fica; time adversário fica vazio.
    const newOrdem = uniquePreserve([...winners, ...resto, ...losers]);
    return {
      ordemChegada: newOrdem,
      timeBrancoIds: vencedor === 'branco' ? winners : [],
      timePretoIds: vencedor === 'preto' ? winners : [],
      rotacionou: true,
    };
  }

  const newOrdem =
    vencedor === 'branco'
      ? uniquePreserve([...winners, ...nextTeam, ...resto, ...losers])
      : uniquePreserve([...nextTeam, ...winners, ...resto, ...losers]);

  return {
    ordemChegada: newOrdem,
    timeBrancoIds: vencedor === 'branco' ? winners : nextTeam,
    timePretoIds: vencedor === 'preto' ? winners : nextTeam,
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
  return {
    ordemChegada: uniquePreserve([...novoBranco, ...novoPreto, ...resto, ...sairam]),
    timeBrancoIds: novoBranco,
    timePretoIds: novoPreto,
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
