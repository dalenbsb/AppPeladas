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

function chunkIds(ids: string[], size: number): string[][] {
  const blocos: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    blocos.push(ids.slice(i, i + size));
  }
  return blocos;
}

/**
 * Próximos times a partir da fila.
 *
 * - `true` (legado): pula os primeiros 2×N da ordem.
 * - `false`: usa a fila inteira em blocos de N.
 * - lista de IDs: exclui quem está em campo (preferido após rotação / vermelho).
 */
export function montarProximosDaFila(
  ordemChegada: string[],
  n: number,
  pularOuEmCampo: boolean | Iterable<string> = true,
): string[][] {
  const size = Math.max(1, Math.floor(n) || 1);

  if (typeof pularOuEmCampo !== 'boolean') {
    const emCampo = new Set(pularOuEmCampo);
    return chunkIds(
      ordemChegada.filter((id) => !emCampo.has(id)),
      size,
    );
  }

  const source = pularOuEmCampo ? ordemChegada.slice(size * 2) : ordemChegada;
  return chunkIds(source, size);
}
