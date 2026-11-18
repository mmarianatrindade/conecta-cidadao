# QA, checklist e backlog

## Casos manuais de teste
1. Abrir Início, selecionar Saúde e ver unidades correspondentes.
2. Pesquisar 'perdi documentos' (aceitar resultados relevantes) e abrir Delegacia Eletrônica.
3. Digitar 'UBS', abrir ficha e conferir fontes e datas.
4. Selecionar unidade presencial e acionar 'Ver endereço no mapa'.
5. Favoritar unidade, fechar e reabrir aplicativo, verificar favorita persistida.
6. Criar atendimento, marcar uma tarefa, fechar e reabrir, verificar persistência.
7. Concluir atendimento e verificar mudança de status.
8. Registrar avaliação de uma unidade, validar resultado e histórico.
9. Abrir números de emergência, confirmar que abre discador sem intermediação.
10. Tentar feedback sem selecionar unidade (esperar alerta de validação).
11. Apagar dados locais e verificar favoritos, jornadas e feedbacks limpos.
12. Testar leitor de tela, fontes ampliadas, contraste e animação reduzida em Android e iOS.
13. Testar sem internet (catálogo e registro local; links externos podem falhar).

## Backlog pós-MVP
- Importação automatizada de fontes abertas em lotes versionados com validação.
- Coordenadas oficialmente verificadas para mapa embutido.
- Fluxo editorial de verificação de informações da unidade.
- Pesquisa de usuários e teste A/B com portais oficiais.
- Busca com sinônimos e linguagem natural sem enviar dados sensíveis.
- Notificações locais de compromissos (com permissão).
- Acessibilidade expandida para dislexia e baixa alfabetização digital.
- Backend para avaliações *apenas após* política de moderação e consentimento.
- Melhorias específicas por categoria (informação de territorialidade de UBS, requisitos por procedimento e horas de atendimento por serviço).

## Limites importantes
Este código é um MVP funcional para estudo, não um serviço governamental homologado. Os dados não são atualizados em tempo real. O repositório não inclui APK/IPA compilado nem publicação na loja. Testes nativos dependem de ambiente com Node e dependências instaladas.
