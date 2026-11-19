import { StyleSheet, Text, View } from 'react-native';

import type { Pelada } from '@/domain/types';
import { colors } from '@/theme/colors';

type Props = {
  pelada: Pelada | null;
  placarBranco?: number;
  placarPreto?: number;
  cronometro?: string;
};

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

  return (
    <View style={styles.wrap}>
      <View style={styles.placarRow}>
        <Text style={styles.side}>Camisa branco</Text>
        <Text style={styles.score}>
          {placarBranco} × {placarPreto}
        </Text>
        <Text style={[styles.side, styles.sideRight]}>Camisa preta</Text>
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
  side: {
    flex: 1,
    color: colors.onBrand,
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  sideRight: {
    textAlign: 'right',
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
