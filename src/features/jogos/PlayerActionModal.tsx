import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Atleta } from '@/domain/types';
import { colors } from '@/theme/colors';

type Step = 'acoes' | 'assistencia' | 'vermelho';

type Props = {
  visible: boolean;
  atleta: Atleta | null;
  colegas: Atleta[];
  amareloDoisMinutos: boolean;
  onClose: () => void;
  onGol: (atletaId: string, assistenteId?: string | null) => Promise<void>;
  onGolContra: (atletaId: string) => Promise<void>;
  onAmarelo: (atletaId: string) => Promise<void>;
  onVermelho: (atletaId: string, gravidade: 'leve' | 'grave') => Promise<void>;
  onRemover: (atletaId: string) => Promise<void>;
};

export function PlayerActionModal({
  visible,
  atleta,
  colegas,
  amareloDoisMinutos,
  onClose,
  onGol,
  onGolContra,
  onAmarelo,
  onVermelho,
  onRemover,
}: Props) {
  if (!atleta) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <PlayerActionSheet
        key={atleta.id}
        atleta={atleta}
        colegas={colegas}
        amareloDoisMinutos={amareloDoisMinutos}
        onClose={onClose}
        onGol={onGol}
        onGolContra={onGolContra}
        onAmarelo={onAmarelo}
        onVermelho={onVermelho}
        onRemover={onRemover}
      />
    </Modal>
  );
}

function PlayerActionSheet({
  atleta,
  colegas,
  amareloDoisMinutos,
  onClose,
  onGol,
  onGolContra,
  onAmarelo,
  onVermelho,
  onRemover,
}: Omit<Props, 'visible' | 'atleta'> & { atleta: Atleta }) {
  const [step, setStep] = useState<Step>('acoes');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (step === 'assistencia') return 'Quem deu a assistência?';
    if (step === 'vermelho') return 'Gravidade do vermelho';
    return atleta.nome;
  }, [atleta.nome, step]);

  const resetAndClose = () => {
    onClose();
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
      setBusy(false);
    }
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={resetAndClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {step === 'acoes' ? (
          <>
            <Action label="Marcar gol" disabled={busy} onPress={() => setStep('assistencia')} />
            <Action
              label="Gol contra"
              disabled={busy}
              onPress={() => void run(() => onGolContra(atleta.id))}
            />
            <Action
              label={
                amareloDoisMinutos ? 'Cartão amarelo (2 min fora)' : 'Cartão amarelo'
              }
              disabled={busy}
              onPress={() => void run(() => onAmarelo(atleta.id))}
            />
            <Action
              label="Cartão vermelho"
              disabled={busy}
              danger
              onPress={() => setStep('vermelho')}
            />
            <Action
              label="Remover do time"
              disabled={busy}
              danger
              onPress={() => void run(() => onRemover(atleta.id))}
            />
          </>
        ) : null}

        {step === 'assistencia' ? (
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            <Action
              label="Sem assistência"
              disabled={busy}
              onPress={() => void run(() => onGol(atleta.id, null))}
            />
            {colegas.map((c) => (
              <Action
                key={c.id}
                label={c.nome}
                disabled={busy}
                onPress={() => void run(() => onGol(atleta.id, c.id))}
              />
            ))}
            <Action label="Voltar" disabled={busy} onPress={() => setStep('acoes')} />
          </ScrollView>
        ) : null}

        {step === 'vermelho' ? (
          <>
            <Action
              label="Leve — fim da fila"
              disabled={busy}
              onPress={() => void run(() => onVermelho(atleta.id, 'leve'))}
            />
            <Action
              label="Grave — fim da fila"
              disabled={busy}
              danger
              onPress={() => void run(() => onVermelho(atleta.id, 'grave'))}
            />
            <Action label="Voltar" disabled={busy} onPress={() => setStep('acoes')} />
          </>
        ) : null}

        <Pressable style={styles.cancel} onPress={resetAndClose} disabled={busy}>
          <Text style={styles.cancelLabel}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Action({
  label,
  onPress,
  disabled,
  danger,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text style={[styles.itemLabel, danger && styles.danger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '80%',
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
    marginBottom: 8,
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
    marginBottom: 8,
  },
  list: {
    maxHeight: 320,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  itemPressed: {
    backgroundColor: colors.chip,
  },
  itemLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.brand,
  },
  danger: {
    color: colors.danger,
  },
  disabled: {
    opacity: 0.45,
  },
  cancel: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
