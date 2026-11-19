# Privacidade — AppPeladas v1

## Resumo

O AppPeladas guarda **todos os dados só neste aparelho**.  
Não há conta, nuvem, sync entre dispositivos nem telemetria de produto no v1.

## O que fica no aparelho

- Peladas, atletas, fila, partidas, eventos e estatísticas (SQLite local)
- Fotos de atletas escolhidas pelo usuário (URI/arquivo local)
- Preferências da pelada (duração, regras, etc.)

## O que o app **não** faz no v1

- Não cria conta nem login
- Não envia dados a servidores do AppPeladas
- Não sincroniza entre celulares
- Não usa os dados para anúncios ou tracking

## Backup JSON

- **Exportar:** gera um arquivo JSON no aparelho; o usuário escolhe onde salvar/compartilhar
- **Importar:** substitui **todos** os dados locais após confirmação explícita
- O app não envia o backup para a nuvem por conta própria

## Permissões

- **Câmera / galeria:** apenas para foto do atleta, se o usuário escolher
- Sem localização, contatos ou microfone no v1

## Contato

Para dúvidas sobre esta política no contexto da publicação nas lojas, use o contato do desenvolvedor na ficha da loja.
