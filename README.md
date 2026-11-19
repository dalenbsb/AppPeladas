# AppPeladas

App offline para organizar peladas (futebol amador): atletas, fila, partida ao vivo, estatísticas e backup JSON.

**Stack:** Expo (React Native) + TypeScript + Expo Router + `expo-sqlite` (nativo iOS/Android).  
**Nome na loja / aparelho:** AppPeladas.

## Fase 7 (atual) — polish + publicação

- UX: estados vazios, confirmações destrutivas, erros claros de import
- Ícone, splash e adaptive icon próprios (verde campo + bola)
- Export/import em **Configurações** (Backup e portabilidade + nota de privacidade local)
- `eas.json` com profiles `development`, `preview` e `production`
- Checklist de lojas e privacidade em [`docs/`](./docs/)

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

### Smoke / qualidade

```bash
npm run smoke
npm run smoke:sorteio
npm run smoke:partida
npm run lint
npm run typecheck
```

## EAS Build (requer conta do usuário)

Este repositório traz `eas.json`, package/bundle id e assets de marca.  
**Não há** `extra.eas.projectId` nem credentials de loja no git — você precisa autenticar uma vez.

### 1. Login Expo

```bash
npx eas-cli login
```

Crie conta em https://expo.dev se ainda não tiver.

### 2. Vincular o projeto EAS

Na raiz do repo:

```bash
npx eas-cli init
```

Isso grava `expo.extra.eas.projectId` em `app.json` (pode commitar esse id; **não** commite tokens).

Alternativa equivalente:

```bash
npx eas-cli build:configure
```

### 3. Builds de preview (instaláveis no aparelho)

```bash
npx eas-cli build -p android --profile preview
npx eas-cli build -p ios --profile preview
```

- Android `preview` → APK interno  
- iOS `preview` → precisa de Apple Developer + `eas credentials` (login Apple)

### 4. Builds de produção (lojas)

```bash
npx eas-cli build -p android --profile production
npx eas-cli build -p ios --profile production
```

- Android production → **AAB**  
- iOS production → IPA para App Store Connect / TestFlight

### 5. Secrets que só você pode fornecer

| Item | Quem |
|------|------|
| Conta Expo | Você (`eas login`) |
| `projectId` EAS | Gerado por `eas init` |
| Keystore Android / Play Console | Você / EAS credentials |
| Apple Developer + certificados | Você (`eas credentials`) |
| Contas Play Store / App Store Connect | Você |

Checklist completo: [`docs/checklist-lojas.md`](./docs/checklist-lojas.md).  
Privacidade (dados só no aparelho): [`docs/privacidade.md`](./docs/privacidade.md).

### Regenerar ícones (opcional)

```bash
node scripts/generate-brand-assets.js
```

## Estrutura

```
app/                      # Expo Router (Home, pelada, Hub, atletas, jogos)
docs/                     # Checklist de lojas + privacidade
src/db/                   # SQLite nativo, migrations, repositórios
src/domain/               # Tipos + validação do backup
src/features/peladas/     # Formulário e store de peladas
src/features/atletas/     # Formulário e labels de atletas
src/features/jogos/       # Fila, sorteio, partida ao vivo
src/features/backup/      # export/import JSON + painel de UI
src/components/           # FAB, EmptyState, selects
src/theme/                # Cores
eas.json                  # Profiles EAS preview/production
```
