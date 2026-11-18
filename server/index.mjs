import { hasUsableApiKey, makeAddressServer } from './app.mjs';
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '0.0.0.0';
makeAddressServer().listen(port, host, () => {
  console.log(`Conecta Cidadão: servidor de endereços em http://${host}:${port}`);
  console.log(hasUsableApiKey(process.env.GOOGLE_MAPS_API_KEY) ? 'Chave configurada. Google Places ainda depende de API ativada, faturamento e restrições corretas.' : 'Google Places DESATIVADO: crie server/.env e configure uma chave válida. Rotas manuais continuam disponíveis no app.');
});
