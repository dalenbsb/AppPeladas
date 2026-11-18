import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { CheckboxRow } from '@/components/CheckboxRow';
import { NumberSelect } from '@/components/NumberSelect';
import { OptionSelect } from '@/components/OptionSelect';
import { colors } from '@/theme/colors';

import {
  formValuesToNewAtleta,
  validateAtletaForm,
  type AtletaFormValues,
} from './defaults';
import {
  MELHOR_PE_LABELS,
  MELHOR_PE_OPTIONS,
  POSICAO_LABELS,
  POSICAO_OPTIONS,
} from './labels';

type AtletaFormProps = {
  peladaId: string;
  initialValues: AtletaFormValues;
  submitLabel?: string;
  onSubmit: (values: ReturnType<typeof formValuesToNewAtleta>) => Promise<void>;
  footer?: ReactNode;
};

export function AtletaForm({
  peladaId,
  initialValues,
  submitLabel = 'Salvar',
  onSubmit,
  footer,
}: AtletaFormProps) {
  const [values, setValues] = useState<AtletaFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const patch = (partial: Partial<AtletaFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para escolher a imagem.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      patch({ fotoUri: result.assets[0].uri });
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso à câmera para tirar a foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      patch({ fotoUri: result.assets[0].uri });
    }
  };

  const handlePickPhoto = () => {
    Alert.alert('Foto do atleta', 'Escolha a origem da imagem.', [
      { text: 'Câmera', onPress: () => void pickFromCamera() },
      { text: 'Galeria', onPress: () => void pickFromLibrary() },
      ...(values.fotoUri
        ? [{ text: 'Remover foto', style: 'destructive' as const, onPress: () => patch({ fotoUri: null }) }]
        : []),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    const validationError = validateAtletaForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit(formValuesToNewAtleta(peladaId, values));
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
      <Text style={styles.section}>Foto</Text>
      <Pressable
        style={styles.photoButton}
        onPress={handlePickPhoto}
        accessibilityRole="button"
        accessibilityLabel="Escolher foto"
      >
        {values.fotoUri ? (
          <Image source={{ uri: values.fotoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>Toque para adicionar foto</Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.section}>Dados</Text>
      <Text style={styles.fieldLabel}>Nome *</Text>
      <TextInput
        style={styles.input}
        value={values.nome}
        onChangeText={(nome) => patch({ nome })}
        placeholder="Nome do peladeiro"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
      />

      <OptionSelect
        label="Posição *"
        value={values.posicao}
        options={POSICAO_OPTIONS.map((value) => ({
          value,
          label: POSICAO_LABELS[value],
        }))}
        onChange={(posicao) => {
          if (posicao) patch({ posicao });
        }}
      />

      <Text style={styles.fieldLabel}>Celular</Text>
      <TextInput
        style={styles.input}
        value={values.celular}
        onChangeText={(celular) => patch({ celular })}
        placeholder="Opcional"
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
        autoComplete="tel"
      />

      <Text style={styles.fieldLabel}>Data de nascimento</Text>
      <TextInput
        style={styles.input}
        value={values.dataNascimentoDisplay}
        onChangeText={(dataNascimentoDisplay) => patch({ dataNascimentoDisplay })}
        placeholder="DD/MM/AAAA"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={10}
      />

      <CheckboxRow
        label="Ativo"
        checked={values.ativo}
        onChange={(ativo) => patch({ ativo })}
      />
      <CheckboxRow
        label="Mensalista"
        checked={values.mensalista}
        onChange={(mensalista) => patch({ mensalista })}
      />

      <NumberSelect
        label="Número da camisa"
        value={values.numeroCamisa}
        min={0}
        max={99}
        allowClear
        clearLabel="Sem número"
        onChange={(numeroCamisa) => patch({ numeroCamisa })}
      />

      <OptionSelect
        label="Melhor pé"
        value={values.melhorPe}
        options={MELHOR_PE_OPTIONS.map((value) => ({
          value,
          label: MELHOR_PE_LABELS[value],
        }))}
        allowClear
        clearLabel="Não informado"
        onChange={(melhorPe) => patch({ melhorPe })}
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
  photoButton: {
    alignSelf: 'center',
    marginBottom: 4,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.chip,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
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
