import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useRepositories } from '@/db/DatabaseProvider';
import type { Pelada, SessaoJogo } from '@/domain/types';

import { useJogosStore } from './jogosStore';
import { montarTimesDaFila } from './montarTimes';
import { realizarSorteio } from './sorteio';

/** Carrega pelada/sessão/atletas no layout de Jogos (uma vez por foco). */
export function useJogosBootstrap(peladaId: string) {
  const repos = useRepositories();
  const setSnapshot = useJogosStore((s) => s.setSnapshot);
  const pelada = useJogosStore((s) => s.pelada);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const found = await repos.peladas.getById(peladaId);
      if (!found) {
        setError('Pelada não encontrada.');
        return;
      }
      const [lista, sessaoAtiva] = await Promise.all([
        repos.atletas.listByPelada(peladaId),
        repos.sessoes.getOrCreateOpen(peladaId),
      ]);
      setSnapshot({ pelada: found, sessao: sessaoAtiva, atletas: lista });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar jogos');
    } finally {
      setLoading(false);
    }
  }, [peladaId, repos.atletas, repos.peladas, repos.sessoes, setSnapshot]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { loading, error, reload: load, pelada };
}

/** Estado + ações compartilhados pelas abas (lê o store já hidratado). */
export function useJogosSession() {
  const repos = useRepositories();
  const pelada = useJogosStore((s) => s.pelada);
  const sessao = useJogosStore((s) => s.sessao);
  const atletasById = useJogosStore((s) => s.atletasById);
  const setSessao = useJogosStore((s) => s.setSessao);
  const setSnapshot = useJogosStore((s) => s.setSnapshot);

  const atletas = useMemo(() => Object.values(atletasById), [atletasById]);

  const persistOrdem = useCallback(
    async (ordemChegada: string[]) => {
      if (!sessao || !pelada) return;
      const times = montarTimesDaFila(ordemChegada, pelada.jogadoresPorEquipe);
      const updated = await repos.sessoes.update(sessao.id, {
        ordemChegada,
        timeBrancoIds: times.timeBrancoIds,
        timePretoIds: times.timePretoIds,
      });
      setSessao(updated);
    },
    [pelada, repos.sessoes, sessao, setSessao],
  );

  const addAtleta = useCallback(
    async (atletaId: string) => {
      if (!sessao) return;
      if (sessao.ordemChegada.includes(atletaId)) return;
      await persistOrdem([...sessao.ordemChegada, atletaId]);
    },
    [persistOrdem, sessao],
  );

  const limparFila = useCallback(async () => {
    if (!sessao) return;
    const updated = await repos.sessoes.update(sessao.id, {
      ordemChegada: [],
      timeBrancoIds: [],
      timePretoIds: [],
    });
    setSessao(updated);
  }, [repos.sessoes, sessao, setSessao]);

  const sortear = useCallback(async () => {
    if (!sessao || !pelada) {
      throw new Error('Sessão não carregada');
    }
    if (sessao.ordemChegada.length < pelada.jogadoresPorEquipe * 2) {
      throw new Error(
        `É preciso pelo menos ${pelada.jogadoresPorEquipe * 2} na fila para montar os dois times.`,
      );
    }
    const lista =
      atletas.length > 0 ? atletas : await repos.atletas.listByPelada(pelada.id);
    const result = realizarSorteio({
      ordemChegada: sessao.ordemChegada,
      atletas: lista,
      criterios: pelada.criteriosSorteio,
      jogadoresPorEquipe: pelada.jogadoresPorEquipe,
    });
    const updated = await repos.sessoes.update(sessao.id, {
      ordemChegada: result.ordemChegada,
      timeBrancoIds: result.timeBrancoIds,
      timePretoIds: result.timePretoIds,
    });
    setSessao(updated);
    if (lista !== atletas) {
      setSnapshot({ pelada, sessao: updated, atletas: lista });
    }
    return result;
  }, [atletas, pelada, repos.atletas, repos.sessoes, sessao, setSessao, setSnapshot]);

  const refreshAtletas = useCallback(async () => {
    if (!pelada || !sessao) return;
    const lista = await repos.atletas.listByPelada(pelada.id);
    setSnapshot({ pelada, sessao, atletas: lista });
  }, [pelada, repos.atletas, sessao, setSnapshot]);

  return {
    pelada: pelada as Pelada | null,
    sessao: sessao as SessaoJogo | null,
    atletas,
    atletasById,
    persistOrdem,
    addAtleta,
    limparFila,
    sortear,
    refreshAtletas,
  };
}
