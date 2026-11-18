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
  amareloDoisMinutos: boolean;
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
    amareloDoisMinutos: true,
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
    amareloDoisMinutos: pelada.amareloDoisMinutos,
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
    amareloDoisMinutos: values.amareloDoisMinutos,
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
  return null;
}
