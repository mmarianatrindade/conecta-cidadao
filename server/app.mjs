/**
 * Google Places API (New) relay for Conecta Cidadão.
 * Keeps GOOGLE_MAPS_API_KEY server-side. For public production deployment,
 * add user authentication, HTTPS, persistent rate limits and quota alerts.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DEFAULT_ENDPOINT = 'https://places.googleapis.com/v1';
const idPattern = /^[A-Za-z0-9_\-]{3,256}$/;
const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const minute = 60_000;

export function hasUsableApiKey(key) {
  return typeof key === 'string' && key.trim().length >= 20 &&
    !/REPLACE|YOUR[_ -]?KEY|EXAMPLE|COLE|INSIRA/i.test(key);
}

function googleError(responseStatus, providerCode) {
  if (responseStatus === 429 || providerCode === 'RESOURCE_EXHAUSTED') return 'Limite de uso do Google atingido. Confira cotas e faturamento no Google Cloud.';
  if (responseStatus === 401 || responseStatus === 403 || providerCode === 'PERMISSION_DENIED') return 'Google Places recusou a chave. Confira Places API (New), faturamento e restrições da credencial.';
  if (responseStatus === 400 || providerCode === 'INVALID_ARGUMENT') return 'O Google recusou os parâmetros da pesquisa. Verifique a configuração da Places API (New).';
  return 'O Google não conseguiu processar o pedido. Tente novamente ou confira o painel do Google Cloud.';
}

async function mapGoogleFailure(response, res) {
  let providerCode;
  try { const data = await response.json(); providerCode = data?.error?.status; } catch {}
  return json(res, 502, { error: googleError(response.status, providerCode), googleHttpStatus: response.status });
}


function json(res, status, value, extra = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extra,
  });
  res.end(JSON.stringify(value));
}

export function makeAddressServer({
  apiKey = process.env.GOOGLE_MAPS_API_KEY,
  fetchImpl = fetch,
  endpoint = DEFAULT_ENDPOINT,
  rateMax = 40,
  serveDemo = true,
} = {}) {
  const calls = new Map();
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido.' });
      if (url.pathname === '/health') return json(res, 200, { running: true, googleConfigured: hasUsableApiKey(apiKey), provider: 'Places API (New)' });
      if (url.pathname === '/demo' && serveDemo) {
        const html = await readFile(fileURLToPath(new URL('../demo-web.html', import.meta.url)));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        res.end(html);
        return;
      }
      if (!['/api/address/autocomplete', '/api/address/details'].includes(url.pathname)) return json(res, 404, { error: 'Rota não encontrada.' });
      if (!hasUsableApiKey(apiKey)) return json(res, 503, { error: 'Chave do Google ausente ou ainda com valor de exemplo. Configure GOOGLE_MAPS_API_KEY em server/.env.' });

      // Per-IP development throttle; use a shared persistent limiter and authentication in production.
      const client = req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      for (const [ip, record] of calls) if (now - record.starts > minute) calls.delete(ip);
      let record = calls.get(client);
      if (!record) { record = { starts: now, count: 0 }; calls.set(client, record); }
      if (++record.count > rateMax) return json(res, 429, { error: 'Muitas consultas. Tente novamente em um minuto.' });

      const sessionToken = url.searchParams.get('sessionToken') || '';
      if (!tokenPattern.test(sessionToken)) return json(res, 400, { error: 'Sessão de pesquisa inválida.' });
      const headers = { 'X-Goog-Api-Key': apiKey, 'Accept': 'application/json' };
      let result;
      if (url.pathname === '/api/address/autocomplete') {
        const q = (url.searchParams.get('q') || '').trim();
        if (q.length < 3 || q.length > 160) return json(res, 400, { error: 'Digite de 3 a 160 caracteres.' });
        result = await fetchImpl(`${endpoint}/places:autocomplete`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: q, sessionToken, languageCode: 'pt-BR', regionCode: 'BR', includedRegionCodes: ['br'], includeQueryPredictions: false }),
          signal: AbortSignal.timeout(7000),
        });
        if (!result.ok) return mapGoogleFailure(result, res);
        const payload = await result.json();
        const suggestions = (Array.isArray(payload.suggestions) ? payload.suggestions : [])
          .map((s) => s.placePrediction)
          .filter((p) => p && typeof p.placeId === 'string' && idPattern.test(p.placeId))
          .slice(0, 6)
          .map((p) => ({
            placeId: p.placeId,
            label: p.text?.text || '',
            mainText: p.structuredFormat?.mainText?.text || p.text?.text || '',
            secondaryText: p.structuredFormat?.secondaryText?.text || '',
          }));
        return json(res, 200, { suggestions });
      }

      const placeId = url.searchParams.get('placeId') || '';
      if (!idPattern.test(placeId)) return json(res, 400, { error: 'Identificador de endereço inválido.' });
      const placeUrl = `${endpoint}/places/${encodeURIComponent(placeId)}?languageCode=pt-BR&regionCode=BR&sessionToken=${encodeURIComponent(sessionToken)}`;
      result = await fetchImpl(placeUrl, {
        headers: { ...headers, 'X-Goog-FieldMask': 'id,formattedAddress,location' },
        signal: AbortSignal.timeout(7000),
      });
      if (!result.ok) return mapGoogleFailure(result, res);
      const payload = await result.json();
      const latitude = payload.location?.latitude;
      const longitude = payload.location?.longitude;
      if (typeof payload.formattedAddress !== 'string' || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return json(res, 502, { error: 'O Google não retornou a localização completa.' });
      }
      return json(res, 200, { address: { placeId: payload.id || placeId, formattedAddress: payload.formattedAddress, latitude, longitude } });
    } catch (e) {
      if (e?.name === 'TimeoutError' || e?.name === 'AbortError') return json(res, 504, { error: 'A consulta demorou demais. Tente novamente.' });
      return json(res, 502, { error: 'Falha temporária ao consultar o Google Places.' });
    }
  });
}
