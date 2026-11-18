# AppPeladas

App offline para organizar peladas (futebol amador): atletas, fila, partida ao vivo e estatísticas.

**Stack:** Expo (React Native) + TypeScript + Expo Router + `expo-sqlite` (nativo iOS/Android).

## Fase 3 (atual)

CRUD de atletas por pelada: lista + FAB, formulário (foto via `expo-image-picker`, nome, posição, celular, nascimento, ativo, mensalista, camisa, melhor pé), editar e excluir com confirmação. Hub → Atletas já leva à lista. Jogos/Estatísticas seguem como placeholders (Fases 4+).

### Rodar o app (mobile — não use web)

v1 é **só iOS/Android**. O SQLite do app usa o módulo nativo; no navegador o Metro tenta carregar `wa-sqlite.wasm` e falha.

```bash
npm install
npx expo start
```

No menu do Expo, escolha **Android** (`a`) ou **iOS** (`i`), ou:

```bash
npx expo start --android
npx expo start --ios
```

No Windows, o caminho típico é Expo Go no celular (mesmo Wi‑Fi) ou emulador Android:

```bash
npm run android
```

Evite `w` / `--web` — web não é suportado no v1.

Se o Metro ainda estiver com cache antigo:

```bash
npx expo start --clear --android
```

### Smoke test (backup round-trip)

Grava pelada fake → exporta → limpa → importa → confere igualdade (exceto `exportedAt`).
Usa `node:sqlite` (Node >= 22.13) — sem compilação nativa:

```bash
npm run smoke
```

### Lint / types

```bash
npm run lint
npx tsc --noEmit
npm run format
```

## Estrutura

```
app/                      # Expo Router (Home, pelada, Hub, atletas)
src/db/                   # SQLite nativo, migrations, repositórios, DatabaseProvider
src/domain/               # Tipos + validação do backup
src/features/peladas/     # Formulário e store de peladas
src/features/atletas/     # Formulário e labels de atletas
src/features/backup/      # export/import JSON + painel de UI
src/components/           # FAB, checkbox, radio, selects
src/theme/                # Cores
```
