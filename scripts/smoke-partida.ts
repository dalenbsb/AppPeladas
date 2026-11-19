/**
 * Smoke da Fase 5 / fila do perdedor — fim de partida, empate e próximos times (sem UI).
 * Rodar: npm run smoke:partida
 */
import {
  aplicarFimPartida,
  enviarAoFimDaFila,
  MSG_PREENCHER_VAGA_VENCEDOR,
  preencherVagaVencedorEMontarAdversario,
  reordenarProximos,
  remontarOrdemAposRotacao,
  rotacionarSaiOsDois,
  rotacionarVencedorFica,
  substituirPorProximo,
  timeIncompleto,
  ultimoVencedorDoCiclo,
  vencedorDaPartida,
} from '../src/features/jogos/fimPartida';
import {
  duracaoLimiteMs,
  formatCountdown,
  formatCronometro,
  segmentStartedAtAposReload,
  tempoExibidoMs,
} from '../src/features/jogos/cronometro';
import { montarProximosDaFila, montarTimesDaFila } from '../src/features/jogos/montarTimes';

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

// Reload da mesma partida em andamento (ex.: segundo amarelo → setSessao) não zera o relógio.
const segAntes = 50_000;
assert(
  segmentStartedAtAposReload({
    partidaId: 'p1',
    rodando: true,
    prevPartidaId: 'p1',
    prevSegmentStartedAt: segAntes,
    now: 90_000,
  }) === segAntes,
  'reload mesma partida preserva segmento',
);
assert(
  tempoExibidoMs(0, true, segAntes, 90_000) === 40_000,
  'tempo continua após reload sem reset de segmento',
);
assert(
  segmentStartedAtAposReload({
    partidaId: 'p1',
    rodando: true,
    prevPartidaId: null,
    prevSegmentStartedAt: null,
    now: 90_000,
  }) === 90_000,
  'primeiro load inicia segmento',
);
assert(
  segmentStartedAtAposReload({
    partidaId: 'p1',
    rodando: false,
    prevPartidaId: 'p1',
    prevSegmentStartedAt: segAntes,
  }) === null,
  'pausada/encerrada limpa segmento',
);

const branco = ['b1', 'b2', 'b3'];
const preto = ['p1', 'p2', 'p3'];
const fila = [...branco, ...preto, 'n1', 'n2', 'n3', 'n4', 'n5', 'n6'];

const win = rotacionarVencedorFica(fila, branco, preto, 'branco', 3);
assert(deepEqual(win.timeBrancoIds, branco), 'vencedor fica');
assert(deepEqual(win.timePretoIds, ['n1', 'n2', 'n3']), 'proximo time entra');
assert(win.ordemChegada.slice(-3).join(',') === 'p1,p2,p3', 'perdedor no fim');
assert(!win.precisaPreencherVaga, 'vencedor completo: sem passo de vaga');
assert(win.ladoQueFica == null, 'vencedor completo: ladoQueFica nulo');

// Perdedor aparece em "próximos times"; próxima partida remonta pela fila.
const proximosAposWin = montarProximosDaFila(win.ordemChegada, 3, [
  ...win.timeBrancoIds,
  ...win.timePretoIds,
]);
assert(deepEqual(proximosAposWin.at(-1), preto), 'perdedor e bloco nos proximos');
assert(deepEqual(proximosAposWin[0], ['n4', 'n5', 'n6']), 'resto da fila antes do perdedor');
const remontada = montarTimesDaFila(win.ordemChegada, 3);
assert(deepEqual(remontada.timeBrancoIds, win.timeBrancoIds), 'partida branco pela fila');
assert(deepEqual(remontada.timePretoIds, win.timePretoIds), 'partida preto pela fila');

