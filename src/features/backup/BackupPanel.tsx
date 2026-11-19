import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useDatabase } from '@/db/DatabaseProvider';
import { usePeladaStore } from '@/features/peladas/peladaStore';
import { colors } from '@/theme/colors';

import { exportToJson, importFromJson } from './backupService';
import { formatBackupError } from './formatBackupError';

type BackupPanelProps = {
  onImported?: () => void;
};

type Feedback = {
  kind: 'ok' | 'error';
  text: string;
};

export function BackupPanel({ onImported }: BackupPanelProps) {
  const { db } = useDatabase();
  const bump = usePeladaStore((s) => s.bump);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleExport = async () => {
    setBusy('export');
    setFeedback(null);
    try {
      const backup = await exportToJson(db);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File(Paths.cache, `apppeladas-backup-${stamp}.json`);
      if (file.exists) {
        file.delete();
      }
      file.create();
      await file.write(JSON.stringify(backup, null, 2));

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        setFeedback({
          kind: 'ok',
          text: `Backup gerado neste aparelho:\n${file.uri}`,
        });
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Exportar dados AppPeladas',
        UTI: 'public.json',
      });
      setFeedback({ kind: 'ok', text: 'Exportação concluída. O arquivo ficou só onde você salvou.' });
    } catch (err) {
      setFeedback({ kind: 'error', text: formatBackupError(err) });
    } finally {
      setBusy(null);
    }
  };

  const runImport = async (raw: unknown) => {
    setBusy('import');
    setFeedback(null);
    try {
      await importFromJson(db, raw, { confirmReplace: true });
      bump();
      setFeedback({ kind: 'ok', text: 'Importação concluída. Todos os dados anteriores foram substituídos.' });
      onImported?.();
    } catch (err) {
      setFeedback({ kind: 'error', text: formatBackupError(err) });
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'public.json', 'text/json'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const picked = new File(asset.uri);
      const text = await picked.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        setFeedback({ kind: 'error', text: formatBackupError(err) });
        return;
      }

      Alert.alert(
        'Substituir todos os dados?',
        'Isso apaga peladas, atletas, partidas e estatísticas atuais e coloca o conteúdo do arquivo. Não dá para desfazer.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Substituir tudo',
            style: 'destructive',
            onPress: () => {
              void runImport(parsed);
            },
          },
        ],
      );
    } catch (err) {
      setFeedback({ kind: 'error', text: formatBackupError(err) });
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Backup e portabilidade</Text>
      <Text style={styles.hint}>
        Exporte ou importe o JSON completo do app. A importação substitui tudo após confirmação. Em
        caso de arquivo inválido, nada é alterado.
      </Text>
      <Text style={styles.privacy}>
        Privacidade: os dados ficam só neste aparelho. O backup não sobe para a nuvem sozinho — só
        vai para onde você salvar ou compartilhar.
      </Text>

      <Pressable
        style={[styles.button, styles.secondary, busy && styles.disabled]}
        onPress={handleExport}
        disabled={busy != null}
        accessibilityRole="button"
        accessibilityLabel="Exportar dados em JSON"
      >
        {busy === 'export' ? (
          <ActivityIndicator color={colors.brand} />
        ) : (
          <Text style={styles.secondaryText}>Exportar dados (JSON)</Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.button, styles.danger, busy && styles.disabled]}
        onPress={handleImport}
        disabled={busy != null}
        accessibilityRole="button"
        accessibilityLabel="Importar dados de JSON"
      >
        {busy === 'import' ? (
          <ActivityIndicator color={colors.onBrand} />
        ) : (
          <Text style={styles.dangerText}>Importar dados (JSON)</Text>
        )}
      </Pressable>

      {feedback ? (
        <Text
          style={[styles.message, feedback.kind === 'error' ? styles.messageError : styles.messageOk]}
          accessibilityLiveRegion="polite"
        >
          {feedback.text}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  privacy: {
    fontSize: 13,
    color: colors.brandMuted,
    lineHeight: 18,
    backgroundColor: colors.chip,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.brand,
    fontWeight: '700',
    fontSize: 15,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  dangerText: {
    color: colors.onBrand,
    fontWeight: '700',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.7,
  },
  message: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  messageOk: {
    color: colors.brandMuted,
  },
  messageError: {
    color: colors.danger,
    fontWeight: '600',
  },
});
