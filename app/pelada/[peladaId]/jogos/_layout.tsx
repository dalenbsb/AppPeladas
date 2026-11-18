import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlacarHeader } from '@/features/jogos/PlacarHeader';
import { useJogosBootstrap } from '@/features/jogos/useJogosSession';
import { colors } from '@/theme/colors';

export default function JogosLayout() {
  const { peladaId } = useLocalSearchParams<{ peladaId: string }>();
  const { loading, error, reload, pelada } = useJogosBootstrap(peladaId);

  if (loading && !pelada) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (error && !pelada) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.retry} onPress={() => void reload()}>
          Tentar de novo
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <PlacarHeader pelada={pelada} />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.brand,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '700',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Ordem',
              tabBarAccessibilityLabel: 'Ordem de chegada',
            }}
          />
          <Tabs.Screen
            name="partida"
            options={{
              title: 'Partida',
              tabBarAccessibilityLabel: 'Partida',
            }}
          />
          <Tabs.Screen
            name="proximos"
            options={{
              title: 'Próximos',
              tabBarAccessibilityLabel: 'Próximos times',
            }}
          />
        </Tabs>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.bg,
    padding: 24,
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
  retry: {
    color: colors.brand,
    fontWeight: '700',
  },
});
