import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { useRepositories } from '@/db/DatabaseProvider';
import type { Pelada } from '@/domain/types';
import { colors } from '@/theme/colors';

const HUB_LINKS = [
  { key: 'atletas', title: 'Atletas', subtitle: 'Cadastro dos peladeiros' },
  { key: 'jogos', title: 'Jogos', subtitle: 'Ordem, partida e próximos times' },
  {
    key: 'estatisticas',
    title: 'Estatísticas',
    subtitle: 'Totais, gols, assistências e cartões',
  },
  {
    key: 'configuracoes',
    title: 'Configurações',
    subtitle: 'Parâmetros, exportar e importar JSON',
  },
] as const;

export default function HubScreen() {
  const { peladaId } = useLocalSearchParams<{ peladaId: string }>();
  const router = useRouter();
  const repos = useRepositories();
  const [pelada, setPelada] = useState<Pelada | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const found = await repos.peladas.getById(peladaId);
          if (!active) return;
          if (!found) {
            setError('Pelada não encontrada.');
            setPelada(null);
          } else {
            setPelada(found);
          }
        } catch (err) {
          if (!active) return;
          setError(err instanceof Error ? err.message : 'Erro ao carregar pelada');
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [peladaId, repos.peladas]),
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
    <View style={styles.container}>
      <Text style={styles.nome}>{pelada.nome}</Text>
      {pelada.descricao ? (
        <Text style={styles.descricao}>{pelada.descricao}</Text>
      ) : (
        <Text style={styles.descricao}>Escolha uma área para continuar.</Text>
      )}

      <View style={styles.links}>
        {HUB_LINKS.map((link) => (
          <Pressable
            key={link.key}
            style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
            onPress={() => router.push(`/pelada/${peladaId}/${link.key}`)}
            accessibilityRole="button"
          >
            <Text style={styles.linkTitle}>{link.title}</Text>
            <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  nome: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.brand,
  },
  descricao: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 22,
  },
  links: {
    gap: 12,
  },
  link: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 4,
  },
  linkPressed: {
    backgroundColor: colors.chip,
  },
  linkTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
  linkSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
});
