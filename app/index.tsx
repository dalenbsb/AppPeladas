import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { openAppDatabase } from '@/db';
import { createRepositories } from '@/db/repositories';
import {
  exportToJson,
  importFromJson,
  wipeAllData,
} from '@/features/backup/backupService';
import type { BackupJsonV1 } from '@/domain/types';

type Status = 'idle' | 'loading' | 'ok' | 'error';

/**
 * Placeholder da Fase 1 — prova DB + backup round-trip.
 * UI completa de Home/atletas/partida fica fora do escopo.
 */
export default function HomePlaceholder() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState(
    'Toque para gravar pelada fake, exportar, limpar e importar.',
  );
  const [peladaCount, setPeladaCount] = useState<number | null>(null);

  const runSmoke = useCallback(async () => {
    setStatus('loading');
    setMessage('Gravando pelada fake…');
    try {
      const db = await openAppDatabase();
      const repos = createRepositories(db);

      await wipeAllData(db);

      const pelada = await repos.peladas.create({
        nome: 'Pelada Smoke',
        descricao: 'Gerada no placeholder Fase 1',
        duracaoMin: 7,
        limiteGols: 3,
        jogadoresPorEquipe: 5,
        criteriosSorteio: ['ordem_chegada', 'considerar_posicao'],
        regraEmpate: 'sai_os_dois',
        telaSempreLigada: false,
        amareloDoisMinutos: true,
      });

      const atleta = await repos.atletas.create({
        peladaId: pelada.id,
        fotoUri: null,
        nome: 'Atleta Demo',
        posicao: 'atacante',
        celular: null,
        dataNascimento: null,
        ativo: true,
        mensalista: false,
        numeroCamisa: 9,
        melhorPe: 'esquerdo',
      });

      const exported: BackupJsonV1 = await exportToJson(db);
      setMessage('Export ok. Limpando e importando…');

      await wipeAllData(db);
      await importFromJson(db, exported, { confirmReplace: true });

      const restored = await exportToJson(db);
      const same =
        restored.peladas[0]?.id === pelada.id &&
        restored.atletas[0]?.id === atleta.id &&
        restored.peladas.length === 1;

      if (!same) {
        throw new Error('Dados restaurados não conferem.');
      }

      setPeladaCount((await repos.peladas.list()).length);
      setStatus('ok');
      setMessage('Round-trip OK: export → wipe → import.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.brand}>AppPeladas</Text>
        <Text style={styles.subtitle}>Fase 1 — scaffold, SQLite e backup JSON</Text>
        {peladaCount !== null ? (
          <Text style={styles.meta}>Peladas no banco: {peladaCount}</Text>
        ) : (
          <Text style={styles.meta}>Banco ainda não exercitado nesta sessão</Text>
        )}
        <Text style={styles.message}>{message}</Text>

        <Pressable
          style={[styles.button, status === 'loading' && styles.buttonDisabled]}
          onPress={runSmoke}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Rodar smoke no device</Text>
          )}
        </Pressable>

        {status === 'ok' ? <Text style={styles.ok}>✓ Banco e backup funcionando</Text> : null}
        {status === 'error' ? <Text style={styles.error}>Falhou — veja a mensagem</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3f6f2',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 12,
  },
  brand: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1b4332',
  },
  subtitle: {
    fontSize: 16,
    color: '#2d6a4f',
  },
  meta: {
    marginTop: 12,
    fontSize: 14,
    color: '#40916c',
  },
  message: {
    fontSize: 15,
    color: '#1b1b1b',
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#1b4332',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ok: {
    marginTop: 8,
    color: '#2d6a4f',
    fontWeight: '600',
  },
  error: {
    marginTop: 8,
    color: '#9b2226',
    fontWeight: '600',
  },
});
