/**
 * Smoke da Fase 5 — fim de partida, empate e fila (sem UI).
 * Rodar: npm run smoke:partida
 */
import {
  aplicarFimPartida,
  enviarAoFimDaFila,
  rotacionarSaiOsDois,
  rotacionarVencedorFica,
  vencedorDaPartida,
} from '../src/features/jogos/fimPartida';
import {
  duracaoLimiteMs,
  formatCountdown,
  formatCronometro,
  tempoExibidoMs,
} from '../src/features/jogos/cronometro';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

assert(formatCronometro(0) === '00:00', 'cronometro zero');
assert(formatCronometro(65_000) === '01:05', 'cronometro 65s');
assert(formatCountdown(90_000) === '1:30', 'countdown');
assert(duracaoLimiteMs(7) === 7 * 60 * 1000, 'duracao');
assert(tempoExibidoMs(1000, false, null) === 1000, 'pausado');
assert(tempoExibidoMs(1000, true, 10_000, 12_000) === 3000, 'rodando');

const branco = ['b1', 'b2', 'b3'];
const preto = ['p1', 'p2', 'p3'];
const fila = [...branco, ...preto, 'n1', 'n2', 'n3', 'n4', 'n5', 'n6'];

const win = rotacionarVencedorFica(fila, branco, preto, 'branco', 3);
assert(deepEqual(win.timeBrancoIds, branco), 'vencedor fica');
assert(deepEqual(win.timePretoIds, ['n1', 'n2', 'n3']), 'proximo time entra');
assert(win.ordemChegada.slice(-3).join(',') === 'p1,p2,p3', 'perdedor no fim');

const sai = rotacionarSaiOsDois(fila, branco, preto, 3);
assert(sai.rotacionou, 'sai os dois com fila');
assert(deepEqual(sai.timeBrancoIds, ['n1', 'n2', 'n3']), 'novo branco');
assert(deepEqual(sai.timePretoIds, ['n4', 'n5', 'n6']), 'novo preto');

const curto = rotacionarSaiOsDois(
  [...branco, ...preto, 'n1', 'n2', 'n3'],
  branco,
  preto,
  3,
);
assert(!curto.rotacionou, 'sai os dois sem 2 times');

const fimVitoria = aplicarFimPartida({
  ordemChegada: fila,
  timeBrancoIds: branco,
  timePretoIds: preto,
  placarBranco: 2,
  placarPreto: 1,
  regraEmpate: 'penaltis',
  jogadoresPorEquipe: 3,
  ultimoVencedor: null,
});
assert(fimVitoria.vencedor === 'branco', 'vencedor placar');
assert(fimVitoria.rotacionou, 'rotaciona na vitoria');

const fimPenaltis = aplicarFimPartida({
  ordemChegada: fila,
  timeBrancoIds: branco,
  timePretoIds: preto,
  placarBranco: 1,
  placarPreto: 1,
  regraEmpate: 'penaltis',
  jogadoresPorEquipe: 3,
  ultimoVencedor: 'preto',
});
assert(!fimPenaltis.rotacionou, 'penaltis nao rotaciona');
assert(fimPenaltis.mensagem.toLowerCase().includes('pênaltis') || fimPenaltis.mensagem.toLowerCase().includes('penaltis'), 'msg penaltis');

const fimFica = aplicarFimPartida({
  ordemChegada: fila,
  timeBrancoIds: branco,
  timePretoIds: preto,
  placarBranco: 0,
  placarPreto: 0,
  regraEmpate: 'fica_quem_esta_ganhando',
  jogadoresPorEquipe: 3,
  ultimoVencedor: 'preto',
});
assert(deepEqual(fimFica.timePretoIds, preto), 'fica preto no ciclo');

const moved = enviarAoFimDaFila(fila, branco, preto, 'b2');
assert(!moved.timeBrancoIds.includes('b2'), 'vermelho sai do time');
assert(moved.ordemChegada.at(-1) === 'b2', 'vermelho no fim');

assert(vencedorDaPartida(3, 1) === 'branco', 'vencedor helper');
assert(vencedorDaPartida(1, 1) === null, 'empate helper');

console.log('smoke-partida: ok');
