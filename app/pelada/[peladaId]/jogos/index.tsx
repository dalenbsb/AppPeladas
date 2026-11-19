import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Pressable } from 'react-native-gesture-handler';

import { EmptyState } from '@/components/EmptyState';
import type { Atleta } from '@/domain/types';
import { AddPeladeiroModal } from '@/features/jogos/AddPeladeiroModal';
import { AtletaFilaRow } from '@/features/jogos/AtletaFilaRow';
import { FabMenu } from '@/features/jogos/FabMenu';
import { useJogosSession } from '@/features/jogos/useJogosSession';
import { colors } from '@/theme/colors';

export default function OrdemChegadaScreen() {
  const {
    sessao,
    atletas,
    atletasById,
    persistOrdem,
    addAtleta,
    limparFila,
    sortear,
    refreshAtletas,
  } = useJogosSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const fila = useMemo(() => {
    if (!sessao) return [] as Atleta[];
    return sessao.ordemChegada
      .map((id) => atletasById[id])
      .filter((a): a is Atleta => Boolean(a));
  }, [atletasById, sessao]);

  const disponiveis = useMemo(() => {
    const inFila = new Set(sessao?.ordemChegada ?? []);
    return atletas.filter((a) => a.ativo && !inFila.has(a.id));
  }, [atletas, sessao?.ordemChegada]);

  const onDragEnd = useCallback(
    ({ data }: { data: Atleta[] }) => {
      void persistOrdem(data.map((a) => a.id));
    },
    [persistOrdem],
  );

  const onSortear = useCallback(() => {
    void (async () => {
      try {
        const result = await sortear();
        Alert.alert(
          'Sorteio concluído',
          result.modo === 'sequencial'
            ? 'Times montados na ordem de chegada.'
            : 'Times balanceados conforme critérios da pelada.',
        );
      } catch (err) {
        Alert.alert('Não foi possível sortear', err instanceof Error ? err.message : 'Erro');
      }
    })();
  }, [sortear]);

  const onLimpar = useCallback(() => {
    Alert.alert('Limpar a lista', 'Remover todos da ordem de chegada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: () => {
          void limparFila();
        },
      },
    ]);
  }, [limparFila]);

  const openAdd = useCallback(() => {
    void refreshAtletas().finally(() => setAddOpen(true));
  }, [refreshAtletas]);

  const renderItem = useCallback(({ item, drag, isActive, getIndex }: RenderItemParams<Atleta>) => {
    const index = getIndex() ?? 0;
    return (
      <ScaleDecorator>
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          style={{ opacity: isActive ? 0.92 : 1 }}
        >
          <AtletaFilaRow atleta={item} index={index} dragHandle />
        </Pressable>
      </ScaleDecorator>
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Segure e arraste para reordenar a fila.</Text>
      <DraggableFlatList
        data={fila}
        keyExtractor={(item) => item.id}
        onDragEnd={onDragEnd}
        containerStyle={styles.flex}
        contentContainerStyle={fila.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Fila vazia"
            body="Toque no + para adicionar peladeiros à ordem de chegada."
          />
        }
        renderItem={renderItem}
      />

      <FabMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        actions={[
          {
            key: 'add',
            label: 'Adicionar peladeiro',
            onPress: openAdd,
          },
          {
            key: 'sorteio',
            label: 'Realizar sorteio dos times',
            onPress: onSortear,
          },
          {
            key: 'limpar',
            label: 'Limpar a lista',
            onPress: onLimpar,
            danger: true,
          },
        ]}
      />

      <AddPeladeiroModal
        visible={addOpen}
        atletasDisponiveis={disponiveis}
        onClose={() => setAddOpen(false)}
        onSelect={(atleta) => {
          void addAtleta(atleta.id);
          setAddOpen(false);
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
  hint: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 96,
  },
  emptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
});
