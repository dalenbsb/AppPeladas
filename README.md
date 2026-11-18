# AppPeladas

App offline para organizar peladas (futebol amador): atletas, fila, partida ao vivo e estatísticas.

**Stack:** Expo (React Native) + TypeScript + Expo Router + `expo-sqlite`.

## Fase 1 (atual)

Scaffold, modelo de dados, migrations SQLite, repositórios CRUD e backup JSON (`exportToJson` / `importFromJson`).

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

### Lint / format

```bash
npm run lint
npm run format
```

## Estrutura

```
app/                 # Expo Router (UI mínima na Fase 1)
src/db/              # SQLite, migrations, repositórios
src/domain/          # Tipos + validação do backup
src/features/backup/ # export/import JSON
src/components/      # Componentes compartilhados
```
