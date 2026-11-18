# AppPeladas

App offline para organizar peladas (futebol amador): atletas, fila, partida ao vivo e estatísticas.

**Stack:** Expo (React Native) + TypeScript + Expo Router + `expo-sqlite` (nativo iOS/Android).

## Fase 4 (atual)

Tela **Jogos** com abas:

1. **Ordem de chegada** — lista arrastável, FAB com adicionar peladeiro / sorteio / limpar
2. **Partida** — esqueleto dos dois times (N por lado); ao vivo na Fase 5
3. **Próximos times** — blocos de N a partir da fila após os times em campo

Critérios de sorteio da pelada: sequencial (`sem_sorteio` / só ordem) ou balanceado (posição / nível técnico com `mensalista` como proxy v1).

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

### Smoke tests

```bash
npm run smoke
npm run smoke:sorteio
```

### Lint / types

```bash
npm run lint
npx tsc --noEmit
npm run format
```

## Estrutura

```
app/                      # Expo Router (Home, pelada, Hub, atletas, jogos)
src/db/                   # SQLite nativo, migrations, repositórios, DatabaseProvider
src/domain/               # Tipos + validação do backup
src/features/peladas/     # Formulário e store de peladas
src/features/atletas/     # Formulário e labels de atletas
src/features/jogos/       # Fila, sorteio, montagem de times, UI das abas
src/features/backup/      # export/import JSON + painel de UI
src/components/           # FAB, checkbox, radio, selects
src/theme/                # Cores
```
