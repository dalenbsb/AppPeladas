import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PartidaLiveProvider } from '@/features/jogos/PartidaLiveContext';
import { PlacarHeader } from '@/features/jogos/PlacarHeader';
import {
  selectCronometroLabel,
  selectPlacarBranco,
  selectPlacarPreto,
  usePartidaLiveStore,
} from '@/features/jogos/partidaLiveStore';
import { useJogosBootstrap } from '@/features/jogos/useJogosSession';
import { colors } from '@/theme/colors';


function LivePlacarHeader({
  pelada,
}: {
  pelada: ReturnType<typeof useJogosBootstrap>['pelada'];
}) {
  const placarBranco = usePartidaLiveStore(selectPlacarBranco);
  const placarPreto = usePartidaLiveStore(selectPlacarPreto);
  const cronometro = usePartidaLiveStore(selectCronometroLabel);

  return (
    <PlacarHeader
      pelada={pelada}
      placarBranco={placarBranco}
      placarPreto={placarPreto}
      cronometro={cronometro}
    />
  );
}

export default function JogosLayout() {
  const { peladaId } = useLocalSearchParams<{ peladaId: string }>();
  const { loading, error, reload, pelada } = useJogosBootstrap(peladaId);
  const resetLive = usePartidaLiveStore((s) => s.reset);

  useEffect(() => {
    return () => {
      resetLive();
    };
  }, [peladaId, resetLive]);

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
      <PartidaLiveProvider>
        <SafeAreaView style={styles.flex} edges={['bottom']}>
          <LivePlacarHeader pelada={pelada} />
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
                tabBarLabel: 'Ordem',
                tabBarAccessibilityLabel: 'Ordem de chegada',
                tabBarIcon: ({ focused, size }) => (
                  <Ionicons
                    name="list"
                    size={size}
                    color={focused ? colors.brand : colors.textMuted}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="partida"
              options={{
                title: 'Partida',
                tabBarLabel: 'Partida',
                tabBarAccessibilityLabel: 'Partida',
                tabBarIcon: ({ focused, size }) => (
                  <Ionicons
                    name="football"
                    size={size}
                    color={focused ? colors.brand : colors.textMuted}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="proximos"
              options={{
                title: 'Próximos',
                tabBarLabel: 'Próximos',
                tabBarAccessibilityLabel: 'Próximos times',
                tabBarIcon: ({ focused, size }) => (
                  <Ionicons
                    name="people"
                    size={size}
                    color={focused ? colors.brand : colors.textMuted}
                  />
                ),
              }}
            />
          </Tabs>
        </SafeAreaView>
      </PartidaLiveProvider>
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
