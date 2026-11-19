/**
 * Smoke da Fase 6 — agregação de estatísticas (sem UI).
 * Rodar: npm run smoke:estatisticas
 */
import type { Atleta, EventoPartida, Partida } from '../src/domain/types';
import { agregarEstatisticas } from '../src/features/estatisticas/agregarEstatisticas';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const atletas: Atleta[] = [
  {
    id: 'a1',
    peladaId: 'p1',
    fotoUri: null,
    nome: 'Ana',
    posicao: 'atacante',
    celular: null,
    dataNascimento: null,
    ativo: true,
    mensalista: true,
    numeroCamisa: 9,
    melhorPe: 'direito',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'a2',
    peladaId: 'p1',
    fotoUri: null,
    nome: 'Bruno',
    posicao: 'meia',
    celular: null,
    dataNascimento: null,
    ativo: true,
    mensalista: false,
    numeroCamisa: 10,
    melhorPe: 'esquerdo',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'a3',
    peladaId: 'p1',
    fotoUri: null,
    nome: 'Caio',
    posicao: 'zagueiro',
    celular: null,
    dataNascimento: null,
    ativo: true,
    mensalista: false,
    numeroCamisa: 4,
    melhorPe: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'a4',
    peladaId: 'p1',
    fotoUri: null,
    nome: 'Duda',
    posicao: 'goleiro',
    celular: null,
    dataNascimento: null,
    ativo: true,
    mensalista: true,
    numeroCamisa: 1,
    melhorPe: 'direito',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const partidas: Partida[] = [
  {
    id: 'm1',
    peladaId: 'p1',
    sessaoId: 's1',
    placarBranco: 2,
    placarPreto: 1,
    tempoDecorridoMs: 600_000,
    segmentStartedAtMs: null,
    timeBrancoIds: ['a1', 'a2'],
    timePretoIds: ['a3', 'a4'],
    corTime1: '#FFFFFF',
    corTime2: '#111111',
    iniciadaEm: '2026-01-02T10:00:00.000Z',
    pausada: true,
    encerradaEm: '2026-01-02T10:10:00.000Z',
    motivoFim: 'tempo',
    createdAt: '2026-01-02T10:00:00.000Z',
    updatedAt: '2026-01-02T10:10:00.000Z',
  },
  {
    id: 'm2',
    peladaId: 'p1',
    sessaoId: 's1',
    placarBranco: 0,
    placarPreto: 0,
    tempoDecorridoMs: 600_000,
    segmentStartedAtMs: null,
    timeBrancoIds: ['a1', 'a3'],
    timePretoIds: ['a2', 'a4'],
    corTime1: '#FFFFFF',
    corTime2: '#111111',
    iniciadaEm: '2026-01-02T10:20:00.000Z',
    pausada: true,
    encerradaEm: '2026-01-02T10:30:00.000Z',
    motivoFim: 'tempo',
    createdAt: '2026-01-02T10:20:00.000Z',
    updatedAt: '2026-01-02T10:30:00.000Z',
  },
  {
    id: 'm3-aberta',
    peladaId: 'p1',
    sessaoId: 's1',
    placarBranco: 1,
    placarPreto: 0,
    tempoDecorridoMs: 10_000,
    segmentStartedAtMs: null,
    timeBrancoIds: ['a1'],
    timePretoIds: ['a2'],
    corTime1: '#FFFFFF',
    corTime2: '#111111',
    iniciadaEm: '2026-01-02T11:00:00.000Z',
    pausada: false,
    encerradaEm: null,
    motivoFim: null,
    createdAt: '2026-01-02T11:00:00.000Z',
    updatedAt: '2026-01-02T11:00:00.000Z',
  },
];

const eventos: EventoPartida[] = [
  {
    id: 'e1',
    partidaId: 'm1',
    tipo: 'gol',
    atletaId: 'a1',
    meta: { assistenteId: 'a2' },
    createdAt: '2026-01-02T10:02:00.000Z',
  },
  {
    id: 'e2',
    partidaId: 'm1',
    tipo: 'assistencia',
    atletaId: 'a2',
    meta: null,
    createdAt: '2026-01-02T10:02:01.000Z',
  },
  {
    id: 'e3',
    partidaId: 'm1',
    tipo: 'gol',
    atletaId: 'a1',
    meta: null,
    createdAt: '2026-01-02T10:05:00.000Z',
  },
  {
    id: 'e4',
    partidaId: 'm1',
    tipo: 'gol',
    atletaId: 'a3',
    meta: null,
    createdAt: '2026-01-02T10:07:00.000Z',
  },
  {
    id: 'e5',
    partidaId: 'm1',
    tipo: 'amarelo',
    atletaId: 'a4',
    meta: null,
    createdAt: '2026-01-02T10:08:00.000Z',
  },
  {
    id: 'e6',
    partidaId: 'm2',
    tipo: 'vermelho',
    atletaId: 'a3',
    meta: { gravidadeVermelho: 'leve' },
    createdAt: '2026-01-02T10:25:00.000Z',
  },
  {
    id: 'e7',
    partidaId: 'm3-aberta',
    tipo: 'gol',
    atletaId: 'a1',
    meta: null,
    createdAt: '2026-01-02T11:01:00.000Z',
  },
];

const stats = agregarEstatisticas(atletas, partidas, eventos);

assert(stats.partidasEncerradas === 2, '2 partidas encerradas');
assert(stats.destaques.maisJogos?.atletaId === 'a1' || stats.destaques.maisJogos?.jogos === 2, 'mais jogos');
assert(stats.totais.every((r) => r.jogos === 2), 'todos jogaram 2');

const ana = stats.totais.find((r) => r.atletaId === 'a1');
assert(ana?.vitorias === 1 && ana.empates === 1 && ana.derrotas === 0, 'Ana 1V 1E');

const bruno = stats.totais.find((r) => r.atletaId === 'a2');
assert(bruno?.vitorias === 1 && bruno.empates === 1, 'Bruno 1V 1E');

const caio = stats.totais.find((r) => r.atletaId === 'a3');
assert(caio?.derrotas === 1 && caio.empates === 1, 'Caio 1D 1E');

assert(stats.artilharia[0]?.atletaId === 'a1' && stats.artilharia[0].gols === 2, 'artilheira Ana');
assert(!stats.artilharia.some((r) => r.gols === 3), 'gol da partida aberta ignorado');
assert(stats.assistencias[0]?.atletaId === 'a2' && stats.assistencias[0].assistencias === 1, 'assist Bruno');

const cartaoCaio = stats.cartoes.find((r) => r.atletaId === 'a3');
assert(cartaoCaio?.vermelhos === 1, 'vermelho Caio');
const cartaoDuda = stats.cartoes.find((r) => r.atletaId === 'a4');
assert(cartaoDuda?.amarelos === 1, 'amarelo Duda');

// Filtro por período (dia local da encerradaEm).
const foraDoPeriodo = agregarEstatisticas(atletas, partidas, eventos, {
  dataInicioKey: '2026-01-03',
  dataFimKey: '2026-01-03',
});
assert(foraDoPeriodo.partidasEncerradas === 0, 'filtro fora do dia zera');

const noDia = agregarEstatisticas(atletas, partidas, eventos, {
  dataInicioKey: '2026-01-02',
  dataFimKey: '2026-01-02',
});
assert(noDia.partidasEncerradas === 2, 'filtro no dia mantém as 2');

console.log('smoke:estatisticas OK');
