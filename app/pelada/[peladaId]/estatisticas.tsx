import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import {
  ArtilhariaTab,
  AssistenciasTab,
  CartoesTab,
  TotaisTab,
} from '@/features/estatisticas/EstatisticasViews';
import { useEstatisticas } from '@/features/estatisticas/useEstatisticas';
import { colors } from '@/theme/colors';

const TABS = [
  { key: 'totais', label: 'Totais' },
  { key: 'artilharia', label: 'Artilharia' },
  { key: 'assistencias', label: 'Assistências' },
  { key: 'cartoes', label: 'Cartões' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function EstatisticasScreen() {
  const { peladaId } = useLocalSearchParams<{ peladaId: string }>();
  const { data, loading, error } = useEstatisticas(peladaId);
  const [tab, setTab] = useState<TabKey>('totais');

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <EmptyState
          title="Não foi possível carregar"
          body={error ?? 'Tente novamente em instantes.'}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {TABS.map((item) => {
          const active = item.key === tab;
          return (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'totais' && <TotaisTab data={data} />}
        {tab === 'artilharia' && <ArtilhariaTab rows={data.artilharia} />}
        {tab === 'assistencias' && <AssistenciasTab rows={data.assistencias} />}
        {tab === 'cartoes' && <CartoesTab rows={data.cartoes} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.bg,
  },
  tabs: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand,
  },
  tabLabelActive: {
    color: colors.onBrand,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
