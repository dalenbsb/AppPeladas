import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

type NumberSelectProps = {
  label: string;
  value: number | null;
  min: number;
  max: number;
  allowClear?: boolean;
  clearLabel?: string;
  suffix?: string;
  onChange: (next: number | null) => void;
};

export function NumberSelect({
  label,
  value,
  min,
  max,
  allowClear = false,
  clearLabel = 'Não usar',
  suffix = '',
  onChange,
}: NumberSelectProps) {
  const [open, setOpen] = useState(false);
  const options: (number | null)[] = [];
  if (allowClear) options.push(null);
  for (let n = min; n <= max; n += 1) options.push(n);

  const display = value == null ? clearLabel : `${value}${suffix ? ` ${suffix}` : ''}`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={styles.trigger}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={styles.triggerText}>{display}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => (item == null ? 'clear' : String(item))}
              style={styles.list}
              renderItem={({ item }) => {
                const selected = item === value;
                const text = item == null ? clearLabel : `${item}${suffix ? ` ${suffix}` : ''}`;
                return (
                  <Pressable
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {text}
                    </Text>
                  </Pressable>
                );
              }}
            />
            <Pressable style={styles.cancel} onPress={() => setOpen(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandMuted,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerText: {
    fontSize: 16,
    color: colors.text,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 14,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingTop: 16,
    paddingBottom: 24,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.brand,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 12,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: colors.chip,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.brand,
    fontWeight: '700',
  },
  cancel: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: colors.brandMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});
