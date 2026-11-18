import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { useRepositories } from '@/db/DatabaseProvider';
import type { Atleta } from '@/domain/types';
import { AtletaForm } from '@/features/atletas/AtletaForm';
import { atletaToFormValues } from '@/features/atletas/defaults';
import { colors } from '@/theme/colors';

export default function EditarAtletaScreen() {
  const { peladaId, atletaId } = useLocalSearchParams<{
    peladaId: string;
    atletaId: string;
  }>();
  const router = useRouter();
  const repos = useRepositories();
  const [atleta, setAtleta] = useState<Atleta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const found = await repos.atletas.getById(atletaId);
      if (!found || found.peladaId !== peladaId) {
        setError('Atleta não encontrado.');
        setAtleta(null);
      } else {
        setAtleta(found);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar atleta');
    } finally {
      setLoading(false);
    }
  }, [atletaId, peladaId, repos.atletas]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const confirmDelete = () => {
    Alert.alert(
      'Excluir atleta',
      `Tem certeza que deseja excluir ${atleta?.nome ?? 'este atleta'}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => void handleDelete(),
        },
      ],
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await repos.atletas.delete(atletaId);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (error || !atleta) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? 'Atleta não encontrado.'}</Text>
      </View>
    );
  }

  return (
    <AtletaForm
      key={atleta.updatedAt}
      peladaId={peladaId}
      initialValues={atletaToFormValues(atleta)}
      submitLabel="Salvar"
      onSubmit={async (values) => {
        await repos.atletas.update(atleta.id, values);
        router.back();
      }}
      footer={
        <Pressable
          style={[styles.delete, deleting && styles.deleteDisabled]}
          onPress={confirmDelete}
          disabled={deleting}
          accessibilityRole="button"
        >
          {deleting ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <Text style={styles.deleteText}>Excluir</Text>
          )}
        </Pressable>
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
  delete: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  deleteDisabled: {
    opacity: 0.7,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 17,
    fontWeight: '700',
  },
});
