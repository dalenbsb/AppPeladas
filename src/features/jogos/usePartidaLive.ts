import { useCallback, useEffect, useRef } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { useRepositories } from '@/db/DatabaseProvider';
import type { MotivoFimPartida, TimeSide } from '@/domain/types';
import { nowIso } from '@/db/ids';

import { duracaoLimiteMs, tempoExibidoMs } from './cronometro';
import {
  aplicarFimPartida,
  enviarAoFimDaFila,
  substituirPorProximo,
  ultimoVencedorDoCiclo,
  vencedorDaPartida,
} from './fimPartida';
import { montarTimesDaFila } from './montarTimes';
import {
  usePartidaLiveStore,
  type AmareloAtivo,
} from './partidaLiveStore';
import { useJogosStore } from './jogosStore';

const KEEP_AWAKE_TAG = 'apppeladas-partida';
const AMARELO_MS = 2 * 60 * 1000;

function countAmarelosNaPartida(
  eventos: { tipo: string; atletaId: string }[],
  atletaId: string,
): number {
  return eventos.filter((e) => e.tipo === 'amarelo' && e.atletaId === atletaId).length;
}

function resolveTimes(
  sessao: {
    ordemChegada: string[];
    timeBrancoIds: string[];
    timePretoIds: string[];
  },
  n: number,
) {
  if (sessao.timeBrancoIds.length > 0 || sessao.timePretoIds.length > 0) {
    return {
      timeBrancoIds: sessao.timeBrancoIds.slice(0, n),
      timePretoIds: sessao.timePretoIds.slice(0, n),
    };
  }
  return montarTimesDaFila(sessao.ordemChegada, n);
}

function sideOfAtleta(
  atletaId: string,
  timeBrancoIds: string[],
  timePretoIds: string[],
): TimeSide | null {
  if (timeBrancoIds.includes(atletaId)) return 'branco';
  if (timePretoIds.includes(atletaId)) return 'preto';
  return null;
}

