# AppPeladas

App offline para organizar peladas (futebol amador): atletas, fila, partida ao vivo e estatísticas.

**Stack:** Expo (React Native) + TypeScript + Expo Router + `expo-sqlite`.

## Fase 2 (atual)

Home com lista de peladas, cadastro/edição de parâmetros, Hub (Atletas / Jogos / Estatísticas / Configurações) e backup JSON nas Configurações. Atletas/Jogos/Estatísticas ainda são placeholders (Fases 3+).

### Rodar o app

```bash
npm install
npx expo start
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
app/                      # Expo Router (Home, pelada, Hub)
src/db/                   # SQLite, migrations, repositórios, DatabaseProvider
src/domain/               # Tipos + validação do backup
src/features/peladas/     # Formulário e store de peladas
src/features/backup/      # export/import JSON + painel de UI
src/components/           # FAB, checkbox, radio, selects
src/theme/                # Cores
```
