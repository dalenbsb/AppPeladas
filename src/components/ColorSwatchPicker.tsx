import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SHIRT_COLOR_PRESETS, isLightColor } from '@/domain/teamColors';
import { colors } from '@/theme/colors';

type Props = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  /** Cor bloqueada (do outro time) — não selecionável. */
  blockedColor?: string;
};

export function ColorSwatchPicker({ label, value, onChange, blockedColor }: Props) {
  const selected = value.toUpperCase();
  const blocked = blockedColor?.toUpperCase();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.preview,
            { backgroundColor: selected },
            isLightColor(selected) && styles.previewBorder,
          ]}
          accessibilityLabel={`Cor selecionada ${selected}`}
        />
      </View>
      <View style={styles.row}>
        {SHIRT_COLOR_PRESETS.map((hex) => {
          const upper = hex.toUpperCase();
          const isSelected = upper === selected;
          const isBlocked = blocked != null && upper === blocked && !isSelected;
          return (
            <Pressable
              key={hex}
              style={[
                styles.swatch,
                { backgroundColor: hex },
                isLightColor(hex) && styles.swatchBorder,
                isSelected && styles.swatchSelected,
                isBlocked && styles.swatchBlocked,
              ]}
              onPress={() => {
                if (!isBlocked) onChange(hex);
              }}
              disabled={isBlocked}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: isBlocked }}
              accessibilityLabel={`Cor ${hex}${isBlocked ? ' (já usada pelo outro time)' : ''}`}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandMuted,
  },
  preview: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  previewBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  swatchBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: colors.brand,
  },
  swatchBlocked: {
    opacity: 0.28,
  },
});
