import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useRepositories } from '@/db/DatabaseProvider';

import {
  agregarEstatisticas,
  type EstatisticasPelada,
} from './agregarEstatisticas';

export function useEstatisticas(peladaId: string) {
  const repos = useRepositories();
  const [data, setData] = useState<EstatisticasPelada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const [atletas, partidas, eventos] = await Promise.all([
            repos.atletas.listByPelada(peladaId),
            repos.partidas.listByPelada(peladaId),
            repos.eventos.listByPelada(peladaId),
          ]);
          if (!active) return;
          setData(agregarEstatisticas(atletas, partidas, eventos));
        } catch (err) {
          if (!active) return;
          setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
          setData(null);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [peladaId, repos.atletas, repos.eventos, repos.partidas]),
  );

  return { data, loading, error };
}
