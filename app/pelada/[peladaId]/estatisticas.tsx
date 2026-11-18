import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

/** Placeholder — agregações na Fase 6. */
export default function EstatisticasPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estatísticas</Text>
      <Text style={styles.body}>
        Em breve: totais, artilharia, assistências e cartões desta pelada.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.brand,
  },
  body: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
