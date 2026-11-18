# Google Places API (New) — Decisões técnicas e de produto

## O que mudou

- Novo componente `src/components/GoogleAddressPicker.tsx`, dentro de **Explorar**.
- Serviço tipado `src/services/googleAddress.ts` para Autocomplete + Place Details.
- Proxy de API REST, sem bibliotecas extras, em `server/app.mjs` e `server/index.mjs`.
- Link para rotas em Google Maps usando endereço de partida selecionado.
- Demonstração web com campo de endereço quando aberta em `http://localhost:8787/demo`.

## Fluxo

```text
Cidadão digita endereço (>=3 caracteres)
  -> debounce 450 ms
  -> app chama GET /api/address/autocomplete?q=...&sessionToken=...
  -> proxy chama POST /v1/places:autocomplete (Google Places API New)
  -> cidadão escolhe sugestão
  -> app chama GET /api/address/details?placeId=...&sessionToken=...
  -> proxy chama GET /v1/places/{id} com FieldMask mínimo
  -> Google retorna formattedAddress + location
  -> app mostra confirmação; ao abrir unidade, botão 'Traçar rota'
  -> Google Maps externo recebe origem e destino
```

A origem está apenas na memória da sessão da interface e não é persistida. Não há leitura de GPS. A lista de unidades do Conecta Cidadão continua baseada em curadoria oficial: o Google apenas fornece endereço de partida e rota externa.

## Segurança

1. Não usar `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`; segredos expostos no bundle mobile não são segredos.
2. Configure a chave somente no servidor e ative restrição de API (**Places API (New)**); para produção, associe restrições de endereço IP aos IPs fixos de saída do servidor, quando possível.
3. O proxy devolve somente campos essenciais, sem mensagens internas do provedor ou credenciais.
4. O proxy de exemplo conta requisições por IP em memória. Isso **não substitui** autenticação, quota distribuída, proteção contra uso abusivo, autorização, HTTPS e proteção de custos em produção.
5. Se o app passar a armazenar endereço residencial ou compartilhar localização, será necessário atualizar os fluxos de consentimento e política de privacidade.

## Campos da API

Autocomplete New usa `sessionToken`, `languageCode: pt-BR`, `regionCode: BR` e `includedRegionCodes: ['br']`.

Place Details New usa `sessionToken` da mesma consulta e `X-Goog-FieldMask: id,formattedAddress,location`. Um token novo é criado após cada seleção.

## Endpoints locais

| Rota | Saída |
|---|---|
| `GET /health` | Estado do servidor e configuração |
| `GET /api/address/autocomplete?q=...&sessionToken=...` | `suggestions[]` com placeId, texto e partes do endereço |
| `GET /api/address/details?placeId=...&sessionToken=...` | `address` com endereço formatado, latitude e longitude |
| `GET /demo` | Demonstração HTML com busca Google disponível |

## Limitações conhecidas

- Não ordena unidades públicas por distância porque o catálogo inicial não inclui coordenadas verificadas para todos os estabelecimentos.
- Não disponibiliza mapa interno; a rota abre o Google Maps por link externo.
- Não é uma busca Google de UBS, especialidades ou documentos. É **autocomplete de endereço de partida**.
- Necessário testar iOS/Android com serviço configurado e chave válida; os testes incluídos usam mocks.
- O preview HTML aberto via `file://` não pode acessar o proxy na mesma origem.

## Referências oficiais

- https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
- https://developers.google.com/maps/documentation/places/web-service/place-details
- https://developers.google.com/maps/documentation/places/web-service/place-session-tokens
- https://developers.google.com/maps/api-security-best-practices
- https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
