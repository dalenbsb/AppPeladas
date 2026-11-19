import { create } from 'zustand';

import type { EventoPartida, Partida, TimeSide } from '@/domain/types';

import { formatCronometro, tempoExibidoMs } from './cronometro';

export type AmareloAtivo = {
  atletaId: string;
  retornaEm: string; // ISO
};

type PartidaLiveState = {
  partida: Partida | null;
  eventos: EventoPartida[];
  /** Epoch ms do início do segmento atual (quando não pausada). */
  segmentStartedAt: number | null;
  amarelosAtivos: AmareloAtivo[];
  /** Tick para re-render do cronômetro. */
  nowMs: number;
  ultimoVencedor: TimeSide | null;
  mensagemFim: string | null;
  setPartida: (partida: Partida | null) => void;
  setEventos: (eventos: EventoPartida[]) => void;
  setSegmentStartedAt: (at: number | null) => void;
  setAmarelosAtivos: (items: AmareloAtivo[]) => void;
  setUltimoVencedor: (side: TimeSide | null) => void;
  setMensagemFim: (msg: string | null) => void;
  tick: (now?: number) => void;
  reset: () => void;
};

const initial = {
  partida: null as Partida | null,
  eventos: [] as EventoPartida[],
  segmentStartedAt: null as number | null,
  amarelosAtivos: [] as AmareloAtivo[],
  nowMs: Date.now(),
  ultimoVencedor: null as TimeSide | null,
  mensagemFim: null as string | null,
};

export const usePartidaLiveStore = create<PartidaLiveState>((set) => ({
  ...initial,
  setPartida: (partida) => set({ partida }),
  setEventos: (eventos) => set({ eventos }),
  setSegmentStartedAt: (segmentStartedAt) => set({ segmentStartedAt }),
  setAmarelosAtivos: (amarelosAtivos) => set({ amarelosAtivos }),
  setUltimoVencedor: (ultimoVencedor) => set({ ultimoVencedor }),
  setMensagemFim: (mensagemFim) => set({ mensagemFim }),
  tick: (now = Date.now()) => set({ nowMs: now }),
  reset: () => set({ ...initial, nowMs: Date.now() }),
}));

export function selectPlacar(state: PartidaLiveState) {
  return {
    placarBranco: state.partida?.placarBranco ?? 0,
    placarPreto: state.partida?.placarPreto ?? 0,
  };
}

export function selectCronometroLabel(state: PartidaLiveState): string {
  const partida = state.partida;
  if (!partida) return '00:00';
  const rodando = Boolean(partida.iniciadaEm) && !partida.pausada && !partida.encerradaEm;
  const ms = tempoExibidoMs(
    partida.tempoDecorridoMs,
    rodando,
    state.segmentStartedAt,
    state.nowMs,
  );
  return formatCronometro(ms);
}

export function selectPartidaRodando(state: PartidaLiveState): boolean {
  const p = state.partida;
  return Boolean(p?.iniciadaEm) && !p?.pausada && !p?.encerradaEm;
}

export function selectPartidaAtiva(state: PartidaLiveState): boolean {
  const p = state.partida;
  return Boolean(p) && !p?.encerradaEm;
}
