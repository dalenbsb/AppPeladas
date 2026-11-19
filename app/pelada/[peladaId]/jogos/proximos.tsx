import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import type { Atleta } from '@/domain/types';
import { AtletaFilaRow } from '@/features/jogos/AtletaFilaRow';
import { montarProximosDaFila } from '@/features/jogos/montarTimes';
import { useJogosSession } from '@/features/jogos/useJogosSession';
import { colors } from '@/theme/colors';

function moveAtIndex(ids: string[], from: number, to: number): string[] {
  if (to < 0 || to >= ids.length || from === to) return ids;
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function ProximosTimesScreen() {
  const { pelada, sessao, atletasById, persistProximos } = useJogosSession();
  const n = pelada?.jogadoresPorEquipe ?? 5;

  const emCampoIds = useMemo(() => {
    if (!sessao) return [] as string[];
    if (sessao.timeBrancoIds.length > 0 || sessao.timePretoIds.length > 0) {
      return [...sessao.timeBrancoIds, ...sessao.timePretoIds];
    }
    return [];
  }, [sessao]);

  const filaProximos = useMemo(() => {
    if (!sessao) return [] as Atleta[];
    const emCampo = emCampoIds.length > 0 ? emCampoIds : true;
    const ids = montarProximosDaFila(sessao.ordemChegada, n, emCampo).flat();
    return ids
      .map((id) => atletasById[id])
      .filter((a): a is Atleta => Boolean(a));
  }, [atletasById, emCampoIds, n, sessao]);

  const move = useCallback(
    (from: number, to: number) => {
      const ids = filaProximos.map((a) => a.id);
      void persistProximos(moveAtIndex(ids, from, to));
    },
    [filaProximos, persistProximos],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Próximos times</Text>
      <Text style={styles.body}>
        Montados a partir da ordem de chegada, em blocos de {n}. Use ↑ ↓ para reordenar a fila (os
        times em campo não mudam).
      </Text>

      <FlatList
        data={filaProximos}
        keyExtractor={(item) => item.id}
        style={styles.flex}
        contentContainerStyle={
          filaProximos.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="Nenhum time na fila"
            body="Adicione mais peladeiros na ordem de chegada para formar os próximos times."
          />
        }
        renderItem={({ item, index }) => {
          const bloco = Math.floor(index / n) + 1;
          const posNoBloco = (index % n) + 1;
          return (
            <AtletaFilaRow
              atleta={item}
              index={index}
              badge={`Próximo ${bloco} · vaga ${posNoBloco}`}
              onMoveUp={index > 0 ? () => move(index, index - 1) : undefined}
              onMoveDown={
                index < filaProximos.length - 1 ? () => move(index, index + 1) : undefined
              }
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brand,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  body: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
});
