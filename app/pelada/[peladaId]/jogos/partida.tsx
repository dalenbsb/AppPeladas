import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Atleta } from '@/domain/types';
import { AtletaFilaRow } from '@/features/jogos/AtletaFilaRow';
import { formatCountdown } from '@/features/jogos/cronometro';
import { montarTimesDaFila } from '@/features/jogos/montarTimes';
import {
  selectPartidaAtiva,
  selectPartidaRodando,
  usePartidaLiveStore,
} from '@/features/jogos/partidaLiveStore';
import { usePartidaLiveApi } from '@/features/jogos/PartidaLiveContext';
import { PlayerActionModal } from '@/features/jogos/PlayerActionModal';
import { useJogosSession } from '@/features/jogos/useJogosSession';
import { REGRA_EMPATE_LABELS } from '@/features/peladas/labels';
import { colors } from '@/theme/colors';

function TimeColumn({
  title,
  ids,
  atletasById,
  n,
  amareloRestante,
  interactive,
  onPressAtleta,
}: {
  title: string;
  ids: string[];
  atletasById: Record<string, Atleta>;
  n: number;
  amareloRestante: Record<string, number>;
  interactive: boolean;
  onPressAtleta: (atleta: Atleta) => void;
}) {
  const slots = Array.from({ length: n }, (_, i) => ids[i] ?? null);
  return (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title}</Text>
      <Text style={styles.columnMeta}>
        {ids.length}/{n}
      </Text>
      {slots.map((id, index) => {
        const atleta = id ? atletasById[id] : null;
        if (!atleta) {
          return (
            <View key={`empty-${index}`} style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>Vaga {index + 1}</Text>
            </View>
          );
        }
        const restMs = amareloRestante[atleta.id];
        const badge =
          restMs != null && restMs > 0
            ? `Amarelo · volta em ${formatCountdown(restMs)}`
            : undefined;
        const row = <AtletaFilaRow atleta={atleta} badge={badge} />;
        if (!interactive) {
          return <View key={atleta.id}>{row}</View>;
        }
        return (
          <Pressable
            key={atleta.id}
            onPress={() => onPressAtleta(atleta)}
            accessibilityRole="button"
            accessibilityLabel={`Ações de ${atleta.nome}`}
          >
            {row}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function PartidaScreen() {
  const { pelada, sessao, atletasById } = useJogosSession();
  const {
    partida,
    amarelosAtivos,
    iniciar,
    pausar,
    marcarGol,
    marcarGolContra,
    marcarAmarelo,
    marcarVermelho,
    removerJogador,
    encerrarManual,
  } = usePartidaLiveApi();

  const rodando = usePartidaLiveStore(selectPartidaRodando);
  const ativa = usePartidaLiveStore(selectPartidaAtiva);
  const mensagemFim = usePartidaLiveStore((s) => s.mensagemFim);
  const setMensagemFim = usePartidaLiveStore((s) => s.setMensagemFim);
  const nowMs = usePartidaLiveStore((s) => s.nowMs);

  const [selected, setSelected] = useState<Atleta | null>(null);

  const n = pelada?.jogadoresPorEquipe ?? 5;

  const { timeBrancoIds, timePretoIds } = useMemo(() => {
    if (!sessao) return { timeBrancoIds: [] as string[], timePretoIds: [] as string[] };
    if (sessao.timeBrancoIds.length > 0 || sessao.timePretoIds.length > 0) {
      return {
        timeBrancoIds: sessao.timeBrancoIds.slice(0, n),
        timePretoIds: sessao.timePretoIds.slice(0, n),
      };
    }
    return montarTimesDaFila(sessao.ordemChegada, n);
  }, [n, sessao]);

  const amareloRestante = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of amarelosAtivos) {
      map[a.atletaId] = new Date(a.retornaEm).getTime() - nowMs;
    }
    return map;
  }, [amarelosAtivos, nowMs]);

  const colegas = useMemo(() => {
    if (!selected) return [] as Atleta[];
    const side = timeBrancoIds.includes(selected.id)
      ? timeBrancoIds
      : timePretoIds.includes(selected.id)
        ? timePretoIds
        : [];
    return side
      .filter((id) => id !== selected.id)
      .map((id) => atletasById[id])
      .filter((a): a is Atleta => Boolean(a));
  }, [atletasById, selected, timeBrancoIds, timePretoIds]);

  const onIniciar = () => {
    void iniciar().catch((err) => {
      Alert.alert('Não foi possível iniciar', err instanceof Error ? err.message : String(err));
    });
  };

  const onPausar = () => {
    void pausar().catch((err) => {
      Alert.alert('Erro ao pausar', err instanceof Error ? err.message : String(err));
    });
  };

  const onEncerrar = () => {
    Alert.alert('Encerrar partida?', 'O placar e os eventos serão gravados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Encerrar',
        style: 'destructive',
        onPress: () => {
          void encerrarManual()
            .then((result) => {
              if (result?.mensagem) {
                Alert.alert('Partida encerrada', result.mensagem);
              }
            })
            .catch((err) => {
              Alert.alert(
                'Erro ao encerrar',
                err instanceof Error ? err.message : String(err),
              );
            });
        },
      },
    ]);
  };

  const timesProntos =
    timeBrancoIds.length >= n && timePretoIds.length >= n;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Times em campo</Text>
      <Text style={styles.body}>
        {pelada
          ? `Regra de empate: ${REGRA_EMPATE_LABELS[pelada.regraEmpate]}`
          : 'Carregando…'}
      </Text>

      <View style={styles.actions}>
        {!rodando ? (
          <Pressable
            style={[styles.btn, !timesProntos && styles.btnDisabled]}
            onPress={onIniciar}
            disabled={!timesProntos}
            accessibilityRole="button"
          >
            <Text style={styles.btnLabel}>
              {ativa && partida?.pausada ? 'Retomar' : 'Iniciar'}
            </Text>
          </Pressable>
        ) : (
          <Pressable style={styles.btn} onPress={onPausar} accessibilityRole="button">
            <Text style={styles.btnLabel}>Pausar</Text>
          </Pressable>
        )}
        {ativa ? (
          <Pressable
            style={[styles.btn, styles.btnOutline]}
            onPress={onEncerrar}
            accessibilityRole="button"
          >
            <Text style={[styles.btnLabel, styles.btnOutlineLabel]}>Encerrar</Text>
          </Pressable>
        ) : null}
      </View>

      {!timesProntos ? (
        <Text style={styles.hint}>
          Monte {n} jogadores em cada time (ordem de chegada ou sorteio) para iniciar.
        </Text>
      ) : null}

      {mensagemFim ? (
        <Pressable style={styles.banner} onPress={() => setMensagemFim(null)}>
          <Text style={styles.bannerText}>{mensagemFim}</Text>
          <Text style={styles.bannerDismiss}>Toque para fechar</Text>
        </Pressable>
      ) : null}

      <View style={styles.teams}>
        <TimeColumn
          title="Camisa branco"
          ids={timeBrancoIds}
          atletasById={atletasById}
          n={n}
          amareloRestante={amareloRestante}
          interactive={rodando}
          onPressAtleta={setSelected}
        />
        <TimeColumn
          title="Camisa preta"
          ids={timePretoIds}
          atletasById={atletasById}
          n={n}
          amareloRestante={amareloRestante}
          interactive={rodando}
          onPressAtleta={setSelected}
        />
      </View>

      {rodando ? (
        <Text style={styles.hint}>Toque em um jogador para gol, cartão ou remoção.</Text>
      ) : null}

      <PlayerActionModal
        visible={Boolean(selected)}
        atleta={selected}
        colegas={colegas}
        amareloDoisMinutos={Boolean(pelada?.amareloDoisMinutos)}
        onClose={() => setSelected(null)}
        onGol={marcarGol}
        onGolContra={marcarGolContra}
        onAmarelo={marcarAmarelo}
        onVermelho={marcarVermelho}
        onRemover={removerJogador}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brand,
  },
  body: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  btn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnLabel: {
    color: colors.onBrand,
    fontWeight: '700',
    fontSize: 15,
  },
  btnOutlineLabel: {
    color: colors.brand,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  banner: {
    backgroundColor: colors.chip,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerText: {
    color: colors.brand,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  bannerDismiss: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
  },
  teams: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    gap: 4,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.brand,
  },
  columnMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  emptySlot: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  emptySlotText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