// Sem time completo na fila: perdedor ainda vai aos próximos; adversário fica vazio.
const winSemFila = rotacionarVencedorFica(
  [...branco, ...preto, 'x1', 'x2'],
  branco,
  preto,
  'preto',
  3,
);
assert(deepEqual(winSemFila.timePretoIds, preto), 'vencedor preto fica sem proximo completo');
assert(winSemFila.timeBrancoIds.length === 0, 'sem time parcial em campo');
const proximosSemFila = montarProximosDaFila(winSemFila.ordemChegada, 3, [
  ...winSemFila.timeBrancoIds,
  ...winSemFila.timePretoIds,
]);
assert(proximosSemFila.flat().includes('x1'), 'espera parcial nos proximos');
assert(proximosSemFila.flat().slice(-3).join(',') === 'b1,b2,b3', 'perdedor no fim dos proximos');
assert(winSemFila.ordemChegada.slice(-3).join(',') === 'b1,b2,b3', 'perdedor no fim da ordem');

assert(
  deepEqual(remontarOrdemAposRotacao(['a'], ['b'], ['c', 'd']), ['a', 'b', 'c', 'd']),
  'ordem canonica',
);

const sai = rotacionarSaiOsDois(fila, branco, preto, 3);
assert(sai.rotacionou, 'sai os dois com fila');
assert(deepEqual(sai.timeBrancoIds, ['n1', 'n2', 'n3']), 'novo branco');
assert(deepEqual(sai.timePretoIds, ['n4', 'n5', 'n6']), 'novo preto');
assert(sai.ordemChegada.slice(-6).join(',') === 'b1,b2,b3,p1,p2,p3', 'sairam no fim da fila');

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
assert(fimVitoria.ordemChegada.slice(-3).join(',') === 'p1,p2,p3', 'aplicarFim perdedor no fim');

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
assert(fimFica.ordemChegada.slice(-3).join(',') === 'b1,b2,b3', 'empate fica: branco no fim');

const moved = enviarAoFimDaFila(fila, branco, preto, 'b2');
assert(!moved.timeBrancoIds.includes('b2'), 'vermelho sai do time');
assert(moved.ordemChegada.at(-1) === 'b2', 'vermelho no fim');

assert(vencedorDaPartida(3, 1) === 'branco', 'vencedor helper');
assert(vencedorDaPartida(1, 1) === null, 'empate helper');

// Reload após empate: ciclo deve olhar a última vitória, não o empate.
assert(
  ultimoVencedorDoCiclo([
    { placarBranco: 0, placarPreto: 0 },
    { placarBranco: 1, placarPreto: 2 },
    { placarBranco: 3, placarPreto: 0 },
  ]) === 'preto',
  'ciclo ignora empate e pega preto',
);
assert(
  ultimoVencedorDoCiclo([{ placarBranco: 1, placarPreto: 1 }]) === null,
  'ciclo vazio só com empates',
);
const fimAposReload = aplicarFimPartida({
  ordemChegada: fila,
  timeBrancoIds: branco,
  timePretoIds: preto,
  placarBranco: 0,
  placarPreto: 0,
  regraEmpate: 'fica_quem_esta_ganhando',
  jogadoresPorEquipe: 3,
  ultimoVencedor: ultimoVencedorDoCiclo([
    { placarBranco: 0, placarPreto: 0 },
    { placarBranco: 0, placarPreto: 1 },
  ]),
});
assert(deepEqual(fimAposReload.timePretoIds, preto), 'reload: preto mantém vantagem');
assert(fimAposReload.ordemChegada.slice(-3).join(',') === 'b1,b2,b3', 'reload: branco sai');

// Vitória camisa preta: preto fica; próximo entra como branco; perdedor no fim.
const winPreto = rotacionarVencedorFica(fila, branco, preto, 'preto', 3);
assert(deepEqual(winPreto.timePretoIds, preto), 'preto vence e fica');
assert(deepEqual(winPreto.timeBrancoIds, ['n1', 'n2', 'n3']), 'próximo vira camisa branco');
assert(winPreto.ordemChegada.slice(-3).join(',') === 'b1,b2,b3', 'branco perdedor no fim');

