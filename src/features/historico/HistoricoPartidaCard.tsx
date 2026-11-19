import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

function TeamHeader({
  label,
  color,
  score,
  winner,
}: {
  label: string;
  color: string;
  score: number;
  winner: boolean;
}) {
  return (
    <View style={styles.teamHeader}>
      <View style={styles.teamTitleRow}>
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
        {winner ? (
          <Ionicons
            name="trophy"
            size={14}
            color="#C9A227"
            accessibilityLabel="Vencedor"
          />
        ) : null}
      </View>
      <Text style={styles.placarLabel}>placar</Text>
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
    return <Text style={styles.athleteMissing}>—</Text>;
  }
  return (
    <View style={styles.athleteRow}>
      <Text style={styles.athleteName} numberOfLines={1}>
        {atleta.nome}
      </Text>
      <View style={styles.marks}>
        {Array.from({ length: marks.gols }, (_, i) => (
          <Ionicons
            key={`g${i}`}
            name="football"
            size={12}
            color={colors.brand}
            accessibilityLabel="Gol"
          />
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
  const winnerSide =
    partida.placarBranco > partida.placarPreto
      ? 'branco'
      : partida.placarPreto > partida.placarBranco
        ? 'preto'
        : null;

  return (
    <View style={styles.card}>
      <View style={styles.titleBand}>
        <Text style={styles.title}>Jogo {indexNoDia}</Text>
      </View>

      <View style={styles.scoreRow}>
        <TeamHeader
          label={TIME_UI_LABELS.branco}
          color={partida.corTime1}
          score={partida.placarBranco}
          winner={winnerSide === 'branco'}
        />
        <View style={styles.divider} />
        <TeamHeader
          label={TIME_UI_LABELS.preto}
          color={partida.corTime2}
          score={partida.placarPreto}
          winner={winnerSide === 'preto'}
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
                marks={
                  id
                    ? marksForAtleta(id, eventos)
                    : { gols: 0, amarelos: 0, vermelhos: 0 }
                }
              />
            );
          })}
        </View>
        <View style={styles.dividerTall} />
        <View style={styles.column}>
          {Array.from({ length: maxRows }, (_, i) => {
            const id = ids2[i];
            return (
              <AthleteLine
                key={id ?? `t2-${i}`}
                atleta={id ? atletasById[id] : undefined}
                marks={
                  id
                    ? marksForAtleta(id, eventos)
                    : { gols: 0, amarelos: 0, vermelhos: 0 }
                }
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
    overflow: 'hidden',
  },
  titleBand: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.brand,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 8,
  },
  teamHeader: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  teamTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    maxWidth: '100%',
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
    fontWeight: '700',
    color: colors.text,
  },
  placarLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  teamScore: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brand,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 6,
    alignSelf: 'stretch',
  },
  dividerTall: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 6,
    alignSelf: 'stretch',
  },
  columns: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 8,
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
  cardYellow: {
    width: 10,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#F4D35E',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C9A227',
  },
  cardRed: {
    width: 10,
    height: 14,
    borderRadius: 2,
    backgroundColor: colors.danger,
  },
});
