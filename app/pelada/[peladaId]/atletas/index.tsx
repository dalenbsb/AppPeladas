import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { useRepositories } from '@/db/DatabaseProvider';
import type { Atleta } from '@/domain/types';
import { POSICAO_LABELS } from '@/features/atletas/labels';
import { colors } from '@/theme/colors';

export default function AtletasListScreen() {
  const { peladaId } = useLocalSearchParams<{ peladaId: string }>();
  const router = useRouter();
  const repos = useRepositories();
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await repos.atletas.listByPelada(peladaId);
      setAtletas(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao listar atletas');
    } finally {
      setLoading(false);
    }
  }, [peladaId, repos.atletas]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={load}>
            <Text style={styles.retry}>Tentar de novo</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={atletas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={atletas.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <EmptyState
              title="Nenhum atleta ainda"
              body="Toque no + para incluir o primeiro peladeiro desta pelada."
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => router.push(`/pelada/${peladaId}/atletas/${item.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Editar ${item.nome}`}
            >
              {item.fotoUri ? (
                <Image source={{ uri: item.fotoUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {item.nome.trim().charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <View style={styles.rowText}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.meta}>
                  {POSICAO_LABELS[item.posicao]}
                  {item.numeroCamisa != null ? ` · #${item.numeroCamisa}` : ''}
                  {!item.ativo ? ' · Inativo' : ''}
                  {item.mensalista ? ' · Mensalista' : ''}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <Fab
        accessibilityLabel="Incluir atleta"
        onPress={() => router.push(`/pelada/${peladaId}/atletas/novo`)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 96,
    gap: 10,
  },
  emptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: colors.chip,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.chip,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  nome: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
  },
  retry: {
    color: colors.brand,
    fontWeight: '700',
  },
});
