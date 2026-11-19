# Checklist de publicação — AppPeladas v1

Checklist prático para Play Store e App Store.  
Privacidade: ver [privacidade.md](./privacidade.md).  
Builds: ver seção EAS no [README](../README.md).

## Antes do primeiro build

- [ ] Conta Expo (`eas login`)
- [ ] Projeto EAS vinculado (`eas init` / `eas build:configure`) — grava `extra.eas.projectId` em `app.json`
- [ ] `android.package` e `ios.bundleIdentifier` conferidos (`com.dalenbsb.apppeladas`)
- [ ] Ícone, splash e nome de exibição **AppPeladas** conferidos no aparelho (preview)
- [ ] Export/import testado em Configurações (JSON v1 + confirmação destrutiva)

## Android (Play Store)

- [ ] Conta Google Play Console
- [ ] App criado (nome: AppPeladas)
- [ ] Assinatura: keystore gerenciada pelo EAS **ou** keystore própria configurada em secrets EAS
- [ ] Build production AAB: `eas build -p android --profile production`
- [ ] Track interno/fechado com APK/AAB de preview antes do production
- [ ] Ficha da loja: título, descrição curta/longa, screenshots (telefone)
- [ ] Classificação de conteúdo preenchida
- [ ] Política de privacidade (URL) — texto base em [privacidade.md](./privacidade.md)
- [ ] Declaração de dados: **dados só no aparelho**; sem coleta para servidores do app; fotos locais; backup JSON só se o usuário exportar
- [ ] Permissões: câmera/galeria só para foto do atleta (textos já em `app.json`)

## iOS (App Store)

- [ ] Conta Apple Developer
- [ ] App ID / bundle `com.dalenbsb.apppeladas`
- [ ] Certificados/perfis via EAS (`eas credentials`) — exige login Apple
- [ ] Build production: `eas build -p ios --profile production`
- [ ] App Store Connect: ficha, screenshots, categoria (Sports / Lifestyle)
- [ ] Privacy Nutrition Labels: dados não coletados para tracking; armazenamento local; foto opcional no aparelho
- [ ] Texto de privacidade / URL alinhado a [privacidade.md](./privacidade.md)
- [ ] TestFlight com profile `preview` antes da submissão

## O que este repositório já cobre

| Item | Status |
|------|--------|
| Nome AppPeladas | `app.json` → `expo.name` |
| Ícone / splash / adaptive icon | `assets/images/*` + plugin splash |
| Profiles EAS preview/production | `eas.json` |
| Export/import com confirmação | Configurações → Backup |
| Nota de privacidade local-only | `docs/privacidade.md` |
| `projectId` EAS / secrets de loja | **Usuário** (login + credentials) |

## Comandos úteis (após login)

```bash
npx eas-cli login
npx eas-cli init
npx eas-cli build -p android --profile preview
npx eas-cli build -p android --profile production
npx eas-cli build -p ios --profile preview
npx eas-cli build -p ios --profile production
```

Builds instaláveis de loja dependem das contas e secrets acima; o código e o `eas.json` já estão preparados.
