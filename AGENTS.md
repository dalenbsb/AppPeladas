# AppPeladas — notas para agentes

## Stack

Expo SDK 58 + TypeScript + Expo Router. Rotas em `app/` na raiz (não em `src/app/`). Código de domínio/dados em `src/`.

Antes de usar APIs Expo, confira a versão em `package.json` e a doc em `https://docs.expo.dev/versions/v58.0.0/`.

## Comandos

```bash
npx expo install <package>
npx expo start --android   # ou --ios / Expo Go; NÃO use --web
npm run smoke
npm run smoke:sorteio
npm run smoke:partida
npx expo lint
npm run typecheck
```

## Dados

- Persistência: `expo-sqlite` **nativo** via `SqlExecutor` (`src/db/sqlExecutor.ts` + `expoSqliteAdapter.ts`)
- Web: **fora do v1** — `platforms: ["ios","android"]`; stub `expoSqliteAdapter.web.ts` evita puxar `wa-sqlite.wasm`
- Smoke Node: `node:sqlite` em `src/db/nodeSqliteAdapter.ts` (não importar no bundle do app; Node >= 22.13)
- Backup v1: `src/features/backup/backupService.ts` — import **substitui** tudo após validar schema e `confirmReplace: true`
- UI de export/import: `src/features/backup/BackupPanel.tsx` (Configurações)
- Erros de import amigáveis: `src/features/backup/formatBackupError.ts`
- Estado de lista: Zustand em `src/features/peladas/peladaStore.ts`

## Marca / EAS

- Nome: **AppPeladas** (`app.json`)
- Ícones: `assets/images/icon.png`, splash, adaptive Android; regenerar com `node scripts/generate-brand-assets.js`
- Package / bundle: `com.dalenbsb.apppeladas`
- Profiles: `eas.json` (`preview`, `production`)
- `projectId` e credentials de loja **não** ficam no repo até o usuário rodar `eas login` + `eas init`
- Docs: `docs/checklist-lojas.md`, `docs/privacidade.md`

## Navegação

- Home (`app/index.tsx`): lista + Entrar + FAB `+`
- Nova pelada: `app/pelada/nova.tsx`
- Hub: `app/pelada/[peladaId]/index.tsx` → Atletas / Jogos / Estatísticas / Configurações
- Formulário de pelada: `src/features/peladas/PeladaForm.tsx`
- Atletas: `app/pelada/[peladaId]/atletas/` (lista, novo, editar) + `src/features/atletas/AtletaForm.tsx`
- Fotos de atleta: `expo-image-picker` (câmera/galeria; URI local)
- Jogos: ordem de chegada / partida ao vivo / próximos times
- Configurações: parâmetros da pelada + Backup e portabilidade

## Escopo por fase

- Fase 1–5: scaffold, peladas, atletas, fila/sorteio, partida ao vivo — feito
- Fase 6: estatísticas agregadas — placeholder no Hub
- Fase 7: polish UX, marca, EAS, checklist de lojas — atual
