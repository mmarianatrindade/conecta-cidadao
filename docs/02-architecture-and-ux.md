# Arquitetura de informação e jornadas

## Navegação principal
- **Início:** busca, 9 categorias, atalhos e unidades em destaque.
- **Explorar:** pesquisa textual normalizada, filtros por categoria e por canal (digital/presencial), resultados.
- **Detalhes da unidade:** nome, serviços cadastrados, limitações, forma de acesso, checklist, fonte, data, mapa externo, salvar, avaliar e sinalizar informação.
- **Minha Jornada:** atendimentos, tarefas, estado concluído, favoritos e exclusão.
- **Experiências:** questionário privado estruturado, histórico, orientação para canal oficial.
- **Emergências:** acionamento telefônico direto 190/192/193/199, sem triagem.
- **Privacidade:** explicação dos dados locais e controle para apagá-los.

## Jornada A — Consulta de serviços de saúde
1. Usuário entra no aplicativo e busca 'UBS' ou 'pediatria'.
2. Explora os resultados e abre uma ficha.
3. Lê serviços cadastrados e restrições para acessar a unidade.
4. Consulta fonte oficial e/ou abre endereço no aplicativo de mapas.
5. Cria atendimento com tarefas de confirmação e documentação.
6. Após utilizar o serviço, registra experiência pessoal.

## Jornada B — Documentação
1. Busca 'identidade'.
2. Encontra Poupatempo Sé e/ou GOV.BR, conforme serviços cadastrados.
3. Lê a necessidade de agendamento e abre fonte oficial.
4. Cria checklist e salva atendimento.

## Jornada C — Segurança pública
1. Busca 'perda documentos'.
2. Encontra Delegacia Eletrônica SP.
3. Abre canal oficial para verificar elegibilidade.
4. Em risco imediato, usa modal Emergências, sem passar pela pesquisa.

## Design system
- Verde escuro `#155B49`, fundos claros `#F7F9F6`, corpo `#20372F`.
- Cartões com borda suave, espaçamento amplo, tipografia legível.
- Ícones sem dependência exclusiva de cor. Botões e alvos de toque >= 44 dp.
- Suporte aos recursos de acessibilidade do sistema, incluindo labels nos botões e controle de movimento reduzido na animação de transição.

## Mapa e localização
O MVP integra abertura de **rotas e pesquisas no mapa nativo/Google Maps por endereço oficial**. Não rastreia localização. Um mapa embutido com pinos georreferenciados exigiria coordenadas oficiais verificadas e tratamento de exceções; não foi inventado.

## Persistência
SQLite local por dispositivo: `favorites`, `journeys`, `tasks`, `feedbacks`, `corrections`. O catálogo inicial fica no módulo `src/data/catalog.ts` (dados públicos curados e versionados). O modelo de dados não utiliza dados sensíveis.

## Fluxo de compartilhamento futuro
Para tornar avaliações públicas, será necessário construir um backend com autenticação, política de retenção, privacidade, rate limiting, revisão de conteúdo, mecanismos de contestação, amostragem e transparência. O MVP não transmite avaliações.
