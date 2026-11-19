/** Formatação e helpers do cronômetro da partida. */

export function formatCronometro(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/** Contagem regressiva curta (suspensão de amarelo). */
export function formatCountdown(msRestante: number): string {
  const totalSec = Math.max(0, Math.ceil(msRestante / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function duracaoLimiteMs(duracaoMin: number | null | undefined): number | null {
  if (duracaoMin == null || duracaoMin <= 0) return null;
  return duracaoMin * 60 * 1000;
}

/**
 * Tempo exibido: acumulado + segmento corrente (se rodando).
 * `segmentStartedAt` é Date.now() do início do segmento atual.
 */
export function tempoExibidoMs(
  tempoDecorridoMs: number,
  rodando: boolean,
  segmentStartedAt: number | null,
  now = Date.now(),
): number {
  if (!rodando || segmentStartedAt == null) return Math.max(0, tempoDecorridoMs);
  return Math.max(0, tempoDecorridoMs + (now - segmentStartedAt));
}

/**
 * Ao recarregar uma partida aberta:
 * 1) mesma partida já rodando na UI → preserva `segmentStartedAt` em memória;
 * 2) senão, usa âncora persistida no SQLite (sobrevive a sair da tela / remount);
 * 3) fallback: inicia segmento em `now` (legado sem coluna).
 */
export function segmentStartedAtAposReload(opts: {
  partidaId: string;
  rodando: boolean;
  prevPartidaId: string | null | undefined;
  prevSegmentStartedAt: number | null;
  persistedSegmentStartedAt?: number | null;
  now?: number;
}): number | null {
  if (!opts.rodando) return null;
  if (
    opts.prevPartidaId === opts.partidaId &&
    opts.prevSegmentStartedAt != null
  ) {
    return opts.prevSegmentStartedAt;
  }
  if (
    opts.persistedSegmentStartedAt != null &&
    Number.isFinite(opts.persistedSegmentStartedAt)
  ) {
    return opts.persistedSegmentStartedAt;
  }
  return opts.now ?? Date.now();
}
