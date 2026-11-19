import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { ColorSwatchPicker } from '@/components/ColorSwatchPicker';
import { colors } from '@/theme/colors';

type Props = {
  visible: boolean;
  title: string;
  value: string;
  blockedColor: string;
  onChange: (next: string) => void;
  onClose: () => void;
};

/** Seletor de cor da camisa (mesma paleta/regras da Configuração). */
export function TeamColorPickerModal({
  visible,
  title,
  value,
  blockedColor,
  onChange,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button">
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.hint}>
            A cor não pode ser a mesma do outro time.
          </Text>
          <ColorSwatchPicker
            label="Cor da camisa"
            value={value}
            blockedColor={blockedColor}
            onChange={(next) => {
              onChange(next);
              onClose();
            }}
          />
          <Pressable
            style={styles.cancel}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
          >
            <Text style={styles.cancelLabel}>Fechar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  cancel: {
    marginTop: 4,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelLabel: {
    color: colors.brandMuted,
    fontWeight: '700',
    fontSize: 15,
  },
});
