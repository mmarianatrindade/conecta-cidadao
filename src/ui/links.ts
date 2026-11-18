import { Alert, Linking, Platform } from 'react-native';
export async function visitUrl(url: string) {
  try { await Linking.openURL(url); } catch { Alert.alert('Não foi possível abrir', 'Confira sua conexão e tente novamente.'); }
}
export function openAddress(address: string) {
  const q=encodeURIComponent(address);
  const url=Platform.OS==='ios'?`https://maps.apple.com/?q=${q}`:`https://www.google.com/maps/search/?api=1&query=${q}`;
  return visitUrl(url);
}
/** Google Maps public directions link. No Maps API key is needed to open the app. */
export function openRoute(destination: string, origin?: string) {
  const params = new URLSearchParams({ api: '1', destination, travelmode: 'transit' });
  if (origin) params.set('origin', origin);
  return visitUrl(`https://www.google.com/maps/dir/?${params.toString()}`);
}
export async function phoneCall(number: string) {
  await visitUrl(`tel:${number}`);
}
