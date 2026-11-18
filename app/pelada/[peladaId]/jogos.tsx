import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

/** Placeholder — partida ao vivo nas Fases 4–5. */
export default function JogosPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jogos</Text>
      <Text style={styles.body}>Em breve: ordem de chegada, partida ao vivo e próximos times.</Text>
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
