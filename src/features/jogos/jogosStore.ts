import { create } from 'zustand';

import type { Atleta, Pelada, SessaoJogo } from '@/domain/types';

type JogosStore = {
  pelada: Pelada | null;
  sessao: SessaoJogo | null;
  atletasById: Record<string, Atleta>;
  revision: number;
  setSnapshot: (input: {
    pelada: Pelada;
    sessao: SessaoJogo;
    atletas: Atleta[];
  }) => void;
  setPelada: (pelada: Pelada) => void;
  setSessao: (sessao: SessaoJogo) => void;
  bump: () => void;
};

export const useJogosStore = create<JogosStore>((set) => ({
  pelada: null,
  sessao: null,
  atletasById: {},
  revision: 0,
  setSnapshot: ({ pelada, sessao, atletas }) =>
    set((s) => ({
      pelada,
      sessao,
      atletasById: Object.fromEntries(atletas.map((a) => [a.id, a])),
      revision: s.revision + 1,
    })),
  setPelada: (pelada) => set((s) => ({ pelada, revision: s.revision + 1 })),
  setSessao: (sessao) => set((s) => ({ sessao, revision: s.revision + 1 })),
  bump: () => set((s) => ({ revision: s.revision + 1 })),
}));
