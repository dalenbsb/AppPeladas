import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fab } from '@/components/Fab';
import { colors } from '@/theme/colors';

export type FabMenuAction = {
  key: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: FabMenuAction[];
};

export function FabMenu({ open, onOpenChange, actions }: Props) {
  return (
    <>
      <Fab
        accessibilityLabel="Ações da ordem de chegada"
        onPress={() => onOpenChange(true)}
      />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => onOpenChange(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => onOpenChange(false)} />
          <View style={styles.sheet}>
            <Text style={styles.title}>Ações</Text>
            {actions.map((action) => (
              <Pressable
                key={action.key}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                onPress={() => {
                  onOpenChange(false);
                  action.onPress();
                }}
                accessibilityRole="button"
              >
                <Text style={[styles.itemLabel, action.danger && styles.danger]}>{action.label}</Text>
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [styles.cancel, pressed && styles.itemPressed]}
              onPress={() => onOpenChange(false)}
            >
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  itemPressed: {
    backgroundColor: colors.chip,
  },
  itemLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.brand,
  },
  danger: {
    color: colors.danger,
  },
  cancel: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
