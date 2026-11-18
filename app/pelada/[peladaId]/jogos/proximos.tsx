import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Atleta } from '@/domain/types';
import { AtletaFilaRow } from '@/features/jogos/AtletaFilaRow';
import { montarProximosDaFila } from '@/features/jogos/montarTimes';
import { useJogosSession } from '@/features/jogos/useJogosSession';
import { colors } from '@/theme/colors';

export default function ProximosTimesScreen() {
  const { pelada, sessao, atletasById } = useJogosSession();
  const n = pelada?.jogadoresPorEquipe ?? 5;

  const blocos = useMemo(() => {
    if (!sessao) return [] as string[][];
    return montarProximosDaFila(sessao.ordemChegada, n, true);
  }, [n, sessao]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Próximos times</Text>
      <Text style={styles.body}>
        Montados a partir da ordem de chegada, em blocos de {n} (após os dois times em campo).
      </Text>

      {blocos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nenhum time na fila</Text>
          <Text style={styles.emptyBody}>
            Adicione mais peladeiros na ordem de chegada para formar os próximos times.
          </Text>
        </View>
      ) : (
        blocos.map((ids, blocoIndex) => (
          <View key={`bloco-${blocoIndex}`} style={styles.bloco}>
            <Text style={styles.blocoTitle}>Próximo {blocoIndex + 1}</Text>
            <Text style={styles.blocoMeta}>
              {ids.length}/{n} jogadores
            </Text>
            {ids.map((id) => {
              const atleta = atletasById[id] as Atleta | undefined;
              if (!atleta) return null;
              return <AtletaFilaRow key={id} atleta={atleta} />;
            })}
            {ids.length < n
              ? Array.from({ length: n - ids.length }, (_, i) => (
                  <View key={`vaga-${blocoIndex}-${i}`} style={styles.vaga}>
                    <Text style={styles.vagaText}>Vaga</Text>
                  </View>
                ))
              : null}
          </View>
        ))
      )}
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
  empty: {
    marginTop: 32,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.brand,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  bloco: {
    marginTop: 8,
    marginBottom: 12,
  },
  blocoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brand,
  },
  blocoMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  vaga: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  vagaText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
