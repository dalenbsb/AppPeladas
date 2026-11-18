import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fab } from '@/components/Fab';
import { useRepositories } from '@/db/DatabaseProvider';
import type { Pelada } from '@/domain/types';
import { usePeladaStore } from '@/features/peladas/peladaStore';
import { colors } from '@/theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const repos = useRepositories();
  const setPeladas = usePeladaStore((s) => s.setPeladas);
  const [peladas, setLocalPeladas] = useState<Pelada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await repos.peladas.list();
      setLocalPeladas(list);
      setPeladas(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao listar peladas');
    } finally {
      setLoading(false);
    }
  }, [repos.peladas, setPeladas]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.brand}>AppPeladas</Text>
        <Text style={styles.subtitle}>Suas peladas neste aparelho</Text>
      </View>

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
          data={peladas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={peladas.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nenhuma pelada ainda</Text>
              <Text style={styles.emptyBody}>Toque no + para cadastrar a primeira.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.nome}>{item.nome}</Text>
                {item.descricao ? (
                  <Text style={styles.descricao} numberOfLines={2}>
                    {item.descricao}
                  </Text>
                ) : null}
              </View>
              <Pressable
                style={styles.entrar}
                onPress={() => router.push(`/pelada/${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Entrar em ${item.nome}`}
              >
                <Text style={styles.entrarText}>Entrar</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <Fab accessibilityLabel="Nova pelada" onPress={() => router.push('/pelada/nova')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 4,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.brand,
  },
  subtitle: {
    fontSize: 15,
    color: colors.brandMuted,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 96,
    gap: 10,
  },
  emptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
  emptyBody: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
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
  descricao: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  entrar: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  entrarText: {
    color: colors.onBrand,
    fontWeight: '700',
    fontSize: 14,
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
