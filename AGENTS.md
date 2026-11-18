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

- Persistência: `expo-sqlite` **nativo** via `SqlExecutor` (`src/db/sqlExecutor.ts` + `expoSqliteAdapter.ts`)
- Web: **fora do v1** — `platforms: ["ios","android"]`; stub `expoSqliteAdapter.web.ts` evita puxar `wa-sqlite.wasm`
- Smoke Node: `node:sqlite` em `src/db/nodeSqliteAdapter.ts` (não importar no bundle do app; Node >= 22.13)
- Backup v1: `src/features/backup/backupService.ts` — import **substitui** tudo após validar schema e `confirmReplace: true`
- UI de export/import: `src/features/backup/BackupPanel.tsx` (Configurações)
- Estado de lista: Zustand em `src/features/peladas/peladaStore.ts`

## Como rodar

```bash
npx expo start --android   # ou --ios / Expo Go; NÃO use --web
```

## Navegação

- Home (`app/index.tsx`): lista + Entrar + FAB `+`
- Nova pelada: `app/pelada/nova.tsx`
- Hub: `app/pelada/[peladaId]/index.tsx` → Atletas / Jogos / Estatísticas / Configurações
- Formulário de pelada: `src/features/peladas/PeladaForm.tsx`
- Atletas: `app/pelada/[peladaId]/atletas/` (lista, novo, editar) + `src/features/atletas/AtletaForm.tsx`
- Fotos de atleta: `expo-image-picker` (câmera/galeria; URI local)

## Escopo por fase

- Fase 1: scaffold + DB + backup — feito
- Fase 2: Home + cadastro/edição + Hub + Config — feito
- Fase 3: Atletas (CRUD + foto) — atual
- Fase 4+: partida / fila / stats (placeholders no Hub)
