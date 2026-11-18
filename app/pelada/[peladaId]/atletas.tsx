import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

/** Placeholder — CRUD de atletas na Fase 3. */
export default function AtletasPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atletas</Text>
      <Text style={styles.body}>
        Em breve: lista, inclusão e edição de peladeiros desta pelada.
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
