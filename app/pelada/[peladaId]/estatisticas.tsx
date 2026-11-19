import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/theme/colors';

/** Placeholder — agregações na Fase 6 (Totais, Artilharia, Assistências, Cartões). */
export default function EstatisticasPlaceholder() {
  return (
    <View style={styles.container}>
      <EmptyState
        title="Estatísticas em breve"
        body="Totais, artilharia, assistências e cartões desta pelada entram na próxima entrega. Enquanto isso, a partida ao vivo já grava os eventos."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
