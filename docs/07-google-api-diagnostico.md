# Google Places — Como configurar e diagnosticar a busca

## Por que não funcionava na versão 1.2?

A versão anterior tinha um script `node --env-file=server/.env` que encerrava o servidor quando `server/.env` estava ausente. Além disso, o ZIP distribuído não incluía uma chave Google Cloud nem o arquivo `.env`, de propósito para evitar vazamento de credenciais. A demonstração HTML aberta diretamente do disco não tem um servidor capaz de conversar com o Google.

A versão 1.2.1 inicia o servidor sem o arquivo, mas retorna um status claro de **chave ausente** até você configurá-la. O app tem um botão **Verificar** e uma opção **Usar endereço digitado** como alternativa.

## Configuração segura

1. No Google Cloud Console, selecione um projeto com **faturamento ativo** e habilite **Places API (New)**. Não use apenas o serviço legado.
2. Crie uma chave **do servidor**, restrita à Places API (New) e, no ambiente de produção, aos IPs de saída do seu backend. Não use uma chave restrita a Android/iOS/Websites para o proxy REST Node sem revisar as restrições.
3. Na pasta do projeto, execute `cp server/.env.example server/.env` (Windows PowerShell: `Copy-Item server/.env.example server/.env`) e edite **somente no seu computador** `GOOGLE_MAPS_API_KEY`. Não envie a chave para chats ou GitHub.
4. Execute `cp .env.example .env` (Windows PowerShell: `Copy-Item .env.example .env`) e configure `EXPO_PUBLIC_ADDRESS_API_BASE_URL` com a URL de acesso ao **seu servidor**, não com `places.googleapis.com`.
5. Em um terminal: `npm run address:server`. Em outro: `npm run address:diagnose`. Em outro: `npx expo start -c` para recarregar variáveis públicas.
6. No app, abra **Explorar → De onde você vai sair? → Verificar**. Se o servidor estiver acessível e com chave definida, digite `Avenida Paulista, São Paulo` para testar as sugestões reais.

**Endereço do servidor conforme onde o app roda:**

- Navegador no mesmo PC e iOS Simulator: `http://localhost:8787`
- Android Emulator: `http://10.0.2.2:8787`
- Celular físico: `http://IP-LOCAL-DO-COMPUTADOR:8787`, estando na mesma rede e permitindo conexão no firewall
- Aplicativo publicado: backend hospedado por HTTPS. Não use `localhost` nem IP privado.

**Demonstração web:** o arquivo `demo-web.html` aberto pelo explorador de arquivos funciona para o catálogo e rotas manuais, mas **não** para o Google Places. Após iniciar o servidor, abra `http://localhost:8787/demo` no navegador do mesmo computador para testar sugestões com sua chave.

## Como interpretar os erros

| Mensagem | Explicação | Próximo passo |
|---|---|---|
| API não configurada | Falta `.env` do Expo ou URL do servidor | Configure `EXPO_PUBLIC_ADDRESS_API_BASE_URL` e reinicie Expo |
| Servidor inacessível | URL errada, backend parado, firewall ou `localhost` no celular | Teste a rota `/health` a partir do dispositivo, revise IP e rede |
| Servidor conectado, mas falta chave | `server/.env` ausente, vazio ou com placeholder | Configure `GOOGLE_MAPS_API_KEY` no backend |
| Google recusou a chave / HTTP 403 | Places API (New), faturamento ou restrição de chave incorretos | Revise configurações do projeto Cloud, não compartilhe a chave |
| Limite de uso atingido | Cota, limite ou faturamento | Veja o painel de cotas e custos do Google Cloud |
| Nenhuma sugestão | Não há correspondências ou termos incompletos | Tente rua + bairro + cidade, ou use modo manual |

## O que foi efetivamente testado nesta entrega

- Proxy, autorização e erros com **Google simulado**: testes automatizados.
- Inicialização do servidor sem `.env` e retorno `/health` e HTTP 503: teste de servidor local.
- Demonstração HTML: digitação manual, sugestões simuladas, seleção de endereço e ação de rota: teste de interface isolado.
- Chave real do Google Cloud: **não validada**, porque o projeto entregue não contém uma credencial ativa. É necessário configurar a sua.

## Segurança e custos

Não coloque a chave em `EXPO_PUBLIC_*`, nunca a inclua no Git e não a envie em mensagens. Configure orçamento/cotas no Google Cloud; consultas à Places API (New) podem ser cobradas. Em produção o proxy deve ter HTTPS, autenticação, limites distribuídos e proteção contra abuso. A opção manual abre o Google Maps por URL sem uma chave Places — o endereço digitado não é validado previamente.

## Documentação do provedor

- https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
- https://developers.google.com/maps/documentation/places/web-service/place-details
- https://developers.google.com/maps/documentation/places/web-service/place-session-tokens
- https://developers.google.com/maps/api-security-best-practices
