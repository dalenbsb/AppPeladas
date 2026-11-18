import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Atleta } from '@/domain/types';
import { POSICAO_LABELS } from '@/features/atletas/labels';
import { colors } from '@/theme/colors';

type Props = {
  visible: boolean;
  atletasDisponiveis: Atleta[];
  onClose: () => void;
  onSelect: (atleta: Atleta) => void;
};

export function AddPeladeiroModal({ visible, atletasDisponiveis, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return atletasDisponiveis;
    return atletasDisponiveis.filter((a) => a.nome.toLowerCase().includes(q));
  }, [atletasDisponiveis, query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Adicionar peladeiro</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nome"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filtered.length === 0 ? styles.emptyWrap : styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {atletasDisponiveis.length === 0
                ? 'Todos os atletas ativos já estão na fila (ou não há cadastro).'
                : 'Nenhum atleta com esse nome.'}
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => {
                onSelect(item);
                setQuery('');
              }}
            >
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.meta}>{POSICAO_LABELS[item.posicao]}</Text>
            </Pressable>
          )}
        />
        <Pressable style={styles.close} onPress={onClose}>
          <Text style={styles.closeLabel}>Fechar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.brand,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  list: {
    paddingBottom: 24,
    gap: 8,
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  rowPressed: {
    backgroundColor: colors.chip,
  },
  nome: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  close: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand,
  },
});
