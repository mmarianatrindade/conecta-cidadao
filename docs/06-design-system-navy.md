# Conecta Cidadão · Design System — Navy Edition

Versão 1.2.0 · Global Solution FIAP

## Direção visual

Interface mobile contemporânea, acolhedora e profissional. O **azul-marinho** representa confiança e orientação; o azul de destaque sinaliza as ações; fundos quase brancos melhoram leitura e deixam o conteúdo em primeiro plano. Indicadores de emergência preservam diferenciação visual em vermelho.

| Token | Hex | Uso |
|---|---|---|
| Azul-marinho principal | `#0A2142` | Marca, destaques, botões e navegação |
| Azul profundo | `#081D3B` | Início do gradiente principal |
| Azul intermediário | `#133966` | Gradiente e ênfase |
| Azul de ação | `#176FA8` | Links, ícones e controles |
| Azul suave | `#E7F1FD` | Destaques leves e estados ativos |
| Texto | `#102845` | Títulos e corpo |
| Texto secundário | `#61758C` | Metadados e descrições |
| Fundo | `#F4F7FC` | Superfície geral |
| Divisórias | `#E0E9F3` | Contornos, separadores |
| Emergência | `#BF4657` | Acesso de socorro e avisos relevantes |

Implementação: `src/ui/theme.ts`, `src/data/categories.ts`, `src/components/Primitives.tsx` e `App.tsx`.

## Alterações entregues

- Identidade e nome do app em uma barra superior dedicada.
- Hero com fundo azul-marinho em gradiente, mensagem concisa, campo de busca e call to action.
- Três atalhos: Encontrar lugar, Minha jornada e Dar feedback.
- Cartões de categorias padronizados com ícones em tons de azul.
- Cartões de unidades com hierarquia entre categoria, nome, localização e descrição.
- Barra inferior com indicador claro da aba ativa.
- Cartões e formulários com bordas suaves e áreas de toque confortáveis.
- Ícone e splash recoloridos para azul-marinho e azul celeste.
- Demonstração HTML harmonizada com a identidade React Native.
- Fluxo de endereços da Google Places API (New) mantido com proxy no servidor.

## QA

Demonstração web executada em Chromium via Playwright: início, exploração, detalhe, criar jornada e avaliação passaram sem erros de JavaScript; imagens de verificação em `/previews/`.

Catálogo: 18 registros, 9 categorias, fontes HTTPS. Proxy da API Google: cinco testes automatizados com respostas simuladas.

**Limitações:** não foi gerado APK/IPA nem realizada compilação nativa com dependências Expo instaladas neste ambiente; a Google Places API real só funcionará após configurar faturamento, Places API (New), chave restrita no servidor e URL do backend no app. Os feedbacks permanecem locais e não são enviados aos órgãos públicos.

## Acessibilidade

Evitar comunicações exclusivamente por cor; preservar rótulos claros nas ações, tipografia legível, contraste entre texto e superfícies, alvos de toque de pelo menos 44 px quando possível, preferências de movimento reduzido no app e foco visível na demonstração web. Ainda são necessários testes reais com VoiceOver/TalkBack e tamanhos de fonte ampliados.
