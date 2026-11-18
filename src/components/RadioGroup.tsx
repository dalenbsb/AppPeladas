import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

type Option<T extends string> = {
  value: T;
  label: string;
};

type RadioGroupProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (next: T) => void;
};

export function RadioGroup<T extends string>({ options, value, onChange }: RadioGroupProps<T>) {
  return (
    <View style={styles.list}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={styles.row}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View style={[styles.outer, selected && styles.outerSelected]}>
              {selected ? <View style={styles.inner} /> : null}
            </View>
            <Text style={styles.label}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  outer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.brandMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: colors.surface,
  },
  outerSelected: {
    borderColor: colors.brand,
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brand,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
