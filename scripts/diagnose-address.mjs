/** Diagnóstico local da integração, sem cobrar requisições do Google. */
import { readFile, access } from 'node:fs/promises';
import { hasUsableApiKey } from '../server/app.mjs';

async function envFile(path) {
  try {
    const content = await readFile(path,'utf8');
    const entries = {};
    for (const line of content.split(/\r?\n/)) {
      const match=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match) entries[match[1]]=match[2].replace(/^['"]|['"]$/g,'').trim();
    }
    return entries;
  } catch { return null; }
}
const mobile=await envFile('.env');
const server=await envFile('server/.env');
const key=process.env.GOOGLE_MAPS_API_KEY || server?.GOOGLE_MAPS_API_KEY;
const base=process.env.EXPO_PUBLIC_ADDRESS_API_BASE_URL || mobile?.EXPO_PUBLIC_ADDRESS_API_BASE_URL;
let problems=0;
function row(ok,msg){console.log((ok?'OK ':'AÇÃO ')+msg);if(!ok)problems++;}
row(Boolean(server), 'server/.env presente (copie server/.env.example para criar)');
row(hasUsableApiKey(key), 'GOOGLE_MAPS_API_KEY definida no servidor (nunca no Expo)');
row(Boolean(mobile), '.env presente (copie .env.example para criar)');
row(Boolean(base && /^https?:\/\//i.test(base)), 'EXPO_PUBLIC_ADDRESS_API_BASE_URL com URL HTTP(S)');
if(base && /localhost|127\.0\.0\.1/i.test(base)) console.log('AVISO: localhost funciona no computador/iOS Simulator; use 10.0.2.2 no Android Emulator ou IP local no aparelho físico.');
const localBase=base && /^https?:\/\//i.test(base) ? base.replace(/\/+$/,'') : 'http://localhost:8787';
try {
  const controller = new AbortController();const timer=setTimeout(()=>controller.abort(),2500);
  try {
    const res=await fetch(localBase+'/health',{signal:controller.signal});
    const info=await res.json();
    row(res.ok && info.running, 'servidor de endereços acessível em '+localBase);
    row(info.googleConfigured, 'servidor reconhece chave Google configurada');
  } finally {clearTimeout(timer);}
} catch { row(false,'servidor inacessível em '+localBase+'; inicie npm run address:server e confira a URL'); }
console.log('\nEste diagnóstico não consulta o Google. Para testar sugestões reais, configure a chave e digite um endereço no app.');
process.exitCode=problems?1:0;
