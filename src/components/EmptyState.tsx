import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

type EmptyStateProps = {
  title: string;
  body: string;
};

/** Estado vazio consistente nas listas do app. */
export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
