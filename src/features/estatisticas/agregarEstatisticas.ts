/**
 * Agregações de estatísticas por pelada (Fase 6).
 * Usa partidas encerradas + elenco snapshot + eventos.
 */
import type { Atleta, EventoPartida, Partida } from '@/domain/types';

import { vencedorDaPartida } from '@/features/jogos/fimPartida';

export type TotaisRow = {
  atletaId: string;
  nome: string;
  jogos: number;
  vitorias: number;
  derrotas: number;
  empates: number;
};

export type ArtilhariaRow = {
  atletaId: string;
  nome: string;
  jogos: number;
  gols: number;
};

export type AssistenciasRow = {
  atletaId: string;
  nome: string;
  jogos: number;
  assistencias: number;
};

export type CartoesRow = {
  atletaId: string;
  nome: string;
  amarelos: number;
  vermelhos: number;
};

export type EstatisticasPelada = {
  totais: TotaisRow[];
  artilharia: ArtilhariaRow[];
  assistencias: AssistenciasRow[];
  cartoes: CartoesRow[];
  /** Destaques da aba Totais (primeiro de cada ranking). */
  destaques: {
    maisJogos: TotaisRow | null;
    maisVitorias: TotaisRow | null;
    maisDerrotas: TotaisRow | null;
    maisEmpates: TotaisRow | null;
  };
  partidasEncerradas: number;
};

type Acc = {
  jogos: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  gols: number;
  assistencias: number;
  amarelos: number;
  vermelhos: number;
};

function emptyAcc(): Acc {
  return {
    jogos: 0,
    vitorias: 0,
    derrotas: 0,
    empates: 0,
    gols: 0,
    assistencias: 0,
    amarelos: 0,
    vermelhos: 0,
  };
}

function ensure(map: Map<string, Acc>, id: string): Acc {
  let row = map.get(id);
  if (!row) {
    row = emptyAcc();
    map.set(id, row);
  }
  return row;
}

function sortByThenNome<T extends { nome: string }>(
  rows: T[],
  value: (row: T) => number,
): T[] {
  return [...rows].sort((a, b) => {
    const diff = value(b) - value(a);
    if (diff !== 0) return diff;
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });
}

/**
 * Agrega estatísticas a partir de partidas, eventos e atletas da pelada.
 * Só partidas encerradas entram em jogos/vitórias/derrotas/empates.
 */
export function agregarEstatisticas(
  atletas: Atleta[],
  partidas: Partida[],
  eventos: EventoPartida[],
): EstatisticasPelada {
  const nomeById = new Map(atletas.map((a) => [a.id, a.nome]));
  const byId = new Map<string, Acc>();

  const encerradas = partidas.filter((p) => Boolean(p.encerradaEm));

  for (const partida of encerradas) {
    const vencedor = vencedorDaPartida(partida.placarBranco, partida.placarPreto);
    const aplicarTime = (ids: string[], lado: 'branco' | 'preto') => {
      for (const atletaId of ids) {
        if (!nomeById.has(atletaId)) continue;
        const row = ensure(byId, atletaId);
        row.jogos += 1;
        if (vencedor === null) row.empates += 1;
        else if (vencedor === lado) row.vitorias += 1;
        else row.derrotas += 1;
      }
    };
    aplicarTime(partida.timeBrancoIds, 'branco');
    aplicarTime(partida.timePretoIds, 'preto');
  }

  const partidaIdsEncerradas = new Set(encerradas.map((p) => p.id));
  for (const evento of eventos) {
    if (!partidaIdsEncerradas.has(evento.partidaId)) continue;
    if (!nomeById.has(evento.atletaId)) continue;
    const row = ensure(byId, evento.atletaId);
    switch (evento.tipo) {
      case 'gol':
        row.gols += 1;
        break;
      case 'assistencia':
        row.assistencias += 1;
        break;
      case 'amarelo':
        row.amarelos += 1;
        break;
      case 'vermelho':
        row.vermelhos += 1;
        break;
      default:
        break;
    }
  }

  const totais: TotaisRow[] = [];
  const artilharia: ArtilhariaRow[] = [];
  const assistencias: AssistenciasRow[] = [];
  const cartoes: CartoesRow[] = [];

  for (const [atletaId, acc] of byId) {
    const nome = nomeById.get(atletaId) ?? 'Atleta';
    if (acc.jogos > 0 || acc.vitorias + acc.derrotas + acc.empates > 0) {
      totais.push({
        atletaId,
        nome,
        jogos: acc.jogos,
        vitorias: acc.vitorias,
        derrotas: acc.derrotas,
        empates: acc.empates,
      });
    }
    if (acc.gols > 0) {
      artilharia.push({ atletaId, nome, jogos: acc.jogos, gols: acc.gols });
    }
    if (acc.assistencias > 0) {
      assistencias.push({
        atletaId,
        nome,
        jogos: acc.jogos,
        assistencias: acc.assistencias,
      });
    }
    if (acc.amarelos > 0 || acc.vermelhos > 0) {
      cartoes.push({
        atletaId,
        nome,
        amarelos: acc.amarelos,
        vermelhos: acc.vermelhos,
      });
    }
  }

  const totaisPorJogos = sortByThenNome(totais, (r) => r.jogos);
  const totaisPorVitorias = sortByThenNome(totais, (r) => r.vitorias);
  const totaisPorDerrotas = sortByThenNome(totais, (r) => r.derrotas);
  const totaisPorEmpates = sortByThenNome(totais, (r) => r.empates);

  return {
    totais: totaisPorJogos,
    artilharia: sortByThenNome(artilharia, (r) => r.gols),
    assistencias: sortByThenNome(assistencias, (r) => r.assistencias),
    cartoes: sortByThenNome(cartoes, (r) => r.amarelos + r.vermelhos * 2),
    destaques: {
      maisJogos: totaisPorJogos[0] ?? null,
      maisVitorias: totaisPorVitorias.find((r) => r.vitorias > 0) ?? null,
      maisDerrotas: totaisPorDerrotas.find((r) => r.derrotas > 0) ?? null,
      maisEmpates: totaisPorEmpates.find((r) => r.empates > 0) ?? null,
    },
    partidasEncerradas: encerradas.length,
  };
}
