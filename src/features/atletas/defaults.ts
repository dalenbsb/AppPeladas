import type { Atleta, MelhorPe, NewAtleta, PosicaoAtleta } from '@/domain/types';

export type AtletaFormValues = {
  fotoUri: string | null;
  nome: string;
  posicao: PosicaoAtleta;
  celular: string;
  dataNascimentoDisplay: string;
  ativo: boolean;
  mensalista: boolean;
  numeroCamisa: number | null;
  melhorPe: MelhorPe | null;
};

export function defaultAtletaFormValues(): AtletaFormValues {
  return {
    fotoUri: null,
    nome: '',
    posicao: 'sem_posicao',
    celular: '',
    dataNascimentoDisplay: '',
    ativo: true,
    mensalista: false,
    numeroCamisa: null,
    melhorPe: null,
  };
}

/** Converte ISO (YYYY-MM-DD) ou ISO completo para DD/MM/AAAA. */
export function isoDateToDisplay(iso: string | null): string {
  if (!iso) return '';
  const day = iso.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/** Aceita DD/MM/AAAA (com ou sem barras) e devolve YYYY-MM-DD. */
export function displayDateToIso(display: string): string | null {
  const trimmed = display.trim();
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 8) {
    return null;
  }

  const dd = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const yyyy = Number(digits.slice(4, 8));
  if (yyyy < 1900 || yyyy > 2100 || mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return null;
  }

  const date = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (
    date.getUTCFullYear() !== yyyy ||
    date.getUTCMonth() !== mm - 1 ||
    date.getUTCDate() !== dd
  ) {
    return null;
  }

  return `${String(yyyy).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

export function atletaToFormValues(atleta: Atleta): AtletaFormValues {
  return {
    fotoUri: atleta.fotoUri,
    nome: atleta.nome,
    posicao: atleta.posicao,
    celular: atleta.celular ?? '',
    dataNascimentoDisplay: isoDateToDisplay(atleta.dataNascimento),
    ativo: atleta.ativo,
    mensalista: atleta.mensalista,
    numeroCamisa: atleta.numeroCamisa,
    melhorPe: atleta.melhorPe,
  };
}

export function formValuesToNewAtleta(
  peladaId: string,
  values: AtletaFormValues,
): NewAtleta {
  return {
    peladaId,
    fotoUri: values.fotoUri,
    nome: values.nome.trim(),
    posicao: values.posicao,
    celular: values.celular.trim() ? values.celular.trim() : null,
    dataNascimento: displayDateToIso(values.dataNascimentoDisplay),
    ativo: values.ativo,
    mensalista: values.mensalista,
    numeroCamisa: values.numeroCamisa,
    melhorPe: values.melhorPe,
  };
}

export function validateAtletaForm(values: AtletaFormValues): string | null {
  if (!values.nome.trim()) {
    return 'Informe o nome do atleta.';
  }
  if (!values.posicao) {
    return 'Selecione a posição.';
  }
  if (values.dataNascimentoDisplay.trim() && !displayDateToIso(values.dataNascimentoDisplay)) {
    return 'Data de nascimento inválida. Use DD/MM/AAAA.';
  }
  if (
    values.numeroCamisa != null &&
    (values.numeroCamisa < 0 || values.numeroCamisa > 99 || !Number.isInteger(values.numeroCamisa))
  ) {
    return 'Número da camisa deve ser entre 0 e 99.';
  }
  return null;
}
