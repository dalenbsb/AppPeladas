import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DatabaseProvider } from '@/db/DatabaseProvider';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTitle: 'AppPeladas',
          headerShadowVisible: false,
          headerTintColor: colors.brand,
          headerStyle: { backgroundColor: colors.bg },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'AppPeladas' }} />
        <Stack.Screen name="pelada/nova" options={{ title: 'Nova pelada' }} />
        <Stack.Screen name="pelada/[peladaId]" options={{ headerShown: false }} />
      </Stack>
    </DatabaseProvider>
  );
}
