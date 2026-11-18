# Conecta Cidadão · Navy Edition

**Versão 1.2.1 — correção e diagnóstico da integração Google Places.** O redesign inclui cabeçalho da marca, hero redesenhado, atalhos rápidos, novas fichas de unidades, indicadores na barra inferior, categoria em azul e identidade atualizada do ícone/splash. O catálogo de nove categorias, SQLite e o módulo de endereços Google Places (New) foram preservados. Veja [Design System Navy](docs/06-design-system-navy.md) e as prévias em `previews/`.

**Global Solution FIAP · CitizenTech · Aplicativo mobile React Native**

> Encontre o serviço certo. Organize sua jornada. Compartilhe sua experiência.

Este repositório é uma implementação mobile acadêmica funcional do **Conecta Cidadão**, com 9 categorias de serviços públicos, busca por necessidade, fichas informativas com fontes oficiais, favoritos, checklists, histórico de atendimentos e feedbacks estruturados armazenados localmente. Catálogo inicial de **São Paulo (capital)**.

## O que funciona no projeto

| Área | Recurso |
|---|---|
| Início | Busca por necessidade, categorias e atalhos |
| Explorar | Pesquisa textual, filtro por categoria e canal, 18 registros iniciais |
| Detalhes | Serviços, condição de acesso, checklist, fonte e data de verificação |
| Mapa | Abertura de unidades em Google Maps ou Apple Maps; rotas Google com origem selecionada quando a API está configurada |
| Minha Jornada | Adição e exclusão de atendimentos, tarefas persistentes e conclusão |
| Favoritos | Salvar e recuperar unidades |
| Experiências | Registro privado de tempo de espera, conclusão, acessibilidade e clareza |
| Informação incorreta | Anotação local de possível divergência |
| Emergências | Acesso direto aos números oficiais de socorro, sem triagem |
| Privacidade | Dados locais em SQLite com exclusão pelo usuário |

**Não incluído:** compartilhamento público de avaliações, integração em tempo real com órgãos, triagem médica, sistema de agendamento governamental, mapa embutido com pinos e compilação pronta em APK/IPA. Esses recursos exigem dados confirmados, serviços externos e testes adicionais.

## Tecnologias

- Expo SDK **58** (outubro de 2026) / React Native **0.88** / React **19.3**.
- TypeScript, Expo Linear Gradient, ícones Ionicons e `expo-sqlite`.
- `react-native-safe-area-context` para barras do sistema.
- Banco persistente local; não necessita de conta ou chave de API para o catálogo. A busca opcional Google precisa de uma chave **no servidor**, nunca no app. Se estiver indisponível, há um modo manual para usar um endereço digitado e abrir rotas no Google Maps sem a API.

## Rodar o projeto

Pré-requisito: Node.js **22.13+**, npm e Android/iOS com versão compatível do Expo Go ou um development build.

```bash
npm install
npx expo install --check
npx expo start
```

