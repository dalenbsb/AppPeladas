import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useDatabase } from '@/db/DatabaseProvider';
import { usePeladaStore } from '@/features/peladas/peladaStore';
import { colors } from '@/theme/colors';

import { exportToJson, importFromJson } from './backupService';

type BackupPanelProps = {
  onImported?: () => void;
};

export function BackupPanel({ onImported }: BackupPanelProps) {
  const { db } = useDatabase();
  const bump = usePeladaStore((s) => s.bump);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    setBusy('export');
    setMessage(null);
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
        setMessage(`Backup gerado em: ${file.uri}`);
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Exportar dados AppPeladas',
        UTI: 'public.json',
      });
      setMessage('Exportação concluída.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Falha ao exportar.');
    } finally {
      setBusy(null);
    }
  };

  const runImport = async (raw: unknown) => {
    setBusy('import');
    setMessage(null);
    try {
      await importFromJson(db, raw, { confirmReplace: true });
      bump();
      setMessage('Importação concluída. Dados substituídos.');
      onImported?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Falha ao importar.');
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
      } catch {
        setMessage('Arquivo JSON inválido.');
        return;
      }

      Alert.alert(
        'Substituir todos os dados?',
        'Isso substitui todos os dados atuais pelo conteúdo do arquivo. Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Substituir',
            style: 'destructive',
            onPress: () => {
              void runImport(parsed);
            },
          },
        ],
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Falha ao escolher arquivo.');
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Backup JSON</Text>
      <Text style={styles.hint}>
        Exporte ou importe todos os dados do app. A importação substitui tudo após confirmação.
      </Text>

      <Pressable
        style={[styles.button, styles.secondary, busy && styles.disabled]}
        onPress={handleExport}
        disabled={busy != null}
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
      >
        {busy === 'import' ? (
          <ActivityIndicator color={colors.onBrand} />
        ) : (
          <Text style={styles.dangerText}>Importar dados (JSON)</Text>
        )}
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}
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
    color: colors.text,
    lineHeight: 20,
  },
});
