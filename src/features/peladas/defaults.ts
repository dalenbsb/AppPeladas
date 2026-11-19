import { DEFAULT_COR_TIME1, DEFAULT_COR_TIME2, coresIguais } from '@/domain/teamColors';
import type { NewPelada, Pelada } from '@/domain/types';

export type PeladaFormValues = {
  nome: string;
  descricao: string;
  duracaoMin: number | null;
  limiteGols: number | null;
  jogadoresPorEquipe: number;
  criteriosSorteio: NewPelada['criteriosSorteio'];
  regraEmpate: NewPelada['regraEmpate'];
  telaSempreLigada: boolean;
  amareloMinutosFora: number;
  corTime1: string;
  corTime2: string;
};

export function defaultPeladaFormValues(): PeladaFormValues {
  return {
    nome: '',
    descricao: '',
    duracaoMin: 10,
    limiteGols: null,
    jogadoresPorEquipe: 5,
    criteriosSorteio: ['ordem_chegada'],
    regraEmpate: 'sai_os_dois',
    telaSempreLigada: true,
    amareloMinutosFora: 2,
    corTime1: DEFAULT_COR_TIME1,
    corTime2: DEFAULT_COR_TIME2,
  };
}

export function peladaToFormValues(pelada: Pelada): PeladaFormValues {
  return {
    nome: pelada.nome,
    descricao: pelada.descricao ?? '',
    duracaoMin: pelada.duracaoMin,
    limiteGols: pelada.limiteGols,
    jogadoresPorEquipe: pelada.jogadoresPorEquipe,
    criteriosSorteio: [...pelada.criteriosSorteio],
    regraEmpate: pelada.regraEmpate,
    telaSempreLigada: pelada.telaSempreLigada,
    amareloMinutosFora: pelada.amareloMinutosFora,
    corTime1: pelada.corTime1,
    corTime2: pelada.corTime2,
  };
}

export function formValuesToNewPelada(values: PeladaFormValues): NewPelada {
  const nome = values.nome.trim();
  return {
    nome,
    descricao: values.descricao.trim() ? values.descricao.trim() : null,
    duracaoMin: values.duracaoMin,
    limiteGols: values.limiteGols,
    jogadoresPorEquipe: values.jogadoresPorEquipe,
    criteriosSorteio: values.criteriosSorteio,
    regraEmpate: values.regraEmpate,
    telaSempreLigada: values.telaSempreLigada,
    amareloMinutosFora: values.amareloMinutosFora,
    corTime1: values.corTime1,
    corTime2: values.corTime2,
  };
}

export function validatePeladaForm(values: PeladaFormValues): string | null {
  if (!values.nome.trim()) {
    return 'Informe o nome da pelada.';
  }
  if (values.jogadoresPorEquipe < 1 || values.jogadoresPorEquipe > 20) {
    return 'Jogadores por equipe deve ser entre 1 e 20.';
  }
  if (values.duracaoMin != null && (values.duracaoMin < 1 || values.duracaoMin > 60)) {
    return 'Duração deve ser entre 1 e 60 minutos.';
  }
  if (values.limiteGols != null && (values.limiteGols < 1 || values.limiteGols > 20)) {
    return 'Limite de gols deve ser entre 1 e 20.';
  }
  if (
    values.amareloMinutosFora < 0 ||
    values.amareloMinutosFora > 5 ||
    !Number.isInteger(values.amareloMinutosFora)
  ) {
    return 'Minutos do cartão amarelo devem ser entre 0 e 5.';
  }
  if (coresIguais(values.corTime1, values.corTime2)) {
    return 'Time 1 e Time 2 não podem ter a mesma cor de camisa.';
  }
  return null;
}
