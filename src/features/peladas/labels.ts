import type { CriterioSorteio, RegraEmpate } from '@/domain/types';

export const CRITERIO_SORTEIO_LABELS: Record<CriterioSorteio, string> = {
  ordem_chegada: 'Ordem de chegada',
  sem_sorteio: 'Sem sorteio',
  considerar_posicao: 'Considerar a posição do jogador',
  nivel_tecnico: 'Nível técnico',
};

export const CRITERIOS_SORTEIO_OPTIONS: CriterioSorteio[] = [
  'ordem_chegada',
  'sem_sorteio',
  'considerar_posicao',
  'nivel_tecnico',
];

export const REGRA_EMPATE_LABELS: Record<RegraEmpate, string> = {
  sai_os_dois: 'Empate sai os dois, quando tiver 2 times para entrar',
  penaltis: 'Empate disputa nos pênaltis',
  fica_quem_esta_ganhando: 'Empate fica quem está ganhando (mantém o time em vantagem no ciclo)',
};

export const REGRA_EMPATE_OPTIONS: RegraEmpate[] = [
  'sai_os_dois',
  'penaltis',
  'fica_quem_esta_ganhando',
];
