/**
 * Smoke Fase 1: pelada fake → export → wipe → import → match.
 * Roda em Node com better-sqlite3 (mesmo schema/repos do app).
 *
 * Uso: npm run smoke
 */
import { createBetterSqliteExecutor } from '../src/db/betterSqliteAdapter';
import { migrate } from '../src/db/migrate';
import { createRepositories } from '../src/db/repositories';
import {
  exportToJson,
  importFromJson,
  wipeAllData,
} from '../src/features/backup/backupService';
import type { BackupJsonV1 } from '../src/domain/types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function stablePayload(backup: BackupJsonV1) {
  const { exportedAt: _exportedAt, ...rest } = backup;
  return rest;
}

async function main() {
  const db = createBetterSqliteExecutor(':memory:');
  await migrate(db);
  const repos = createRepositories(db);

  const pelada = await repos.peladas.create({
    nome: 'Pelada do Parque',
    descricao: 'Smoke test Fase 1',
    duracaoMin: 10,
    limiteGols: 2,
    jogadoresPorEquipe: 5,
    criteriosSorteio: ['ordem_chegada'],
    regraEmpate: 'penaltis',
    telaSempreLigada: true,
    amareloDoisMinutos: false,
  });

  const atleta = await repos.atletas.create({
    peladaId: pelada.id,
    fotoUri: null,
    nome: 'João Smoke',
    posicao: 'meia',
    celular: null,
    dataNascimento: null,
    ativo: true,
    mensalista: true,
    numeroCamisa: 10,
    melhorPe: 'direito',
  });

  const sessao = await repos.sessoes.create({
    peladaId: pelada.id,
    ordemChegada: [atleta.id],
    timeBrancoIds: [atleta.id],
    timePretoIds: [],
    status: 'aberta',
  });

  const partida = await repos.partidas.create({
    peladaId: pelada.id,
    sessaoId: sessao.id,
    placarBranco: 1,
    placarPreto: 0,
    iniciadaEm: new Date().toISOString(),
    pausada: false,
    encerradaEm: null,
    motivoFim: null,
  });

  await repos.eventos.create({
    partidaId: partida.id,
    tipo: 'gol',
    atletaId: atleta.id,
    meta: { observacao: 'smoke' },
  });

  await db.run(
    `INSERT INTO backup_media (id, atleta_id, mime_type, base64) VALUES (?, ?, ?, ?)`,
    ['media-1', atleta.id, 'image/png', 'aGVsbG8='],
  );

  const exported = await exportToJson(db);
  assert(exported.version === 1, 'version deve ser 1');
  assert(exported.peladas.length === 1, 'deve haver 1 pelada exportada');
  assert(exported.atletas.length === 1, 'deve haver 1 atleta exportado');
  assert(exported.sessoes.length === 1, 'deve haver 1 sessão exportada');
  assert(exported.partidas.length === 1, 'deve haver 1 partida exportada');
  assert(exported.eventos.length === 1, 'deve haver 1 evento exportado');
  assert(exported.media.length === 1, 'deve haver 1 mídia exportada');

  await wipeAllData(db);
  const afterWipe = await exportToJson(db);
  assert(afterWipe.peladas.length === 0, 'wipe deve limpar peladas');
  assert(afterWipe.atletas.length === 0, 'wipe deve limpar atletas');

  // Schema inválido não pode alterar o banco
  let rejected = false;
  try {
    await importFromJson(db, { version: 999 }, { confirmReplace: true });
  } catch {
    rejected = true;
  }
  assert(rejected, 'import com schema inválido deve falhar');
  assert((await exportToJson(db)).peladas.length === 0, 'falha de schema não altera banco');

  // Sem confirmação não importa
  let blocked = false;
  try {
    await importFromJson(db, exported, { confirmReplace: false });
  } catch {
    blocked = true;
  }
  assert(blocked, 'import sem confirmação deve falhar');

  await importFromJson(db, exported, { confirmReplace: true });
  const restored = await exportToJson(db);

  assert(
    JSON.stringify(stablePayload(restored)) === JSON.stringify(stablePayload(exported)),
    'dados após import devem bater com o export (exceto exportedAt)',
  );

  await db.close();
  console.log('SMOKE OK: export → wipe → import → match');
}

main().catch((error) => {
  console.error('SMOKE FAILED:', error);
  process.exit(1);
});
