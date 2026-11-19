import { StyleSheet, Text, View } from 'react-native';

import { isLightColor } from '@/domain/teamColors';
import type { Atleta, EventoPartida, Partida } from '@/domain/types';
import { TIME_UI_LABELS } from '@/features/peladas/teamLabels';
import { colors } from '@/theme/colors';

type Props = {
  indexNoDia: number;
  partida: Partida;
  atletasById: Record<string, Atleta>;
  eventos: EventoPartida[];
};

type AthleteMarks = {
  gols: number;
  amarelos: number;
  vermelhos: number;
};

function marksForAtleta(
  atletaId: string,
  eventos: EventoPartida[],
): AthleteMarks {
  let gols = 0;
  let amarelos = 0;
  let vermelhos = 0;
  for (const ev of eventos) {
    if (ev.atletaId !== atletaId) continue;
    if (ev.tipo === 'gol' || ev.tipo === 'gol_contra') gols += 1;
    if (ev.tipo === 'amarelo') amarelos += 1;
    if (ev.tipo === 'vermelho') vermelhos += 1;
  }
  return { gols, amarelos, vermelhos };
}

function TeamHeader({ label, color, score }: { label: string; color: string; score: number }) {
  return (
    <View style={styles.teamHeader}>
      <View
        style={[
          styles.swatch,
          { backgroundColor: color },
          isLightColor(color) && styles.swatchLight,
        ]}
      />
      <Text style={styles.teamName} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.teamScore}>{score}</Text>
    </View>
  );
}

function AthleteLine({
  atleta,
  marks,
}: {
  atleta: Atleta | undefined;
  marks: AthleteMarks;
}) {
  if (!atleta) {
    return (
      <Text style={styles.athleteMissing}>—</Text>
    );
  }
  return (
    <View style={styles.athleteRow}>
      <Text style={styles.athleteName} numberOfLines={1}>
        {atleta.nome}
      </Text>
      <View style={styles.marks}>
        {Array.from({ length: marks.gols }, (_, i) => (
          <View key={`g${i}`} style={styles.ball} accessibilityLabel="Gol" />
        ))}
        {Array.from({ length: marks.amarelos }, (_, i) => (
          <View
            key={`a${i}`}
            style={styles.cardYellow}
            accessibilityLabel="Cartão amarelo"
          />
        ))}
        {Array.from({ length: marks.vermelhos }, (_, i) => (
          <View
            key={`v${i}`}
            style={styles.cardRed}
            accessibilityLabel="Cartão vermelho"
          />
        ))}
      </View>
    </View>
  );
}

export function HistoricoPartidaCard({
  indexNoDia,
  partida,
  atletasById,
  eventos,
}: Props) {
  const ids1 = partida.timeBrancoIds;
  const ids2 = partida.timePretoIds;
  const maxRows = Math.max(ids1.length, ids2.length, 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Jogo {indexNoDia}: {TIME_UI_LABELS.branco}{' '}
        <Text style={styles.scoreInline}>
          {partida.placarBranco} × {partida.placarPreto}
        </Text>{' '}
        {TIME_UI_LABELS.preto}
      </Text>

      <View style={styles.scoreRow}>
        <TeamHeader
          label={TIME_UI_LABELS.branco}
          color={partida.corTime1}
          score={partida.placarBranco}
        />
        <Text style={styles.vs}>×</Text>
        <TeamHeader
          label={TIME_UI_LABELS.preto}
          color={partida.corTime2}
          score={partida.placarPreto}
        />
      </View>

      <View style={styles.columns}>
        <View style={styles.column}>
          {Array.from({ length: maxRows }, (_, i) => {
            const id = ids1[i];
            return (
              <AthleteLine
                key={id ?? `t1-${i}`}
                atleta={id ? atletasById[id] : undefined}
                marks={id ? marksForAtleta(id, eventos) : { gols: 0, amarelos: 0, vermelhos: 0 }}
              />
            );
          })}
        </View>
        <View style={styles.column}>
          {Array.from({ length: maxRows }, (_, i) => {
            const id = ids2[i];
            return (
              <AthleteLine
                key={id ?? `t2-${i}`}
                atleta={id ? atletasById[id] : undefined}
                marks={id ? marksForAtleta(id, eventos) : { gols: 0, amarelos: 0, vermelhos: 0 }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brand,
  },
  scoreInline: {
    fontWeight: '800',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  swatchLight: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamName: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  teamScore: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brand,
  },
  vs: {
    fontWeight: '700',
    color: colors.textMuted,
  },
  columns: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
    gap: 6,
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 22,
  },
  athleteName: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  athleteMissing: {
    fontSize: 13,
    color: colors.textMuted,
    minHeight: 22,
  },
  marks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  ball: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.brandMuted,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  cardYellow: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#F4D35E',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C9A227',
  },
  cardRed: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.danger,
  },
});
