import { BackupValidationError } from '@/domain/backupValidation';

/**
 * Mensagens amigáveis para falhas de export/import.
 * Falha de schema nunca deve deixar dúvida: o banco não foi alterado.
 */
export function formatBackupError(err: unknown): string {
  if (err instanceof BackupValidationError) {
    return (
      `Arquivo inválido — nada foi alterado.\n` +
      `${err.message}\n` +
      `Exporte um backup deste app ou use um JSON no schema v1.`
    );
  }
  if (err instanceof SyntaxError) {
    return 'Arquivo JSON inválido — nada foi alterado. Verifique se o arquivo não está corrompido.';
  }
  if (err instanceof Error) {
    const msg = err.message.trim();
    if (/version deve ser/i.test(msg) || /Backup deve ser/i.test(msg)) {
      return `Arquivo inválido — nada foi alterado.\n${msg}`;
    }
    return msg || 'Falha no backup.';
  }
  return 'Falha no backup.';
}
