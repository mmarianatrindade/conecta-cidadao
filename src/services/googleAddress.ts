/** Google Places (New) por proxy local; nunca exponha a chave em EXPO_PUBLIC. */
import { Platform } from 'react-native';

export type AddressSuggestion = { placeId: string; label: string; mainText: string; secondaryText: string };
export type SelectedAddress =
  | { source: 'google'; placeId: string; formattedAddress: string; latitude: number; longitude: number }
  | { source: 'manual'; placeId: null; formattedAddress: string };

type ApiObject = Record<string, unknown>;
function isObject(value: unknown): value is ApiObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const configuredBase = (process.env.EXPO_PUBLIC_ADDRESS_API_BASE_URL || '').trim().replace(/\/+$/, '');
export const addressApiConfigured = /^https?:\/\//i.test(configuredBase);

export function apiConnectionHint() {
  if (!addressApiConfigured) return 'Endereço da API não configurado. Copie .env.example para .env e informe o URL do servidor.';
  if (/localhost|127\.0\.0\.1/i.test(configuredBase) && Platform.OS === 'android')
    return 'No Android, localhost é o próprio aparelho. Use 10.0.2.2 no emulador ou o IP do computador no celular físico.';
  return 'Confira se o servidor está ligado e acessível neste dispositivo. Em celulares físicos, use HTTPS ou o IP do computador na mesma rede.';
}

export function newGoogleSessionToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const n = Math.floor(Math.random() * 16);
    return (char === 'x' ? n : ((n & 3) | 8)).toString(16);
  });
}

async function request(path: string, signal?: AbortSignal): Promise<unknown> {
  if (!addressApiConfigured) throw new Error(apiConnectionHint());
  let response: Response;
  try {
    response = await fetch(`${configuredBase}${path}`, { signal, headers: { Accept: 'application/json' } });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new Error(`Não foi possível acessar o servidor de endereços. ${apiConnectionHint()}`);
  }
  let body: unknown;
  try { body = await response.json(); } catch { throw new Error('O servidor respondeu sem um JSON válido. Verifique a URL configurada.'); }
  const message = isObject(body) && typeof body.error === 'string' ? body.error : null;
  if (!response.ok) throw new Error(message || `Erro HTTP ${response.status} no servidor de endereços.`);
  return body;
}

export async function checkAddressApiStatus(): Promise<{ running: boolean; googleConfigured: boolean }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await request('/health', controller.signal);
    if (!isObject(response) || typeof response.running !== 'boolean' || typeof response.googleConfigured !== 'boolean')
      throw new Error('O servidor de endereços retornou um status inválido.');
    if (!response.running) throw new Error('Servidor de endereços não está pronto.');
    return { running: true, googleConfigured: response.googleConfigured };
  } catch (e) {
    if (controller.signal.aborted) throw new Error(`A conexão expirou. ${apiConnectionHint()}`);
    throw e;
  } finally { clearTimeout(timeout); }
}

export async function autocompleteAddresses(input: string, sessionToken: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  if (input.trim().length < 3) return [];
  const qs = new URLSearchParams({ q: input.trim(), sessionToken });
  const response = await request(`/api/address/autocomplete?${qs}`, signal);
  if (!isObject(response) || !Array.isArray(response.suggestions))
    throw new Error('O servidor retornou sugestões de endereço em um formato inválido.');
  return response.suggestions.map((item, index) => {
    if (!isObject(item) ||
      typeof item.placeId !== 'string' ||
      typeof item.label !== 'string' ||
      typeof item.mainText !== 'string' ||
      typeof item.secondaryText !== 'string' ||
      !(item.label || item.mainText)) {
      throw new Error(`A sugestão de endereço ${index + 1} veio em um formato inválido.`);
    }
    return {
      placeId: item.placeId,
      label: item.label,
      mainText: item.mainText,
      secondaryText: item.secondaryText,
    };
  });
}

export async function resolveAddress(placeId: string, sessionToken: string, signal?: AbortSignal): Promise<SelectedAddress> {
  const qs = new URLSearchParams({ placeId, sessionToken });
  const response = await request(`/api/address/details?${qs}`, signal);
  const address = isObject(response) && isObject(response.address) ? response.address : null;
  if (!address ||
    typeof address.placeId !== 'string' ||
    typeof address.formattedAddress !== 'string' ||
    !address.formattedAddress.trim() ||
    typeof address.latitude !== 'number' ||
    !Number.isFinite(address.latitude) ||
    address.latitude < -90 ||
    address.latitude > 90 ||
    typeof address.longitude !== 'number' ||
    !Number.isFinite(address.longitude) ||
    address.longitude < -180 ||
    address.longitude > 180)
    throw new Error('O Google não retornou coordenadas para o endereço selecionado.');
  return {
    source: 'google',
    placeId: address.placeId,
    formattedAddress: address.formattedAddress,
    latitude: address.latitude,
    longitude: address.longitude,
  };
}