// Substituição: sai b2, n1 entra no fim do time (não no índice vacante); b2 vai ao fim dos próximos.
const sub = substituirPorProximo(fila, branco, preto, 'b2');
assert(sub != null, 'substituição possível');
assert(deepEqual(sub!.timeBrancoIds, ['b1', 'b3', 'n1']), 'n1 no fim do time');
assert(sub!.ordemChegada.at(-1) === 'b2', 'substituído no fim');
assert(deepEqual(sub!.timePretoIds, preto), 'outro time intacto');

// Remover o primeiro do time: substituto ainda vai para a última posição.
const subPrimeiro = substituirPorProximo(fila, branco, preto, 'b1');
assert(subPrimeiro != null, 'substituição do primeiro possível');
assert(deepEqual(subPrimeiro!.timeBrancoIds, ['b2', 'b3', 'n1']), 'n1 no fim após sair o 1º');
assert(substituirPorProximo(branco.concat(preto), branco, preto, 'b1') == null, 'sem próximos');

// Reordenar próximos preserva times em campo.
const reord = reordenarProximos(branco, preto, ['n3', 'n1', 'n2', 'n6', 'n5', 'n4']);
assert(deepEqual(reord.timeBrancoIds, branco), 'reorden: branco intacto');
assert(deepEqual(reord.timePretoIds, preto), 'reorden: preto intacto');
assert(reord.ordemChegada.slice(6).join(',') === 'n3,n1,n2,n6,n5,n4', 'reorden: fila');

// Vencedor incompleto (expulso/machucado): bloqueia adversário até preencher última vaga.
assert(timeIncompleto(['b1', 'b2'], 3), 'time incompleto helper');
assert(!timeIncompleto(branco, 3), 'time completo helper');

const brancoCurto = ['b1', 'b2']; // falta 1
const filaCurto = [...brancoCurto, ...preto, 'n1', 'n2', 'n3', 'n4', 'n5', 'n6'];
const winCurto = rotacionarVencedorFica(filaCurto, brancoCurto, preto, 'branco', 3);
assert(winCurto.precisaPreencherVaga, 'vencedor incompleto exige vaga');
assert(winCurto.ladoQueFica === 'branco', 'lado que fica é branco');
assert(deepEqual(winCurto.timeBrancoIds, brancoCurto), 'vencedor curto permanece');
assert(winCurto.timePretoIds.length === 0, 'adversário ainda não montado');
assert(winCurto.ordemChegada.slice(-3).join(',') === 'p1,p2,p3', 'perdedor no fim antes da vaga');
assert(
  deepEqual(winCurto.ordemChegada.slice(2, 8), ['n1', 'n2', 'n3', 'n4', 'n5', 'n6']),
  'fila de próximos intacta antes da escolha',
);

const filled = preencherVagaVencedorEMontarAdversario(
  winCurto.ordemChegada,
  winCurto.timeBrancoIds,
  winCurto.timePretoIds,
  'branco',
  'n4', // escolhe do meio da lista (não necessariamente o 1º)
  3,
);
assert(filled != null, 'preencher vaga possível');
assert(!filled!.precisaPreencherVaga, 'após preencher: libera montagem');
assert(deepEqual(filled!.timeBrancoIds, ['b1', 'b2', 'n4']), 'entra na última vaga');
assert(deepEqual(filled!.timePretoIds, ['n1', 'n2', 'n3']), 'adversário montado após vaga');
assert(filled!.ordemChegada.slice(-3).join(',') === 'p1,p2,p3', 'perdedor permanece no fim');
assert(filled!.timeBrancoIds.at(-1) === 'n4', 'escolhido é a última vaga');
assert(!filled!.ordemChegada.slice(6).includes('n4'), 'n4 não ficou na espera');

// Escolher quem não está na fila → null.
assert(
  preencherVagaVencedorEMontarAdversario(
    winCurto.ordemChegada,
    winCurto.timeBrancoIds,
    winCurto.timePretoIds,
    'branco',
    'ghost',
    3,
  ) == null,
  'id fora da fila rejeitado',
);

