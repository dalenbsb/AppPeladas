import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Pressable } from 'react-native-gesture-handler';

import { EmptyState } from '@/components/EmptyState';
import type { Atleta } from '@/domain/types';
import { AtletaFilaRow } from '@/features/jogos/AtletaFilaRow';
import { montarProximosDaFila } from '@/features/jogos/montarTimes';
import { useJogosSession } from '@/features/jogos/useJogosSession';
import { colors } from '@/theme/colors';

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
    const emCampo =
      emCampoIds.length > 0 ? emCampoIds : true;
    const ids = montarProximosDaFila(sessao.ordemChegada, n, emCampo).flat();
    return ids
      .map((id) => atletasById[id])
      .filter((a): a is Atleta => Boolean(a));
  }, [atletasById, emCampoIds, n, sessao]);

  const onDragEnd = useCallback(
    ({ data }: { data: Atleta[] }) => {
      void persistProximos(data.map((a) => a.id));
    },
    [persistProximos],
  );

  const renderItem = useCallback(({ item, drag, isActive, getIndex }: RenderItemParams<Atleta>) => {
    const index = getIndex() ?? 0;
    const bloco = Math.floor(index / n) + 1;
    const posNoBloco = (index % n) + 1;
    return (
      <ScaleDecorator>
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          style={{ opacity: isActive ? 0.92 : 1 }}
        >
          <AtletaFilaRow
            atleta={item}
            index={index}
            dragHandle
            badge={`Próximo ${bloco} · vaga ${posNoBloco}`}
          />
        </Pressable>
      </ScaleDecorator>
    );
  }, [n]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Próximos times</Text>
      <Text style={styles.body}>
        Montados a partir da ordem de chegada, em blocos de {n}. Segure e arraste para
        reordenar a fila (os times em campo não mudam).
      </Text>

      <DraggableFlatList
        data={filaProximos}
        keyExtractor={(item) => item.id}
        onDragEnd={onDragEnd}
        containerStyle={styles.flex}
        contentContainerStyle={
          filaProximos.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="Nenhum time na fila"
            body="Adicione mais peladeiros na ordem de chegada para formar os próximos times."
          />
        }
        renderItem={renderItem}
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
