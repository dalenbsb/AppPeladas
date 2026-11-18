import type { MelhorPe, PosicaoAtleta } from '@/domain/types';

export const POSICAO_LABELS: Record<PosicaoAtleta, string> = {
  goleiro: 'Goleiro',
  zagueiro: 'Zagueiro',
  lateral: 'Lateral',
  volante: 'Volante',
  meia: 'Meia',
  atacante: 'Atacante',
  sem_posicao: 'Sem posição',
};

export const POSICAO_OPTIONS: PosicaoAtleta[] = [
  'goleiro',
  'zagueiro',
  'lateral',
  'volante',
  'meia',
  'atacante',
  'sem_posicao',
];

export const MELHOR_PE_LABELS: Record<MelhorPe, string> = {
  direito: 'Direito',
  esquerdo: 'Esquerdo',
};

export const MELHOR_PE_OPTIONS: MelhorPe[] = ['direito', 'esquerdo'];
