import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { CheckboxRow } from '@/components/CheckboxRow';
import { NumberSelect } from '@/components/NumberSelect';
import { RadioGroup } from '@/components/RadioGroup';
import type { CriterioSorteio } from '@/domain/types';
import { colors } from '@/theme/colors';

import { formValuesToNewPelada, validatePeladaForm, type PeladaFormValues } from './defaults';
import {
  CRITERIOS_SORTEIO_OPTIONS,
  CRITERIO_SORTEIO_LABELS,
  REGRA_EMPATE_LABELS,
  REGRA_EMPATE_OPTIONS,
} from './labels';

type PeladaFormProps = {
  initialValues: PeladaFormValues;
  submitLabel?: string;
  onSubmit: (values: ReturnType<typeof formValuesToNewPelada>) => Promise<void>;
  footer?: ReactNode;
};

export function PeladaForm({
  initialValues,
  submitLabel = 'Salvar',
  onSubmit,
  footer,
}: PeladaFormProps) {
  const [values, setValues] = useState<PeladaFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const patch = (partial: Partial<PeladaFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

  const toggleCriterio = (criterio: CriterioSorteio, checked: boolean) => {
    setValues((prev) => {
      const set = new Set(prev.criteriosSorteio);
      if (checked) set.add(criterio);
      else set.delete(criterio);
      return { ...prev, criteriosSorteio: [...set] };
    });
  };

  const handleSave = async () => {
    const validationError = validatePeladaForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit(formValuesToNewPelada(values));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.section}>Identificação</Text>
      <Text style={styles.fieldLabel}>Nome do futebol (pelada) *</Text>
      <TextInput
        style={styles.input}
        value={values.nome}
        onChangeText={(nome) => patch({ nome })}
        placeholder="Ex.: Pelada do sábado"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="sentences"
      />

      <Text style={styles.fieldLabel}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={values.descricao}
        onChangeText={(descricao) => patch({ descricao })}
        placeholder="Opcional"
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.section}>Fim de partida</Text>
      <Text style={styles.hint}>Defina duração e/ou limite de gols. Ambos podem ficar ativos.</Text>
      <NumberSelect
        label="Duração da partida"
        value={values.duracaoMin}
        min={1}
        max={60}
        allowClear
        clearLabel="Sem limite de tempo"
        suffix="min"
        onChange={(duracaoMin) => patch({ duracaoMin })}
      />
      <NumberSelect
        label="Limite de gols por equipe"
        value={values.limiteGols}
        min={1}
        max={20}
        allowClear
        clearLabel="Sem limite de gols"
        suffix="gols"
        onChange={(limiteGols) => patch({ limiteGols })}
      />

      <Text style={styles.section}>Escala</Text>
      <NumberSelect
        label="Jogadores por equipe"
        value={values.jogadoresPorEquipe}
        min={1}
        max={20}
        onChange={(jogadoresPorEquipe) => {
          if (jogadoresPorEquipe != null) patch({ jogadoresPorEquipe });
        }}
      />

      <Text style={styles.section}>Critérios para sorteio</Text>
      {CRITERIOS_SORTEIO_OPTIONS.map((criterio) => (
        <CheckboxRow
          key={criterio}
          label={CRITERIO_SORTEIO_LABELS[criterio]}
          checked={values.criteriosSorteio.includes(criterio)}
          onChange={(checked) => toggleCriterio(criterio, checked)}
        />
      ))}

      <Text style={styles.section}>Quando a partida terminar empatada</Text>
      <RadioGroup
        options={REGRA_EMPATE_OPTIONS.map((value) => ({
          value,
          label: REGRA_EMPATE_LABELS[value],
        }))}
        value={values.regraEmpate}
        onChange={(regraEmpate) => patch({ regraEmpate })}
      />

      <Text style={styles.section}>Outras opções</Text>
      <CheckboxRow
        label="Tela da partida sempre ligada"
        checked={values.telaSempreLigada}
        onChange={(telaSempreLigada) => patch({ telaSempreLigada })}
      />
      <CheckboxRow
        label="Cartão amarelo: jogador fica 2 minutos fora"
        checked={values.amareloDoisMinutos}
        onChange={(amareloDoisMinutos) => patch({ amareloDoisMinutos })}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.save, saving && styles.saveDisabled]}
        onPress={handleSave}
        disabled={saving}
        accessibilityRole="button"
      >
        {saving ? (
          <ActivityIndicator color={colors.onBrand} />
        ) : (
          <Text style={styles.saveText}>{submitLabel}</Text>
        )}
      </Pressable>

      {footer}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 10,
  },
  section: {
    marginTop: 16,
    marginBottom: 4,
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 88,
  },
  error: {
    marginTop: 8,
    color: colors.danger,
    fontWeight: '600',
  },
  save: {
    marginTop: 20,
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveDisabled: {
    opacity: 0.7,
  },
  saveText: {
    color: colors.onBrand,
    fontSize: 17,
    fontWeight: '700',
  },
});
