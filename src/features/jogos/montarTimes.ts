/**
 * Montagem de times a partir da ordem de chegada.
 * Time 1 (branco) = primeiros N; time 2 (preto) = próximos N;
 * demais viram blocos de "próximos times".
 */

export type TimesMontados = {
  timeBrancoIds: string[];
  timePretoIds: string[];
  /** Blocos de N a partir do restante da fila (após os 2 times em campo). */
  proximosTimes: string[][];
};

export function montarTimesDaFila(ordemChegada: string[], n: number): TimesMontados {
  const size = Math.max(1, Math.floor(n) || 1);
  const timeBrancoIds = ordemChegada.slice(0, size);
  const timePretoIds = ordemChegada.slice(size, size * 2);
  const resto = ordemChegada.slice(size * 2);
  const proximosTimes: string[][] = [];
  for (let i = 0; i < resto.length; i += size) {
    proximosTimes.push(resto.slice(i, i + size));
  }
  return { timeBrancoIds, timePretoIds, proximosTimes };
}

/** Próximos times a partir da fila inteira em blocos de N (sem “em campo”). */
export function montarProximosDaFila(ordemChegada: string[], n: number, pularEmCampo = true): string[][] {
  const size = Math.max(1, Math.floor(n) || 1);
  const source = pularEmCampo ? ordemChegada.slice(size * 2) : ordemChegada;
  const blocos: string[][] = [];
  for (let i = 0; i < source.length; i += size) {
    blocos.push(source.slice(i, i + size));
  }
  return blocos;
}
