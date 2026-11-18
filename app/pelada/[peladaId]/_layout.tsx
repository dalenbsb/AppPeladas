import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';

export default function PeladaLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.brand,
        headerStyle: { backgroundColor: colors.bg },
        contentStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Hub da pelada' }} />
      <Stack.Screen name="atletas" options={{ title: 'Atletas' }} />
      <Stack.Screen name="jogos" options={{ title: 'Jogos' }} />
      <Stack.Screen name="estatisticas" options={{ title: 'Estatísticas' }} />
      <Stack.Screen name="configuracoes" options={{ title: 'Configurações' }} />
    </Stack>
  );
}
