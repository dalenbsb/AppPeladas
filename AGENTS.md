# AppPeladas — notas para agentes

## Stack

Expo SDK 58 + TypeScript + Expo Router. Rotas em `app/` na raiz (não em `src/app/`). Código de domínio/dados em `src/`.

Antes de usar APIs Expo, confira a versão em `package.json` e a doc em `https://docs.expo.dev/versions/v58.0.0/`.

## Comandos

```bash
npx expo install <package>
npx expo start
npm run smoke
npx expo lint
npx tsc --noEmit
```

## Dados

- Persistência: `expo-sqlite` via `SqlExecutor` (`src/db/sqlExecutor.ts`)
- Smoke Node: `node:sqlite` em `src/db/nodeSqliteAdapter.ts` (não importar no bundle do app; Node >= 22.13)
- Backup v1: `src/features/backup/backupService.ts` — import **substitui** tudo após validar schema e `confirmReplace: true`
- UI de export/import: `src/features/backup/BackupPanel.tsx` (Configurações)
- Estado de lista: Zustand em `src/features/peladas/peladaStore.ts`

## Navegação (Fase 2)

- Home (`app/index.tsx`): lista + Entrar + FAB `+`
- Nova pelada: `app/pelada/nova.tsx`
- Hub: `app/pelada/[peladaId]/index.tsx` → Atletas / Jogos / Estatísticas / Configurações
- Formulário compartilhado: `src/features/peladas/PeladaForm.tsx`

## Escopo por fase

- Fase 1: scaffold + DB + backup — feito
- Fase 2: Home + cadastro/edição + Hub + Config — atual
- Fase 3+: atletas / partida / stats (placeholders no Hub)