Se a versão do Expo Go no seu telefone ainda não suportar SDK 58, use uma **development build** conforme [documentação do Expo](https://docs.expo.dev/develop/development-builds/introduction/) ou instale a versão compatível quando disponível. Não altere arbitrariamente versões do SDK.

Abra o projeto no emulador ou no app Expo Go compatível. Os dados são carregados offline; links oficiais e mapas externos exigem internet.

### Testes de catálogo e TypeScript

```bash
npm run test:catalog
npm run check
```

## Arquitetura

```text
App.tsx                  # Interface, navegação, formulários e estados
src/data/catalog.ts      # Catálogo curado + links de fontes oficiais
src/data/categories.ts   # Nove categorias
src/data/types.ts        # Tipos de domínio
src/db/storage.ts        # SQLite e operações persistentes
src/utils/search.ts      # Busca e normalização
src/ui/                   # Paleta e links externos
src/components/          # Componentes visuais reutilizáveis
docs/                    # Brief, jornadas, arquitetura, testes e fontes
```

## Sobre os dados

Os endereços incluídos são derivados de páginas públicas oficiais identificadas, com `source` e `checkedAt` em cada ficha. A informação **não** representa disponibilidade atual de médicos, vagas, agendamentos, horários de cada serviço, filas ou elegibilidade individual. O catálogo não é exaustivo e não deve ser usado como único meio para decidir sobre situações de risco. Toda informação sensível deve ser confirmada junto ao órgão competente.

Os registros digitais foram propositalmente modelados sem endereço físico. Isso evita que o aplicativo simule estabelecimentos que não existem.

Para editar ou ampliar o catálogo, siga a estrutura em `src/data/catalog.ts` e execute `npm run test:catalog`.

## Segurança e privacidade

- Não coletamos CPF, localização precisa, login GOV.BR, diagnóstico ou dados de ocorrências policiais.
- Feedbacks e anotações **ficam somente no aparelho**, não são públicos nem chegam ao governo.
- Emergências: ligar diretamente 190 (Polícia Militar), 192 (SAMU), 193 (Bombeiros), 199 (Defesa Civil).
- Em situações médicas e policiais, informações cadastrais não substituem orientação de emergência.
- Fontes oficiais e relatos pessoais são apresentados separadamente.

## CI e operação

- GitHub Actions executa TypeScript e testes do catálogo/proxy a cada push e pull request.
- O servidor aceita `ALLOWED_ORIGINS` como lista separada por vírgulas e `RATE_LIMIT_MAX` para ajustar o limite local por IP.
- Em produção, mantenha HTTPS, restrições da chave no Google Cloud, limites compartilhados persistentes e monitoramento de consumo.
- Cada unidade do catálogo pode declarar `coordinates`, `reviewedBy` e `sourceHistory`; o validador verifica coordenadas e fontes quando esses campos existirem.

## Onde continuar

1. Validar problemas reais com 6–8 entrevistas e testes de usabilidade.
2. Aumentar cobertura de unidades e associar serviços individualmente a fontes e regras de acesso.
3. Executar testes nativos em aparelhos Android/iOS (incluindo leitor de tela).
4. Criar pipeline de atualização de dados com revisão editorial.
5. Para avaliações públicas, desenhar autenticação, moderação e tratamento conforme LGPD antes de conectar um backend.

Veja `docs/01-product-brief.md`, `docs/02-architecture-and-ux.md`, `docs/03-qa-and-backlog.md` e `docs/04-data-sources.md`.

## Aviso

Protótipo acadêmico independente. Não é um aplicativo oficial do Governo de São Paulo, de qualquer prefeitura, ou do Governo Federal. Verifique sempre os dados no canal oficial.

## Busca de endereços com Google Places API (New) — versão 1.2.1

O menu **Explorar** agora possui um campo independente chamado **“De onde você vai sair?”**. Ao digitar ao menos três caracteres, mostra sugestões de endereços do Brasil com Google Places Autocomplete. Ao selecionar uma sugestão, o app consulta os detalhes (endereço formatado e coordenadas) e disponibiliza o botão **“Traçar rota a partir do endereço escolhido”** nas fichas de unidades presenciais. Esse botão abre o Google Maps com origem e destino. Não há permissão de GPS nem armazenamento persistente do endereço escolhido.

**Importante:** a busca de endereço do Google **não** identifica a especialidade disponível em UBS, hospital ou delegacia, não valida os cadastros públicos e **não** filtra automaticamente o catálogo por proximidade. As unidades continuam vindo de fontes oficiais curadas. A rota é planejada pelo Google Maps externo.

### Configuração (necessária para usar a API real)

1. No [Google Cloud Console](https://console.cloud.google.com/), crie ou escolha um projeto, ative faturamento e habilite **Places API (New)**. Gere uma chave de API restrita a essa API. Essa integração utiliza a API REST por meio de um servidor; **não** cole a chave no React Native nem use `EXPO_PUBLIC_` para armazená-la.
2. Na pasta do projeto, copie `server/.env.example` para `server/.env` e substitua `REPLACE_WITH_YOUR_SERVER_ONLY_KEY` pelo valor real de `GOOGLE_MAPS_API_KEY`.
3. Copie `.env.example` para `.env` e configure a URL alcançável do seu servidor em `EXPO_PUBLIC_ADDRESS_API_BASE_URL`:
   - iOS Simulator: `http://localhost:8787`
   - Android Emulator: `http://10.0.2.2:8787`
   - Celular físico: `http://IP-DO-SEU-COMPUTADOR:8787` (ambos na mesma rede). **Para testes em rede pública ou produção, use HTTPS.**
4. Em um terminal, execute o servidor: `npm run address:server` (Node.js 22.13+). A partir desta versão, o comando não trava se `server/.env` ainda estiver ausente, mas a API permanecerá desativada. Confira `http://localhost:8787/health`, que deve retornar `googleConfigured: true` **somente após configurar a chave válida**. O indicador não comprova que faturamento e permissões estejam corretos: valide pesquisando um endereço.
5. Execute `npm run address:diagnose` para conferir configuração e conectividade, sem gastar chamadas do Google.
6. Em outro terminal, execute `npm install` e `npm run start`. Abra **Explorar**, pesquise um endereço, toque numa sugestão e depois abra uma unidade física para ver o botão de rota.

A demonstração HTML foi atualizada. Para testar sugestões reais no navegador, acesse **http://localhost:8787/demo** com o servidor rodando. Se abrir `demo-web.html` diretamente pelo disco (`file://`), o restante da demonstração funciona, mas a busca Google não tem backend disponível.

### Privacidade, limites e custos

- `GOOGLE_MAPS_API_KEY` permanece no servidor e é ignorada pelo Git. Nunca inclua chaves reais no repositório ou em capturas de tela.
- O texto digitado é enviado ao Google via servidor para gerar sugestões. Os dados de endereço não são salvos em favoritos, avaliações ou histórico. Nenhuma consulta é feita antes de a pessoa usar o campo.
- O servidor usa token de sessão, debounce de 450 ms, limite básico de 40 requisições/minuto por IP e só permite endereços no Brasil. Em produção, implemente autenticação, HTTPS, limitação distribuída, monitoramento de custos, limites de cota no Google Cloud e políticas de retenção/privacidade revisadas.
- **Places API (New) pode gerar cobranças.** Configure orçamento, alertas e cotas antes de testar com muitas pessoas. Solicitações incompletas podem ser cobradas individualmente.
- O app mantém a busca local de serviços funcionando quando a API não está configurada ou quando a rede está indisponível.

Documentação de integração em [`docs/05-google-address-api.md`](docs/05-google-address-api.md) e **diagnóstico passo a passo** em [`docs/07-google-api-diagnostico.md`](docs/07-google-api-diagnostico.md).

### Testes do módulo

```bash
npm run test:address
node --check server/app.mjs
```

Os testes automatizados simulam as respostas do Google; **não foram executadas consultas reais nem usado qualquer segredo** nesta entrega. A integração com a conta Google Cloud precisa ser validada com sua própria chave.


### Correções da versão 1.2.1

- Corrigida a falha de inicialização do servidor quando `server/.env` ainda não existe.
- Valores de exemplo da chave deixam de aparecer como se a API estivesse configurada.
- O app ganhou **Verificar conexão**, estados distintos para servidor offline e chave ausente, e mensagens do Google Cloud mais informativas.
- **Usar endereço digitado** funciona mesmo sem a API. Isso abre a rota externa no Google Maps, mas não valida o endereço nem fornece sugestões.
- A demonstração HTML também oferece esse modo manual e um teste de conexão.
- `npm run address:diagnose` verifica os arquivos de configuração e a conectividade local sem enviar endereço ao Google.
- No Android Emulator, `localhost` não aponta para o computador. Configure `http://10.0.2.2:8787`. Para celular físico use o IP LAN do computador ou um servidor HTTPS acessível.

**Nota de teste:** o projeto entregue não contém `server/.env` nem uma chave Google Cloud, por segurança. Sem essa configuração, não é possível verificar uma resposta real do Google Places; os testes automatizados cobrem o servidor com respostas simuladas.
