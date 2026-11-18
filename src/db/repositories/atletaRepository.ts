import type { Atleta, NewAtleta } from '@/domain/types';

import { createId, nowIso } from '../ids';
import { mapAtleta, type AtletaRow } from '../mappers';
import type { SqlExecutor } from '../sqlExecutor';

export class AtletaRepository {
  constructor(private readonly db: SqlExecutor) {}

  async listByPelada(peladaId: string): Promise<Atleta[]> {
    const rows = await this.db.getAll<AtletaRow>(
      'SELECT * FROM atletas WHERE pelada_id = ? ORDER BY nome ASC',
      [peladaId],
    );
    return rows.map(mapAtleta);
  }

  async listAll(): Promise<Atleta[]> {
    const rows = await this.db.getAll<AtletaRow>('SELECT * FROM atletas ORDER BY nome ASC');
    return rows.map(mapAtleta);
  }

  async getById(id: string): Promise<Atleta | null> {
    const row = await this.db.getFirst<AtletaRow>('SELECT * FROM atletas WHERE id = ?', [id]);
    return row ? mapAtleta(row) : null;
  }

  async create(input: NewAtleta): Promise<Atleta> {
    const id = input.id ?? createId();
    const now = nowIso();
    const createdAt = input.createdAt ?? now;
    const updatedAt = input.updatedAt ?? now;
    await this.db.run(
      `INSERT INTO atletas (
        id, pelada_id, foto_uri, nome, posicao, celular, data_nascimento,
        ativo, mensalista, numero_camisa, melhor_pe, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.peladaId,
        input.fotoUri,
        input.nome,
        input.posicao,
        input.celular,
        input.dataNascimento,
        input.ativo ? 1 : 0,
        input.mensalista ? 1 : 0,
        input.numeroCamisa,
        input.melhorPe,
        createdAt,
        updatedAt,
      ],
    );
    const created = await this.getById(id);
    if (!created) {
      throw new Error('Falha ao criar atleta');
    }
    return created;
  }

  async update(id: string, patch: Partial<NewAtleta>): Promise<Atleta> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error(`Atleta não encontrado: ${id}`);
    }
    const next: Atleta = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: nowIso(),
    };
    await this.db.run(
      `UPDATE atletas SET
        pelada_id = ?, foto_uri = ?, nome = ?, posicao = ?, celular = ?,
        data_nascimento = ?, ativo = ?, mensalista = ?, numero_camisa = ?,
        melhor_pe = ?, updated_at = ?
      WHERE id = ?`,
      [
        next.peladaId,
        next.fotoUri,
        next.nome,
        next.posicao,
        next.celular,
        next.dataNascimento,
        next.ativo ? 1 : 0,
        next.mensalista ? 1 : 0,
        next.numeroCamisa,
        next.melhorPe,
        next.updatedAt,
        id,
      ],
    );
    return next;
  }

  async delete(id: string): Promise<void> {
    await this.db.run('DELETE FROM atletas WHERE id = ?', [id]);
  }
}