/** Carrega / controla partida ao vivo ligada à sessão atual. */
export function usePartidaLive() {
  const repos = useRepositories();
  const pelada = useJogosStore((s) => s.pelada);
  const sessao = useJogosStore((s) => s.sessao);
  const setSessao = useJogosStore((s) => s.setSessao);

  const partida = usePartidaLiveStore((s) => s.partida);
  const setPartida = usePartidaLiveStore((s) => s.setPartida);
  const setEventos = usePartidaLiveStore((s) => s.setEventos);
  const segmentStartedAt = usePartidaLiveStore((s) => s.segmentStartedAt);
  const setSegmentStartedAt = usePartidaLiveStore((s) => s.setSegmentStartedAt);
  const amarelosAtivos = usePartidaLiveStore((s) => s.amarelosAtivos);
  const setAmarelosAtivos = usePartidaLiveStore((s) => s.setAmarelosAtivos);
  const ultimoVencedor = usePartidaLiveStore((s) => s.ultimoVencedor);
  const setUltimoVencedor = usePartidaLiveStore((s) => s.setUltimoVencedor);
  const setMensagemFim = usePartidaLiveStore((s) => s.setMensagemFim);
  const tick = usePartidaLiveStore((s) => s.tick);
  const resetLive = usePartidaLiveStore((s) => s.reset);

  const endingRef = useRef(false);

  const load = useCallback(async () => {
    if (!sessao || !pelada) {
      resetLive();
      return;
    }
    const [aberta, ultimaComVencedor] = await Promise.all([
      repos.partidas.getOpenBySessao(sessao.id),
      repos.partidas.getLastFinishedBySessao(sessao.id),
    ]);
    // Ignora empates: a vantagem do ciclo é a última vitória de fato.
    setUltimoVencedor(
      ultimaComVencedor
        ? ultimoVencedorDoCiclo([
            {
              placarBranco: ultimaComVencedor.placarBranco,
              placarPreto: ultimaComVencedor.placarPreto,
            },
          ])
        : null,
    );
    if (!aberta) {
      setPartida(null);
      setEventos([]);
      setSegmentStartedAt(null);
      setAmarelosAtivos([]);
      return;
    }
    const eventos = await repos.eventos.listByPartida(aberta.id);
    setPartida(aberta);
    setEventos(eventos);
    const rodando = Boolean(aberta.iniciadaEm) && !aberta.pausada && !aberta.encerradaEm;
    setSegmentStartedAt(rodando ? Date.now() : null);

    const agora = Date.now();
    const amarelos: AmareloAtivo[] = [];
    for (const ev of eventos) {
      if (ev.tipo !== 'amarelo' || !ev.meta?.retornaEm) continue;
      if (new Date(ev.meta.retornaEm).getTime() > agora) {
        amarelos.push({ atletaId: ev.atletaId, retornaEm: ev.meta.retornaEm });
      }
    }
    setAmarelosAtivos(amarelos);
  }, [
    pelada,
    repos.eventos,
    repos.partidas,
    resetLive,
    sessao,
    setAmarelosAtivos,
    setEventos,
    setPartida,
    setSegmentStartedAt,
    setUltimoVencedor,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  // Tick do cronômetro + limpeza de amarelos expirados
  useEffect(() => {
    const id = setInterval(() => {
      tick();
      const agora = Date.now();
      const atuais = usePartidaLiveStore.getState().amarelosAtivos;
      const ainda = atuais.filter((a) => new Date(a.retornaEm).getTime() > agora);
      if (ainda.length !== atuais.length) {
        setAmarelosAtivos(ainda);
      }
    }, 500);
    return () => clearInterval(id);
  }, [setAmarelosAtivos, tick]);

  // Keep-awake
  useEffect(() => {
    const ativa =
      Boolean(pelada?.telaSempreLigada) &&
      Boolean(partida?.iniciadaEm) &&
      !partida?.pausada &&
      !partida?.encerradaEm;
    if (ativa) {
      void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    } else {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    }
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [partida?.encerradaEm, partida?.iniciadaEm, partida?.pausada, pelada?.telaSempreLigada]);

  const tempoAtualMs = useCallback(() => {
    const p = usePartidaLiveStore.getState().partida;
    const seg = usePartidaLiveStore.getState().segmentStartedAt;
    if (!p) return 0;
    const rodando = Boolean(p.iniciadaEm) && !p.pausada && !p.encerradaEm;
    return tempoExibidoMs(p.tempoDecorridoMs, rodando, seg);
  }, []);

  const encerrarPartida = useCallback(
    async (motivo: MotivoFimPartida) => {
      if (endingRef.current) return;
      const p = usePartidaLiveStore.getState().partida;
      const s = useJogosStore.getState().sessao;
      const pel = useJogosStore.getState().pelada;
      if (!p || !s || !pel || p.encerradaEm) return;
      endingRef.current = true;
      try {
        const n = pel.jogadoresPorEquipe;
        const times = resolveTimes(s, n);
        const tempo = tempoAtualMs();
        const elencoPatch =
          p.timeBrancoIds.length === 0 && p.timePretoIds.length === 0
            ? {
                timeBrancoIds: times.timeBrancoIds,
                timePretoIds: times.timePretoIds,
              }
            : {};
        const encerrada = await repos.partidas.update(p.id, {
          placarBranco: p.placarBranco,
          placarPreto: p.placarPreto,
          tempoDecorridoMs: tempo,
          pausada: true,
          encerradaEm: nowIso(),
          motivoFim: motivo,
          ...elencoPatch,
        });
        setPartida(encerrada);
        setSegmentStartedAt(null);
        setAmarelosAtivos([]);

        const fim = aplicarFimPartida({
          ordemChegada: s.ordemChegada,
          timeBrancoIds: times.timeBrancoIds,
          timePretoIds: times.timePretoIds,
          placarBranco: encerrada.placarBranco,
          placarPreto: encerrada.placarPreto,
          regraEmpate: pel.regraEmpate,
          jogadoresPorEquipe: n,
          ultimoVencedor: usePartidaLiveStore.getState().ultimoVencedor,
        });

        const updatedSessao = await repos.sessoes.update(s.id, {
          ordemChegada: fim.ordemChegada,
          timeBrancoIds: fim.timeBrancoIds,
          timePretoIds: fim.timePretoIds,
          status: 'aberta',
        });
        setSessao(updatedSessao);
        setMensagemFim(fim.mensagem);

        const v = vencedorDaPartida(encerrada.placarBranco, encerrada.placarPreto);
        if (v) setUltimoVencedor(v);

        // Libera a UI da próxima partida (vencedor fica + próximo time) com placar zerado.
        setPartida(null);
        setEventos([]);

        return { partida: encerrada, mensagem: fim.mensagem };
      } finally {
        endingRef.current = false;
      }
    },
    [
      repos.partidas,
      repos.sessoes,
      setAmarelosAtivos,
      setEventos,
      setMensagemFim,
      setPartida,
      setSegmentStartedAt,
      setSessao,
      setUltimoVencedor,
      tempoAtualMs,
    ],
  );

  // Auto-fim por tempo
  useEffect(() => {
    if (!partida || !pelada || partida.encerradaEm || partida.pausada || !partida.iniciadaEm) {
      return;
    }
    const limite = duracaoLimiteMs(pelada.duracaoMin);
    if (limite == null) return;
    const id = setInterval(() => {
      const ms = tempoAtualMs();
      if (ms >= limite) {
        void encerrarPartida('tempo');
      }
    }, 500);
    return () => clearInterval(id);
  }, [encerrarPartida, partida, pelada, tempoAtualMs]);

  const iniciar = useCallback(async () => {
    if (!pelada || !sessao) throw new Error('Sessão não carregada');
    const n = pelada.jogadoresPorEquipe;
    const times = resolveTimes(sessao, n);
    if (times.timeBrancoIds.length < n || times.timePretoIds.length < n) {
      throw new Error(`É preciso ${n} jogadores em cada time para iniciar.`);
    }

    let current = usePartidaLiveStore.getState().partida;
    if (current?.encerradaEm) {
      current = null;
    }

    if (!current) {
      current = await repos.partidas.create({
        peladaId: pelada.id,
        sessaoId: sessao.id,
        placarBranco: 0,
        placarPreto: 0,
        tempoDecorridoMs: 0,
        timeBrancoIds: times.timeBrancoIds,
        timePretoIds: times.timePretoIds,
        iniciadaEm: nowIso(),
        pausada: false,
        encerradaEm: null,
        motivoFim: null,
      });
      setEventos([]);
    } else if (!current.iniciadaEm) {
      current = await repos.partidas.update(current.id, {
        iniciadaEm: nowIso(),
        pausada: false,
        timeBrancoIds: times.timeBrancoIds,
        timePretoIds: times.timePretoIds,
      });
    } else if (current.pausada) {
      current = await repos.partidas.update(current.id, { pausada: false });
    } else if (
      current.timeBrancoIds.length === 0 &&
      current.timePretoIds.length === 0
    ) {
      // Partidas antigas sem snapshot: grava elenco na retomada.
      current = await repos.partidas.update(current.id, {
        timeBrancoIds: times.timeBrancoIds,
        timePretoIds: times.timePretoIds,
      });
    }

    const updatedSessao = await repos.sessoes.update(sessao.id, {
      timeBrancoIds: times.timeBrancoIds,
      timePretoIds: times.timePretoIds,
      status: 'em_partida',
    });
    setSessao(updatedSessao);
    setPartida(current);
    setSegmentStartedAt(Date.now());
    setMensagemFim(null);
  }, [
    pelada,
    repos.partidas,
    repos.sessoes,
    sessao,
    setEventos,
    setMensagemFim,
    setPartida,
    setSegmentStartedAt,
    setSessao,
  ]);

  const pausar = useCallback(async () => {
    const p = usePartidaLiveStore.getState().partida;
    if (!p || p.pausada || p.encerradaEm || !p.iniciadaEm) return;
    const tempo = tempoAtualMs();
    const updated = await repos.partidas.update(p.id, {
      pausada: true,
      tempoDecorridoMs: tempo,
    });
    setPartida(updated);
    setSegmentStartedAt(null);
  }, [repos.partidas, setPartida, setSegmentStartedAt, tempoAtualMs]);

  const maybeEndByGoals = useCallback(
    async (placarBranco: number, placarPreto: number) => {
      const limite = pelada?.limiteGols;
      if (limite == null) return false;
      if (placarBranco >= limite || placarPreto >= limite) {
        await encerrarPartida('limite_gols');
        return true;
      }
      return false;
    },
    [encerrarPartida, pelada?.limiteGols],
  );

  const marcarGol = useCallback(
    async (atletaId: string, assistenteId?: string | null) => {
      const p = usePartidaLiveStore.getState().partida;
      const s = useJogosStore.getState().sessao;
      const pel = useJogosStore.getState().pelada;
      if (!p || !s || !pel || !p.iniciadaEm || p.pausada || p.encerradaEm) {
        throw new Error('Partida não está em andamento.');
      }
      const n = pel.jogadoresPorEquipe;
      const times = resolveTimes(s, n);
      const side = sideOfAtleta(atletaId, times.timeBrancoIds, times.timePretoIds);
      if (!side) throw new Error('Atleta não está em campo.');

      let placarBranco = p.placarBranco;
      let placarPreto = p.placarPreto;
      if (side === 'branco') placarBranco += 1;
      else placarPreto += 1;

      const gol = await repos.eventos.create({
        partidaId: p.id,
        tipo: 'gol',
        atletaId,
        meta: assistenteId ? { assistenteId } : null,
      });
      if (assistenteId) {
        await repos.eventos.create({
          partidaId: p.id,
          tipo: 'assistencia',
          atletaId: assistenteId,
          meta: { observacao: `gol de ${atletaId}` },
        });
      }
      const updated = await repos.partidas.update(p.id, { placarBranco, placarPreto });
      setPartida(updated);
      const eventos = await repos.eventos.listByPartida(p.id);
      setEventos(eventos);
      void gol;
      await maybeEndByGoals(placarBranco, placarPreto);
    },
    [maybeEndByGoals, repos.eventos, repos.partidas, setEventos, setPartida],
  );

  const marcarGolContra = useCallback(
    async (atletaId: string) => {
      const p = usePartidaLiveStore.getState().partida;
      const s = useJogosStore.getState().sessao;
      const pel = useJogosStore.getState().pelada;
      if (!p || !s || !pel || !p.iniciadaEm || p.pausada || p.encerradaEm) {
        throw new Error('Partida não está em andamento.');
      }
      const n = pel.jogadoresPorEquipe;
      const times = resolveTimes(s, n);
      const side = sideOfAtleta(atletaId, times.timeBrancoIds, times.timePretoIds);
      if (!side) throw new Error('Atleta não está em campo.');

      // Gol contra credita o placar adversário
      let placarBranco = p.placarBranco;
      let placarPreto = p.placarPreto;
      if (side === 'branco') placarPreto += 1;
      else placarBranco += 1;

      await repos.eventos.create({
        partidaId: p.id,
        tipo: 'gol_contra',
        atletaId,
        meta: null,
      });
      const updated = await repos.partidas.update(p.id, { placarBranco, placarPreto });
      setPartida(updated);
      setEventos(await repos.eventos.listByPartida(p.id));
      await maybeEndByGoals(placarBranco, placarPreto);
    },
    [maybeEndByGoals, repos.eventos, repos.partidas, setEventos, setPartida],
  );

  const syncElencoPartida = useCallback(
    async (
      timeBrancoIds: string[],
      timePretoIds: string[],
    ) => {
      const p = usePartidaLiveStore.getState().partida;
      if (!p || p.encerradaEm) return;
      const updated = await repos.partidas.update(p.id, {
        timeBrancoIds,
        timePretoIds,
      });
      setPartida(updated);
    },
    [repos.partidas, setPartida],
  );

  const marcarAmarelo = useCallback(
    async (atletaId: string) => {
      const p = usePartidaLiveStore.getState().partida;
      const pel = useJogosStore.getState().pelada;
      const s = useJogosStore.getState().sessao;
      if (!p || !pel || !s || !p.iniciadaEm || p.pausada || p.encerradaEm) {
        throw new Error('Partida não está em andamento.');
      }
      const jaAmarelos = countAmarelosNaPartida(
        usePartidaLiveStore.getState().eventos,
        atletaId,
      );
      const retornaEm =
        pel.amareloDoisMinutos && jaAmarelos === 0
          ? new Date(Date.now() + AMARELO_MS).toISOString()
          : undefined;
      await repos.eventos.create({
        partidaId: p.id,
        tipo: 'amarelo',
        atletaId,
        meta: retornaEm ? { retornaEm } : null,
      });

      // Segundo amarelo na partida = vermelho automático + fim da fila.
      if (jaAmarelos >= 1) {
        await repos.eventos.create({
          partidaId: p.id,
          tipo: 'vermelho',
          atletaId,
          meta: { gravidadeVermelho: 'grave', observacao: 'segundo amarelo' },
        });
        const moved = enviarAoFimDaFila(
          s.ordemChegada,
          s.timeBrancoIds,
          s.timePretoIds,
          atletaId,
        );
        const updatedSessao = await repos.sessoes.update(s.id, {
          ...moved,
          status: 'em_partida',
        });
        setSessao(updatedSessao);
        await syncElencoPartida(moved.timeBrancoIds, moved.timePretoIds);
        setAmarelosAtivos(
          usePartidaLiveStore.getState().amarelosAtivos.filter((a) => a.atletaId !== atletaId),
        );
        setEventos(await repos.eventos.listByPartida(p.id));
        return;
      }

      setEventos(await repos.eventos.listByPartida(p.id));
      if (retornaEm) {
        const next = [
          ...usePartidaLiveStore.getState().amarelosAtivos.filter((a) => a.atletaId !== atletaId),
          { atletaId, retornaEm },
        ];
        setAmarelosAtivos(next);
      }
    },
    [repos.eventos, repos.sessoes, setAmarelosAtivos, setEventos, setSessao, syncElencoPartida],
  );

  const marcarVermelho = useCallback(
    async (atletaId: string, gravidade: 'leve' | 'grave' = 'grave') => {
      const p = usePartidaLiveStore.getState().partida;
      const s = useJogosStore.getState().sessao;
      if (!p || !s || !p.iniciadaEm || p.pausada || p.encerradaEm) {
        throw new Error('Partida não está em andamento.');
      }
      await repos.eventos.create({
        partidaId: p.id,
        tipo: 'vermelho',
        atletaId,
        meta: { gravidadeVermelho: gravidade },
      });
      const moved = enviarAoFimDaFila(
        s.ordemChegada,
        s.timeBrancoIds,
        s.timePretoIds,
        atletaId,
      );
      const updatedSessao = await repos.sessoes.update(s.id, {
        ...moved,
        status: 'em_partida',
      });
      setSessao(updatedSessao);
      await syncElencoPartida(moved.timeBrancoIds, moved.timePretoIds);
      setEventos(await repos.eventos.listByPartida(p.id));
      setAmarelosAtivos(
        usePartidaLiveStore.getState().amarelosAtivos.filter((a) => a.atletaId !== atletaId),
      );
    },
    [repos.eventos, repos.sessoes, setAmarelosAtivos, setEventos, setSessao, syncElencoPartida],
  );

  const removerJogador = useCallback(
    async (atletaId: string) => {
      const p = usePartidaLiveStore.getState().partida;
      const s = useJogosStore.getState().sessao;
      if (!s) throw new Error('Sessão não carregada.');
      if (p?.encerradaEm) throw new Error('Partida já encerrada.');

      const onField = new Set([...s.timeBrancoIds, ...s.timePretoIds]);
      if (!onField.has(atletaId)) {
        throw new Error('Atleta não está em campo.');
      }

      if (p?.iniciadaEm && !p.encerradaEm) {
        await repos.eventos.create({
          partidaId: p.id,
          tipo: 'remocao',
          atletaId,
          meta: null,
        });
        setEventos(await repos.eventos.listByPartida(p.id));
      }

      const moved = enviarAoFimDaFila(
        s.ordemChegada,
        s.timeBrancoIds,
        s.timePretoIds,
        atletaId,
      );
      const updatedSessao = await repos.sessoes.update(s.id, moved);
      setSessao(updatedSessao);
      await syncElencoPartida(moved.timeBrancoIds, moved.timePretoIds);
      setAmarelosAtivos(
        usePartidaLiveStore.getState().amarelosAtivos.filter((a) => a.atletaId !== atletaId),
      );
    },
    [repos.eventos, repos.sessoes, setAmarelosAtivos, setEventos, setSessao, syncElencoPartida],
  );

  /** Remove do time e coloca o próximo da fila de próximos no lugar (antes ou durante). */
  const substituirJogador = useCallback(
    async (atletaId: string) => {
      const p = usePartidaLiveStore.getState().partida;
      const s = useJogosStore.getState().sessao;
      if (!s) throw new Error('Sessão não carregada.');
      if (p?.encerradaEm) throw new Error('Partida já encerrada.');

      const swapped = substituirPorProximo(
        s.ordemChegada,
        s.timeBrancoIds,
        s.timePretoIds,
        atletaId,
      );
      if (!swapped) {
        throw new Error('Não há atleta na lista de próximos para entrar.');
      }

      if (p?.iniciadaEm && !p.encerradaEm) {
        await repos.eventos.create({
          partidaId: p.id,
          tipo: 'remocao',
          atletaId,
          meta: { observacao: `substituição por ${swapped.entrouId}` },
        });
        setEventos(await repos.eventos.listByPartida(p.id));
      }

      const updatedSessao = await repos.sessoes.update(s.id, {
        ordemChegada: swapped.ordemChegada,
        timeBrancoIds: swapped.timeBrancoIds,
        timePretoIds: swapped.timePretoIds,
      });
      setSessao(updatedSessao);
      await syncElencoPartida(swapped.timeBrancoIds, swapped.timePretoIds);
      setAmarelosAtivos(
        usePartidaLiveStore.getState().amarelosAtivos.filter((a) => a.atletaId !== atletaId),
      );
    },
    [repos.eventos, repos.sessoes, setAmarelosAtivos, setEventos, setSessao, syncElencoPartida],
  );

  const encerrarManual = useCallback(async () => {
    return encerrarPartida('manual');
  }, [encerrarPartida]);

  return {
    partida,
    amarelosAtivos,
    ultimoVencedor,
    segmentStartedAt,
    load,
    iniciar,
    pausar,
    marcarGol,
    marcarGolContra,
    marcarAmarelo,
    marcarVermelho,
    removerJogador,
    substituirJogador,
    encerrarManual,
    tempoAtualMs,
  };
}
