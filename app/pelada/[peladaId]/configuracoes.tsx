import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { useRepositories } from '@/db/DatabaseProvider';
import type { Pelada } from '@/domain/types';
import { BackupPanel } from '@/features/backup/BackupPanel';
import { peladaToFormValues } from '@/features/peladas/defaults';
import { PeladaForm } from '@/features/peladas/PeladaForm';
import { usePeladaStore } from '@/features/peladas/peladaStore';
import { colors } from '@/theme/colors';

export default function ConfiguracoesScreen() {
  const { peladaId } = useLocalSearchParams<{ peladaId: string }>();
  const router = useRouter();
  const repos = useRepositories();
  const bump = usePeladaStore((s) => s.bump);
  const [pelada, setPelada] = useState<Pelada | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const found = await repos.peladas.getById(peladaId);
      if (!found) {
        setError('Pelada não encontrada.');
        setPelada(null);
      } else {
        setPelada(found);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [peladaId, repos.peladas]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (error || !pelada) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? 'Pelada não encontrada.'}</Text>
      </View>
    );
  }

  return (
    <PeladaForm
      key={pelada.updatedAt}
      initialValues={peladaToFormValues(pelada)}
      submitLabel="Salvar parâmetros"
      onSubmit={async (values) => {
        await repos.peladas.update(pelada.id, values);
        bump();
        await reload();
      }}
      footer={
        <BackupPanel
          onImported={() => {
            router.replace('/');
          }}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
});
