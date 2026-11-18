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

  async listAll(): Promise<Partida[]> {
    const rows = await this.db.getAll<PartidaRow>('SELECT * FROM partidas ORDER BY created_at ASC');
    return rows.map(mapPartida);
  }

  async getById(id: string): Promise<Partida | null> {
    const row = await this.db.getFirst<PartidaRow>('SELECT * FROM partidas WHERE id = ?', [id]);
    return row ? mapPartida(row) : null;
  }

  async create(input: NewPartida): Promise<Partida> {
    const id = input.id ?? createId();
    const now = nowIso();
    const createdAt = input.createdAt ?? now;
    const updatedAt = input.updatedAt ?? now;
    await this.db.run(
      `INSERT INTO partidas (
        id, pelada_id, sessao_id, placar_branco, placar_preto,
        iniciada_em, pausada, encerrada_em, motivo_fim, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.peladaId,
        input.sessaoId,
        input.placarBranco,
        input.placarPreto,
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
      updatedAt: nowIso(),
    };
    await this.db.run(
      `UPDATE partidas SET
        pelada_id = ?, sessao_id = ?, placar_branco = ?, placar_preto = ?,
        iniciada_em = ?, pausada = ?, encerrada_em = ?, motivo_fim = ?, updated_at = ?
      WHERE id = ?`,
      [
        next.peladaId,
        next.sessaoId,
        next.placarBranco,
        next.placarPreto,
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
