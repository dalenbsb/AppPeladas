import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

const APP_VERSION =
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '—';

export default function SobreScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Sobre o AppPeladas</Text>
        <Text style={styles.body}>
          O AppPeladas é um gerenciador de peladas offline: cadastre peladas e
          atletas, organize a ordem de chegada e o sorteio/fila, monte times e
          conduza a partida ao vivo com placar, gols, assistências, cartões e
          cronômetro. Consulte o histórico de jogos, estatísticas (totais,
          artilharia, assistências e cartões) e exporte ou importe backup JSON
          nas configurações de cada pelada.
        </Text>
        <Text style={styles.version}>Versão {APP_VERSION}</Text>

        <View style={styles.divider} />

        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/dm-tech-logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo DM Tech Tecnologia"
          />
        </View>

        <View style={styles.credits}>
          <Text style={styles.creditLine}>
            <Text style={styles.creditLabel}>Desenvolvedor: </Text>
            Dalembert Menezes Cruz
          </Text>
          <Text style={styles.creditLine}>
            <Text style={styles.creditLabel}>Empresa: </Text>
            DM Tech Tecnologia
          </Text>
          <Text style={styles.creditLine}>
            <Text style={styles.creditLabel}>CNPJ: </Text>
            66.530.655/0001-80
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.brand,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  version: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  logoWrap: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  logo: {
    width: '100%',
    height: 160,
  },
  credits: {
    gap: 8,
  },
  creditLine: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  creditLabel: {
    fontWeight: '700',
    color: colors.brand,
  },
});
