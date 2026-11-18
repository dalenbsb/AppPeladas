import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';

type FabProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  label?: string;
};

export function Fab({ onPress, accessibilityLabel = 'Adicionar', label = '+' }: FabProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.fab,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    color: colors.onBrand,
    fontSize: 28,
    fontWeight: '600',
    marginTop: -2,
  },
});
