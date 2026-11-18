import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Atleta } from '@/domain/types';
import { AtletaFilaRow } from '@/features/jogos/AtletaFilaRow';
import { montarTimesDaFila } from '@/features/jogos/montarTimes';
import { useJogosSession } from '@/features/jogos/useJogosSession';
import { colors } from '@/theme/colors';

function TimeColumn({
  title,
  ids,
  atletasById,
  n,
}: {
  title: string;
  ids: string[];
  atletasById: Record<string, Atleta>;
  n: number;
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
        return <AtletaFilaRow key={atleta.id} atleta={atleta} />;
      })}
    </View>
  );
}

/** Esqueleto da aba Partida (Fase 4). Controles ao vivo ficam na Fase 5. */
export default function PartidaSkeletonScreen() {
  const { pelada, sessao, atletasById } = useJogosSession();
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Times em campo</Text>
      <Text style={styles.body}>
        Esqueleto da partida — Iniciar, placar ao vivo e eventos chegam na Fase 5.
      </Text>

      <View style={styles.actions}>
        <View style={[styles.btn, styles.btnDisabled]}>
          <Text style={styles.btnLabel}>Iniciar</Text>
        </View>
        <Text style={styles.soon}>Em breve</Text>
      </View>

      <View style={styles.teams}>
        <TimeColumn
          title="Camisa branco"
          ids={timeBrancoIds}
          atletasById={atletasById}
          n={n}
        />
        <TimeColumn
          title="Camisa preta"
          ids={timePretoIds}
          atletasById={atletasById}
          n={n}
        />
      </View>
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
    gap: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnLabel: {
    color: colors.onBrand,
    fontWeight: '700',
    fontSize: 15,
  },
  soon: {
    color: colors.textMuted,
    fontSize: 13,
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
