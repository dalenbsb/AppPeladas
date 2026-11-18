/**
 * Smoke da Fase 4 — montagem de times e sorteio (sem UI).
 * Rodar: npm run smoke:sorteio
 */
import type { Atleta, CriterioSorteio } from '../src/domain/types';
import { montarProximosDaFila, montarTimesDaFila } from '../src/features/jogos/montarTimes';
import { realizarSorteio } from '../src/features/jogos/sorteio';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function fakeAtleta(partial: Partial<Atleta> & Pick<Atleta, 'id' | 'nome'>): Atleta {
  return {
    peladaId: 'p1',
    fotoUri: null,
    posicao: 'meia',
    celular: null,
    dataNascimento: null,
    ativo: true,
    mensalista: false,
    numeroCamisa: null,
    melhorPe: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

const ids = Array.from({ length: 12 }, (_, i) => `a${i + 1}`);
const atletas = ids.map((id, i) =>
  fakeAtleta({
    id,
    nome: `Atleta ${i + 1}`,
    posicao: (['goleiro', 'zagueiro', 'lateral', 'volante', 'meia', 'atacante'] as const)[i % 6]!,
    mensalista: i % 3 === 0,
  }),
);

const n = 5;
const sequencial = montarTimesDaFila(ids, n);
assert(sequencial.timeBrancoIds.length === 5, 'branco size');
assert(sequencial.timePretoIds.length === 5, 'preto size');
assert(deepEqual(sequencial.timeBrancoIds, ids.slice(0, 5)), 'branco order');
assert(deepEqual(sequencial.timePretoIds, ids.slice(5, 10)), 'preto order');
assert(sequencial.proximosTimes.length === 1, 'proximos count');
assert(deepEqual(sequencial.proximosTimes[0], ids.slice(10)), 'proximos ids');

const proximos = montarProximosDaFila(ids, n, true);
assert(deepEqual(proximos, [ids.slice(10)]), 'montarProximos');

const semSorteio = realizarSorteio({
  ordemChegada: ids,
  atletas,
  criterios: ['sem_sorteio'] satisfies CriterioSorteio[],
  jogadoresPorEquipe: n,
});
assert(semSorteio.modo === 'sequencial', 'modo sequencial');
assert(deepEqual(semSorteio.timeBrancoIds, ids.slice(0, 5)), 'sem sorteio branco');

const balanceado = realizarSorteio({
  ordemChegada: ids,
  atletas,
  criterios: ['considerar_posicao', 'nivel_tecnico'],
  jogadoresPorEquipe: n,
});
assert(balanceado.modo === 'balanceado', 'modo balanceado');
assert(balanceado.timeBrancoIds.length === 5, 'balance branco');
assert(balanceado.timePretoIds.length === 5, 'balance preto');
assert(
  new Set([...balanceado.timeBrancoIds, ...balanceado.timePretoIds]).size === 10,
  'times disjuntos',
);

console.log('smoke-sorteio: ok');
