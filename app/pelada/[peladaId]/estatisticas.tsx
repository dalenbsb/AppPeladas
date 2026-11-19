import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import {
  formatDayKeyBr,
  parseDayInput,
  todayLocalDayKey,
} from '@/features/historico/dateLocal';
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
  const [tab, setTab] = useState<TabKey>('totais');

  const [inicioDraft, setInicioDraft] = useState('');
  const [fimDraft, setFimDraft] = useState('');
  const [filtro, setFiltro] = useState<{
    dataInicioKey: string | null;
    dataFimKey: string | null;
  }>({ dataInicioKey: null, dataFimKey: null });
  const [filtroError, setFiltroError] = useState<string | null>(null);
  const hojeHint = formatDayKeyBr(todayLocalDayKey());

  const { data, loading, error } = useEstatisticas(peladaId, filtro);

  const onPesquisar = () => {
    const inicioRaw = inicioDraft.trim();
    const fimRaw = fimDraft.trim();
    const inicio = inicioRaw ? parseDayInput(inicioRaw) : null;
    const fim = fimRaw ? parseDayInput(fimRaw) : null;

    if (inicioRaw && !inicio) {
      setFiltroError('Data início inválida. Use DD/MM/AAAA.');
      return;
    }
    if (fimRaw && !fim) {
      setFiltroError('Data fim inválida. Use DD/MM/AAAA.');
      return;
    }
    if (inicio && fim && inicio > fim) {
      setFiltroError('Data início deve ser anterior ou igual à data fim.');
      return;
    }

    setFiltroError(null);
    setFiltro({ dataInicioKey: inicio, dataFimKey: fim });
    if (inicio) setInicioDraft(formatDayKeyBr(inicio));
    if (fim) setFimDraft(formatDayKeyBr(fim));
  };

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
      <View style={styles.filterBlock}>
        <View style={styles.filterRow}>
          <View style={styles.inputWrap}>
            <Text style={styles.fieldLabel}>Data início</Text>
            <TextInput
              style={styles.input}
              value={inicioDraft}
              onChangeText={setInicioDraft}
              placeholder="opcional"
              placeholderTextColor={colors.textMuted}
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.fieldLabel}>Data fim</Text>
            <TextInput
              style={styles.input}
              value={fimDraft}
              onChangeText={setFimDraft}
              placeholder={hojeHint}
              placeholderTextColor={colors.textMuted}
              keyboardType="numbers-and-punctuation"
              returnKeyType="search"
              onSubmitEditing={onPesquisar}
            />
          </View>
          <Pressable
            style={styles.searchBtn}
            onPress={onPesquisar}
            accessibilityRole="button"
          >
            <Text style={styles.searchBtnText}>Pesquisar</Text>
          </Pressable>
        </View>
        {filtroError ? <Text style={styles.errorInline}>{filtroError}</Text> : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
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
              <Text
                style={[styles.tabLabel, active && styles.tabLabelActive]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.content}>
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
  filterBlock: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 6,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  searchBtn: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchBtnText: {
    color: colors.onBrand,
    fontWeight: '700',
    fontSize: 13,
  },
  errorInline: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 12,
  },
  tabsScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
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
  bodyScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
