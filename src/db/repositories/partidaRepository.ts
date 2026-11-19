import { DEFAULT_COR_TIME1, DEFAULT_COR_TIME2 } from '@/domain/teamColors';
import type { NewPartida, Partida } from '@/domain/types';

import { createId, nowIso } from '../ids';
import { mapPartida, type PartidaRow } from '../mappers';
import type { SqlExecutor } from '../sqlExecutor';

export class PartidaRepository {
  constructor(private readonly db: SqlExecutor) {}

  async listByPelada(peladaId: string): Promise<Partida[]> {
    const rows = await this.db.getAll<PartidaRow>(
      'SELECT * FROM partidas WHERE pelada_id = ? ORDER BY created_at ASC',
      [peladaId],
    );
    return rows.map(mapPartida);
  }

  /** Partidas encerradas da pelada, mais recentes primeiro. */
  async listFinishedByPelada(peladaId: string): Promise<Partida[]> {
    const rows = await this.db.getAll<PartidaRow>(
      `SELECT * FROM partidas
       WHERE pelada_id = ? AND encerrada_em IS NOT NULL
       ORDER BY encerrada_em DESC, created_at DESC`,
      [peladaId],
    );
    return rows.map(mapPartida);
  }

  async listAll(): Promise<Partida[]> {
    const rows = await this.db.getAll<PartidaRow>('SELECT * FROM partidas ORDER BY created_at ASC');
    return rows.map(mapPartida);
  }

  async getById(id: string): Promise<Partida | null> {
    const row = await this.db.getFirst<PartidaRow>('SELECT * FROM partidas WHERE id = ?', [id]);
    return row ? mapPartida(row) : null;
  }

  /** Partida em andamento (não encerrada) da sessão, se houver. */
  async getOpenBySessao(sessaoId: string): Promise<Partida | null> {
    const row = await this.db.getFirst<PartidaRow>(
      `SELECT * FROM partidas
       WHERE sessao_id = ? AND encerrada_em IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [sessaoId],
    );
    return row ? mapPartida(row) : null;
  }

  /**
   * Última partida encerrada com vencedor na sessão (placar diferente).
   * Usado para restaurar o ciclo de “fica quem está ganhando” — empates
   * não contam, senão o reload após empate perde a vantagem do ciclo.
   */
  async getLastFinishedBySessao(sessaoId: string): Promise<Partida | null> {
    const row = await this.db.getFirst<PartidaRow>(
      `SELECT * FROM partidas
       WHERE sessao_id = ? AND encerrada_em IS NOT NULL
         AND placar_branco != placar_preto
       ORDER BY encerrada_em DESC
       LIMIT 1`,
      [sessaoId],
    );
    return row ? mapPartida(row) : null;
  }

  async create(input: NewPartida): Promise<Partida> {
    const id = input.id ?? createId();
    const now = nowIso();
    const createdAt = input.createdAt ?? now;
    const updatedAt = input.updatedAt ?? now;
    const tempoDecorridoMs = input.tempoDecorridoMs ?? 0;
    const timeBrancoIds = input.timeBrancoIds ?? [];
    const timePretoIds = input.timePretoIds ?? [];
    const corTime1 = input.corTime1?.trim() || DEFAULT_COR_TIME1;
    const corTime2 = input.corTime2?.trim() || DEFAULT_COR_TIME2;
    await this.db.run(
      `INSERT INTO partidas (
        id, pelada_id, sessao_id, placar_branco, placar_preto, tempo_decorrido_ms,
        time_branco_ids_json, time_preto_ids_json, cor_time1, cor_time2,
        iniciada_em, pausada, encerrada_em, motivo_fim, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.peladaId,
        input.sessaoId,
        input.placarBranco,
        input.placarPreto,
        tempoDecorridoMs,
        JSON.stringify(timeBrancoIds),
        JSON.stringify(timePretoIds),
        corTime1,
        corTime2,
        input.iniciadaEm,
        input.pausada ? 1 : 0,
        input.encerradaEm,
        input.motivoFim,
        createdAt,
        updatedAt,
      ],
    );
    const created = await this.getById(id);
    if (!created) {
      throw new Error('Falha ao criar partida');
    }
    return created;
  }

  async update(id: string, patch: Partial<NewPartida>): Promise<Partida> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error(`Partida não encontrada: ${id}`);
    }
    const next: Partida = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      corTime1: (patch.corTime1 ?? current.corTime1).trim() || DEFAULT_COR_TIME1,
      corTime2: (patch.corTime2 ?? current.corTime2).trim() || DEFAULT_COR_TIME2,
      updatedAt: nowIso(),
    };
    await this.db.run(
      `UPDATE partidas SET
        pelada_id = ?, sessao_id = ?, placar_branco = ?, placar_preto = ?,
        tempo_decorrido_ms = ?, time_branco_ids_json = ?, time_preto_ids_json = ?,
        cor_time1 = ?, cor_time2 = ?,
        iniciada_em = ?, pausada = ?, encerrada_em = ?,
        motivo_fim = ?, updated_at = ?
      WHERE id = ?`,
      [
        next.peladaId,
        next.sessaoId,
        next.placarBranco,
        next.placarPreto,
        next.tempoDecorridoMs,
        JSON.stringify(next.timeBrancoIds),
        JSON.stringify(next.timePretoIds),
        next.corTime1,
        next.corTime2,
        next.iniciadaEm,
        next.pausada ? 1 : 0,
        next.encerradaEm,
        next.motivoFim,
        next.updatedAt,
        id,
      ],
    );
    return next;
  }

  async delete(id: string): Promise<void> {
    await this.db.run('DELETE FROM partidas WHERE id = ?', [id]);
  }
}
