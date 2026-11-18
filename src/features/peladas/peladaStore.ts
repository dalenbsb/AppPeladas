import { create } from 'zustand';

import type { Pelada } from '@/domain/types';

type PeladaStore = {
  peladas: Pelada[];
  setPeladas: (peladas: Pelada[]) => void;
  /** Incrementado para forçar telas a recarregar após create/update/import. */
  revision: number;
  bump: () => void;
};

export const usePeladaStore = create<PeladaStore>((set) => ({
  peladas: [],
  setPeladas: (peladas) => set({ peladas }),
  revision: 0,
  bump: () => set((s) => ({ revision: s.revision + 1 })),
}));
