import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import type { Atleta } from '@/domain/types';
import { AddPeladeiroModal } from '@/features/jogos/AddPeladeiroModal';
import { AtletaFilaRow } from '@/features/jogos/AtletaFilaRow';
import { FabMenu } from '@/features/jogos/FabMenu';
import { useJogosSession } from '@/features/jogos/useJogosSession';
import { colors } from '@/theme/colors';

function moveAtIndex(ids: string[], from: number, to: number): string[] {
  if (to < 0 || to >= ids.length || from === to) return ids;
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

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

  const move = useCallback(
    (from: number, to: number) => {
      const ids = fila.map((a) => a.id);
      void persistOrdem(moveAtIndex(ids, from, to));
    },
    [fila, persistOrdem],
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

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Use ↑ ↓ para reordenar a fila.</Text>
      <FlatList
        data={fila}
        keyExtractor={(item) => item.id}
        style={styles.flex}
        contentContainerStyle={fila.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Fila vazia"
            body="Toque no + para adicionar peladeiros à ordem de chegada."
          />
        }
        renderItem={({ item, index }) => (
          <AtletaFilaRow
            atleta={item}
            index={index}
            onMoveUp={index > 0 ? () => move(index, index - 1) : undefined}
            onMoveDown={index < fila.length - 1 ? () => move(index, index + 1) : undefined}
          />
        )}
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
