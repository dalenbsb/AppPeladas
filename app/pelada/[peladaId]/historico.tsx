import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { useRepositories } from '@/db/DatabaseProvider';
import type { Atleta, EventoPartida, Partida } from '@/domain/types';
import {
  formatDayKeyBr,
  parseDayInput,
  toLocalDayKey,
  todayLocalDayKey,
} from '@/features/historico/dateLocal';
import { HistoricoPartidaCard } from '@/features/historico/HistoricoPartidaCard';
import { colors } from '@/theme/colors';

type DayMatch = {
  partida: Partida;
  eventos: EventoPartida[];
  indexNoDia: number;
};

export default function HistoricoScreen() {
  const { peladaId } = useLocalSearchParams<{ peladaId: string }>();
  const repos = useRepositories();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [eventosByPartida, setEventosByPartida] = useState<
    Record<string, EventoPartida[]>
  >({});
  const [atletasById, setAtletasById] = useState<Record<string, Atleta>>({});

  const [dayDraft, setDayDraft] = useState(() => formatDayKeyBr(todayLocalDayKey()));
  const [dayKey, setDayKey] = useState(() => todayLocalDayKey());
  const [dayError, setDayError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const [finished, atletas] = await Promise.all([
            repos.partidas.listFinishedByPelada(peladaId),
            repos.atletas.listByPelada(peladaId),
          ]);
          if (!active) return;
          const map: Record<string, Atleta> = {};
          for (const a of atletas) map[a.id] = a;
          setAtletasById(map);
          setPartidas(finished);

          const pairs = await Promise.all(
            finished.map(async (p) => [p.id, await repos.eventos.listByPartida(p.id)] as const),
          );
          if (!active) return;
          const byId: Record<string, EventoPartida[]> = {};
          for (const [id, evs] of pairs) byId[id] = evs;
          setEventosByPartida(byId);
        } catch (err) {
          if (!active) return;
          setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [peladaId, repos.atletas, repos.eventos, repos.partidas]),
  );

  const matchesDoDia: DayMatch[] = useMemo(() => {
    const ofDay = partidas
      .filter((p) => {
        const when = p.encerradaEm ?? p.iniciadaEm ?? p.createdAt;
        return toLocalDayKey(when) === dayKey;
      })
      // Ordem cronológica do dia (jogo 1 = mais antigo)
      .slice()
      .sort((a, b) => {
        const ta = new Date(a.encerradaEm ?? a.createdAt).getTime();
        const tb = new Date(b.encerradaEm ?? b.createdAt).getTime();
        return ta - tb;
      });

    return ofDay.map((partida, index) => ({
      partida,
      eventos: eventosByPartida[partida.id] ?? [],
      indexNoDia: index + 1,
    }));
  }, [dayKey, eventosByPartida, partidas]);

  const onPesquisar = () => {
    const parsed = parseDayInput(dayDraft);
    if (!parsed) {
      setDayError('Use o formato DD/MM/AAAA (ex.: 19/11/2026).');
      return;
    }
    setDayError(null);
    setDayKey(parsed);
    setDayDraft(formatDayKeyBr(parsed));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Histórico de jogos</Text>
      <Text style={styles.hint}>Filtre pelos jogos encerrados de um dia.</Text>

      <View style={styles.searchRow}>
        <View style={styles.inputWrap}>
          <Text style={styles.fieldLabel}>Data</Text>
          <TextInput
            style={styles.input}
            value={dayDraft}
            onChangeText={setDayDraft}
            placeholder="19/11/2026"
            placeholderTextColor={colors.textMuted}
            keyboardType="numbers-and-punctuation"
            returnKeyType="search"
            onSubmitEditing={onPesquisar}
          />
        </View>
        <Pressable style={styles.searchBtn} onPress={onPesquisar} accessibilityRole="button">
          <Text style={styles.searchBtnText}>Pesquisar</Text>
        </Pressable>
      </View>
      {dayError ? <Text style={styles.errorInline}>{dayError}</Text> : null}

      <Text style={styles.dayLabel}>{formatDayKeyBr(dayKey)}</Text>

      {matchesDoDia.length === 0 ? (
        <EmptyState
          title="Nenhum jogo neste dia"
          body="Encerre partidas na aba Jogos para vê-las aqui."
        />
      ) : (
        <View style={styles.list}>
          {matchesDoDia.map((item) => (
            <HistoricoPartidaCard
              key={item.partida.id}
              indexNoDia={item.indexNoDia}
              partida={item.partida}
              atletasById={atletasById}
              eventos={item.eventos}
            />
          ))}
        </View>
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
    padding: 20,
    paddingBottom: 40,
    gap: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brand,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  searchBtn: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchBtnText: {
    color: colors.onBrand,
    fontWeight: '700',
    fontSize: 15,
  },
  errorInline: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 13,
  },
  dayLabel: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: colors.brandMuted,
  },
  list: {
    gap: 12,
    marginTop: 4,
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
});
