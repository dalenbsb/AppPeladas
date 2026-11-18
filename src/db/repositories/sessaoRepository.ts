import type { NewSessaoJogo, SessaoJogo } from '@/domain/types';

import { createId, nowIso } from '../ids';
import { mapSessao, type SessaoRow } from '../mappers';
import type { SqlExecutor } from '../sqlExecutor';

export class SessaoRepository {
  constructor(private readonly db: SqlExecutor) {}

  async listByPelada(peladaId: string): Promise<SessaoJogo[]> {
    const rows = await this.db.getAll<SessaoRow>(
      'SELECT * FROM sessoes WHERE pelada_id = ? ORDER BY created_at ASC',
      [peladaId],
    );
    return rows.map(mapSessao);
  }

  async listAll(): Promise<SessaoJogo[]> {
    const rows = await this.db.getAll<SessaoRow>('SELECT * FROM sessoes ORDER BY created_at ASC');
    return rows.map(mapSessao);
  }

  async getById(id: string): Promise<SessaoJogo | null> {
    const row = await this.db.getFirst<SessaoRow>('SELECT * FROM sessoes WHERE id = ?', [id]);
    return row ? mapSessao(row) : null;
  }

  async create(input: NewSessaoJogo): Promise<SessaoJogo> {
    const id = input.id ?? createId();
    const now = nowIso();
    const createdAt = input.createdAt ?? now;
    const updatedAt = input.updatedAt ?? now;
    await this.db.run(
      `INSERT INTO sessoes (
        id, pelada_id, ordem_chegada_json, time_branco_ids_json, time_preto_ids_json,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.peladaId,
        JSON.stringify(input.ordemChegada),
        JSON.stringify(input.timeBrancoIds),
        JSON.stringify(input.timePretoIds),
        input.status,
        createdAt,
        updatedAt,
      ],
    );
    const created = await this.getById(id);
    if (!created) {
      throw new Error('Falha ao criar sessão');
    }
    return created;
  }

  async update(id: string, patch: Partial<NewSessaoJogo>): Promise<SessaoJogo> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error(`Sessão não encontrada: ${id}`);
    }
    const next: SessaoJogo = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: nowIso(),
    };
    await this.db.run(
      `UPDATE sessoes SET
        pelada_id = ?, ordem_chegada_json = ?, time_branco_ids_json = ?,
        time_preto_ids_json = ?, status = ?, updated_at = ?
      WHERE id = ?`,
      [
        next.peladaId,
        JSON.stringify(next.ordemChegada),
        JSON.stringify(next.timeBrancoIds),
        JSON.stringify(next.timePretoIds),
        next.status,
        next.updatedAt,
        id,
      ],
    );
    return next;
  }

  async delete(id: string): Promise<void> {
    await this.db.run('DELETE FROM sessoes WHERE id = ?', [id]);
  }
}
