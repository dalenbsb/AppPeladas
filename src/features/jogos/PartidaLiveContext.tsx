import { createContext, useContext, type ReactNode } from 'react';

import { usePartidaLive } from './usePartidaLive';

type PartidaLiveApi = ReturnType<typeof usePartidaLive>;

const PartidaLiveContext = createContext<PartidaLiveApi | null>(null);

export function PartidaLiveProvider({ children }: { children: ReactNode }) {
  const api = usePartidaLive();
  return (
    <PartidaLiveContext.Provider value={api}>{children}</PartidaLiveContext.Provider>
  );
}

export function usePartidaLiveApi(): PartidaLiveApi {
  const ctx = useContext(PartidaLiveContext);
  if (!ctx) {
    throw new Error('usePartidaLiveApi deve ser usado dentro de PartidaLiveProvider');
  }
  return ctx;
}
