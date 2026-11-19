import { StyleSheet, Text, View } from 'react-native';

import { isLightColor } from '@/domain/teamColors';
import type { Pelada } from '@/domain/types';
import { TIME_UI_LABELS } from '@/features/peladas/teamLabels';
import { colors } from '@/theme/colors';

type Props = {
  pelada: Pelada | null;
  placarBranco?: number;
  placarPreto?: number;
  cronometro?: string;
};

function TeamLabel({ name, color }: { name: string; color: string }) {
  return (
    <View style={styles.sideWrap}>
      <View
        style={[
          styles.swatch,
          { backgroundColor: color },
          isLightColor(color) && styles.swatchLight,
        ]}
      />
      <Text style={styles.side}>{name}</Text>
    </View>
  );
}

/** Cabeçalho permanente da tela Jogos — placar e cronômetro ao vivo. */
export function PlacarHeader({
  pelada,
  placarBranco = 0,
  placarPreto = 0,
  cronometro = '00:00',
}: Props) {
  const metaParts: string[] = [];
  if (pelada) {
    metaParts.push(`${pelada.jogadoresPorEquipe} por time`);
    if (pelada.duracaoMin != null) metaParts.push(`${pelada.duracaoMin} min`);
    if (pelada.limiteGols != null) metaParts.push(`limite ${pelada.limiteGols} gols`);
  }

  const cor1 = pelada?.corTime1 ?? '#FFFFFF';
  const cor2 = pelada?.corTime2 ?? '#111111';

  return (
    <View style={styles.wrap}>
      <View style={styles.placarRow}>
        <TeamLabel name={TIME_UI_LABELS.branco} color={cor1} />
        <Text style={styles.score}>
          {placarBranco} × {placarPreto}
        </Text>
        <View style={styles.sideRight}>
          <TeamLabel name={TIME_UI_LABELS.preto} color={cor2} />
        </View>
      </View>
      <Text style={styles.timer}>{cronometro}</Text>
      {metaParts.length > 0 ? <Text style={styles.meta}>{metaParts.join(' · ')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  placarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sideWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  swatchLight: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  side: {
    color: colors.onBrand,
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  score: {
    color: colors.onBrand,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timer: {
    textAlign: 'center',
    color: colors.onBrand,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  meta: {
    textAlign: 'center',
    color: colors.onBrand,
    opacity: 0.75,
    fontSize: 12,
  },
});
