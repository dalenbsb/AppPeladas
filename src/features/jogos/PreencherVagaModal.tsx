import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Atleta } from '@/domain/types';
import { colors } from '@/theme/colors';

import { MSG_PREENCHER_VAGA_VENCEDOR } from './fimPartida';

type Props = {
  visible: boolean;
  /** Atletas na lista de próximos (ordem da fila). */
  proximos: Atleta[];
  busy?: boolean;
  error?: string | null;
  onSelect: (atletaId: string) => void;
};

/**
 * Passo bloqueante pós-partida: vencedor incompleto escolhe quem entra na última vaga
 * antes de montar o time adversário.
 */
export function PreencherVagaModal({
  visible,
  proximos,
  busy = false,
  error = null,
  onSelect,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Substituir vaga</Text>
          <Text style={styles.body}>{MSG_PREENCHER_VAGA_VENCEDOR}</Text>
          <Text style={styles.hint}>
            Escolha quem entra na última vaga do time que ficou. Só depois o próximo time adversário
            será montado.
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {proximos.length === 0 ? (
            <Text style={styles.empty}>Ninguém na lista de próximos.</Text>
          ) : (
            <ScrollView
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              accessibilityLabel="Lista de próximos"
            >
              {proximos.map((a, index) => (
                <Pressable
                  key={a.id}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                    busy && styles.disabled,
                  ]}
                  onPress={() => onSelect(a.id)}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={`Escolher ${a.nome}`}
                >
                  <Text style={styles.itemLabel}>{a.nome}</Text>
                  <Text style={styles.itemMeta}>Próximo · {index + 1}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '80%',
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
    marginBottom: 4,
  },
  body: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.brand,
    lineHeight: 22,
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
    marginBottom: 8,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    paddingVertical: 16,
  },
  list: {
    maxHeight: 360,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemPressed: {
    backgroundColor: colors.chip,
  },
  itemLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.brand,
    flex: 1,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  disabled: {
    opacity: 0.45,
  },
});