// aplicarFimPartida: vitória com time curto usa a copy de substituição.
const fimCurto = aplicarFimPartida({
  ordemChegada: filaCurto,
  timeBrancoIds: brancoCurto,
  timePretoIds: preto,
  placarBranco: 2,
  placarPreto: 0,
  regraEmpate: 'penaltis',
  jogadoresPorEquipe: 3,
  ultimoVencedor: null,
});
assert(fimCurto.precisaPreencherVaga, 'aplicarFim: precisa vaga');
assert(fimCurto.mensagem === MSG_PREENCHER_VAGA_VENCEDOR, 'copy PT-BR de substituição');
assert(fimCurto.timePretoIds.length === 0, 'aplicarFim: adversário não montado');

// Empate “fica quem está ganhando” com time que fica incompleto.
const pretoCurto = ['p1', 'p2'];
const filaEmpateCurto = [...branco, ...pretoCurto, 'n1', 'n2', 'n3', 'n4'];
const fimEmpateCurto = aplicarFimPartida({
  ordemChegada: filaEmpateCurto,
  timeBrancoIds: branco,
  timePretoIds: pretoCurto,
  placarBranco: 1,
  placarPreto: 1,
  regraEmpate: 'fica_quem_esta_ganhando',
  jogadoresPorEquipe: 3,
  ultimoVencedor: 'preto',
});
assert(fimEmpateCurto.precisaPreencherVaga, 'empate fica: precisa vaga');
assert(fimEmpateCurto.ladoQueFica === 'preto', 'empate fica: lado preto');
assert(deepEqual(fimEmpateCurto.timePretoIds, pretoCurto), 'empate fica: preto curto permanece');
assert(fimEmpateCurto.timeBrancoIds.length === 0, 'empate fica: adversário não montado');
assert(fimEmpateCurto.mensagem === MSG_PREENCHER_VAGA_VENCEDOR, 'empate fica: mesma copy');

const filledEmpate = preencherVagaVencedorEMontarAdversario(
  fimEmpateCurto.ordemChegada,
  fimEmpateCurto.timeBrancoIds,
  fimEmpateCurto.timePretoIds,
  'preto',
  'n1',
  3,
);
assert(filledEmpate != null, 'empate fica: preencher');
assert(deepEqual(filledEmpate!.timePretoIds, ['p1', 'p2', 'n1']), 'empate fica: última vaga');
assert(deepEqual(filledEmpate!.timeBrancoIds, ['n2', 'n3', 'n4']), 'empate fica: adversário entra');

// Sem espera prévia: perdedor vira a lista de próximos — ainda exige escolher quem preenche.
const winSoPerdedor = rotacionarVencedorFica(
  [...brancoCurto, ...preto],
  brancoCurto,
  preto,
  'branco',
  3,
);
assert(winSoPerdedor.precisaPreencherVaga, 'só perdedor na fila: ainda exige vaga');
assert(deepEqual(winSoPerdedor.ordemChegada.slice(2), preto), 'perdedor é a lista de próximos');
const filledDoPerdedor = preencherVagaVencedorEMontarAdversario(
  winSoPerdedor.ordemChegada,
  winSoPerdedor.timeBrancoIds,
  winSoPerdedor.timePretoIds,
  'branco',
  'p2',
  3,
);
assert(filledDoPerdedor != null, 'pode escolher alguém do time que saiu');
assert(deepEqual(filledDoPerdedor!.timeBrancoIds, ['b1', 'b2', 'p2']), 'última vaga do perdedor');
assert(filledDoPerdedor!.timePretoIds.length === 0, 'resto do perdedor não forma time completo');
assert(!filledDoPerdedor!.precisaPreencherVaga, 'time completo: libera (sem adversário ainda)');

// Vencedor incompleto e literalmente ninguém fora de campo (só o próprio time): não bloqueia.
const winSolo = rotacionarVencedorFica(brancoCurto, brancoCurto, [], 'branco', 3);
assert(!winSolo.precisaPreencherVaga, 'ninguém na fila: não bloqueia');
assert(deepEqual(winSolo.timeBrancoIds, brancoCurto), 'vencedor curto permanece sozinho');

console.log('smoke-partida: ok');
