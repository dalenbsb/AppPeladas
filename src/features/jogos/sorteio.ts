import type { Atleta, CriterioSorteio } from '@/domain/types';

import { montarTimesDaFila, type TimesMontados } from './montarTimes';

/**
 * Decisão v1 — nível técnico:
 * não há campo `nivel` no atleta; usamos `mensalista` como proxy
 * (mensalista = nível mais alto). Documentado no plano Fase 4.
 */

export type SorteioResult = TimesMontados & {
  /** Nova ordem (branco + preto + resto) refletindo o resultado do sorteio. */
  ordemChegada: string[];
  modo: 'sequencial' | 'balanceado';
};

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/** Prioridade de posição para equilíbrio (goleiro primeiro). */
const POSICAO_RANK: Record<string, number> = {
  goleiro: 0,
  zagueiro: 1,
  lateral: 2,
  volante: 3,
  meia: 4,
  atacante: 5,
  sem_posicao: 6,
};

function nivelProxy(atleta: Atleta): number {
  // Heurística v1: mensalista conta como nível 4; demais nível 2.
  return atleta.mensalista ? 4 : 2;
}

function resolveAtletas(ordem: string[], byId: Map<string, Atleta>): Atleta[] {
  return ordem.map((id) => byId.get(id)).filter((a): a is Atleta => Boolean(a));
}

/**
 * Snake draft para equilibrar dois times de tamanho N.
 * Ordena candidatos e alterna A-B-B-A…
 */
function snakeDraft(atletas: Atleta[], n: number): { branco: Atleta[]; preto: Atleta[] } {
  const branco: Atleta[] = [];
  const preto: Atleta[] = [];
  const pool = atletas.slice(0, n * 2);
  for (let i = 0; i < pool.length; i += 1) {
    const round = Math.floor(i / 2);
    const pickForBranco = round % 2 === 0 ? i % 2 === 0 : i % 2 === 1;
    if (pickForBranco) branco.push(pool[i]!);
    else preto.push(pool[i]!);
  }
  return { branco, preto };
}

function ordenarParaBalanceamento(
  atletas: Atleta[],
  criterios: CriterioSorteio[],
): Atleta[] {
  const usarPosicao = criterios.includes('considerar_posicao');
  const usarNivel = criterios.includes('nivel_tecnico');
  const sorted = [...atletas];
  sorted.sort((a, b) => {
    if (usarNivel) {
      const diff = nivelProxy(b) - nivelProxy(a);
      if (diff !== 0) return diff;
    }
    if (usarPosicao) {
      const pa = POSICAO_RANK[a.posicao] ?? 99;
      const pb = POSICAO_RANK[b.posicao] ?? 99;
      if (pa !== pb) return pa - pb;
    }
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });
  // Dentro do mesmo “bucket”, embaralha para não fixar sempre os mesmos.
  if (usarNivel || usarPosicao) {
    // Embaralha levemente por faixas de posição.
    const groups = new Map<string, Atleta[]>();
    for (const a of sorted) {
      const key = usarPosicao ? a.posicao : String(nivelProxy(a));
      const list = groups.get(key) ?? [];
      list.push(a);
      groups.set(key, list);
    }
    const out: Atleta[] = [];
    for (const list of groups.values()) {
      out.push(...shuffleInPlace(list));
    }
    if (usarNivel) {
      out.sort((a, b) => nivelProxy(b) - nivelProxy(a));
    }
    return out;
  }
  return shuffleInPlace(sorted);
}

/**
 * Aplica critérios da pelada sobre a ordem de chegada atual.
 * - `sem_sorteio` ou só `ordem_chegada`: montagem sequencial (1º N branco, 2º N preto).
 * - com posição e/ou nível: balanceamento via snake draft nos 2N primeiros elegíveis.
 */
export function realizarSorteio(params: {
  ordemChegada: string[];
  atletas: Atleta[];
  criterios: CriterioSorteio[];
  jogadoresPorEquipe: number;
}): SorteioResult {
  const n = Math.max(1, params.jogadoresPorEquipe || 1);
  const byId = new Map(params.atletas.map((a) => [a.id, a]));
  const criterios = params.criterios ?? [];

  const soSequencial =
    criterios.length === 0 ||
    criterios.includes('sem_sorteio') ||
    (criterios.length === 1 && criterios[0] === 'ordem_chegada') ||
    (!criterios.includes('considerar_posicao') && !criterios.includes('nivel_tecnico'));

  if (soSequencial) {
    const montados = montarTimesDaFila(params.ordemChegada, n);
    return {
      ...montados,
      ordemChegada: params.ordemChegada,
      modo: 'sequencial',
    };
  }

  const presentes = resolveAtletas(params.ordemChegada, byId);
  const ordenados = ordenarParaBalanceamento(presentes, criterios);
  const { branco, preto } = snakeDraft(ordenados, n);
  const usados = new Set([...branco, ...preto].map((a) => a.id));
  const resto = params.ordemChegada.filter((id) => !usados.has(id));
  const ordemChegada = [...branco.map((a) => a.id), ...preto.map((a) => a.id), ...resto];
  const montados = montarTimesDaFila(ordemChegada, n);
  return {
    ...montados,
    ordemChegada,
    modo: 'balanceado',
  };
}
