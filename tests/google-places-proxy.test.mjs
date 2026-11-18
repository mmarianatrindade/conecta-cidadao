import assert from 'node:assert/strict';
import { test } from 'node:test';
import { makeAddressServer } from '../server/app.mjs';

const TOKEN = '12345678-1234-4123-8123-123456789abc';
async function withServer(config, run) {
  const server = makeAddressServer({ serveDemo: false, ...config });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}
test('without key responds safely', async () => {
  await withServer({ apiKey: '' }, async url => {
    const r = await fetch(`${url}/api/address/autocomplete?q=Rua%20Augusta&sessionToken=${TOKEN}`);
    assert.equal(r.status, 503);
    assert.match((await r.json()).error, /chave|configur/i);
  });
});
test('autocomplete proxies to Places New and returns only Brazil suggestions', async () => {
  let called = false;
  await withServer({ apiKey: 'fake-test-key-not-for-real-google', fetchImpl: async (url, opts) => {
    called = true;
    assert.equal(url, 'https://places.googleapis.com/v1/places:autocomplete');
    assert.equal(opts.headers['X-Goog-Api-Key'], 'fake-test-key-not-for-real-google');
    const b = JSON.parse(opts.body);
    assert.deepEqual(b.includedRegionCodes, ['br']);
    assert.equal(b.sessionToken, TOKEN);
    return new Response(JSON.stringify({ suggestions: [{ placePrediction: {
      placeId: 'ChIJexampleABC123', text: { text: 'Avenida Paulista, São Paulo, Brasil' },
      structuredFormat: { mainText: { text: 'Avenida Paulista' }, secondaryText: { text: 'São Paulo, Brasil' } }
    } }] }), { status: 200 });
  } }, async url => {
    const r = await fetch(`${url}/api/address/autocomplete?q=Avenida%20Paulista&sessionToken=${TOKEN}`);
    assert.equal(r.status, 200);
    const body = await r.json();
    assert.equal(body.suggestions[0].placeId, 'ChIJexampleABC123');
    assert.equal(JSON.stringify(body).includes('fake-test-key-not-for-real-google'), false);
  });
  assert.ok(called);
});
test('place detail returns selected address and coordinates', async () => {
  await withServer({ apiKey: 'fake-test-key-not-for-real-google', fetchImpl: async (url, opts) => {
    assert.ok(url.includes('sessionToken='));
    assert.equal(opts.headers['X-Goog-FieldMask'], 'id,formattedAddress,location');
    return new Response(JSON.stringify({ id: 'ChIJexampleABC123', formattedAddress: 'Avenida Paulista, 1000, São Paulo', location: { latitude: -23.56, longitude: -46.65 } }), { status: 200 });
  } }, async url => {
    const r = await fetch(`${url}/api/address/details?placeId=ChIJexampleABC123&sessionToken=${TOKEN}`);
    assert.equal(r.status, 200);
    const body = await r.json();
    assert.equal(body.address.longitude, -46.65);
  });
});
test('validation blocks malformed place IDs and invalid tokens', async () => {
  await withServer({ apiKey: 'fake-test-key-not-for-real-google', fetchImpl: async () => { throw Error('never called'); } }, async url => {
    assert.equal((await fetch(`${url}/api/address/details?placeId=bad%2Furl&sessionToken=${TOKEN}`)).status, 400);
    assert.equal((await fetch(`${url}/api/address/autocomplete?q=abc&sessionToken=bad`)).status, 400);
  });
});
test('rate limiter protects against repeated requests', async () => {
  await withServer({ apiKey: 'fake-test-key-not-for-real-google', rateMax: 1, fetchImpl: async () => new Response('{}', { status: 200 }) }, async url => {
    const path = `/api/address/autocomplete?q=Rua%20Augusta&sessionToken=${TOKEN}`;
    assert.equal((await fetch(url + path)).status, 200);
    assert.equal((await fetch(url + path)).status, 429);
  });
});

test('placeholder credential cannot look configured', async () => {
  await withServer({apiKey:'REPLACE_WITH_YOUR_SERVER_ONLY_KEY'}, async url => {
    const health = await (await fetch(`${url}/health`)).json();
    assert.equal(health.googleConfigured, false);
    const r = await fetch(`${url}/api/address/autocomplete?q=Rua%20Augusta&sessionToken=${TOKEN}`);
    assert.equal(r.status,503);
  });
});
test('Google 403 produces an actionable message but never exposes key', async () => {
  await withServer({ apiKey: 'fake-test-key-not-for-real-google', fetchImpl: async () => new Response(JSON.stringify({error:{status:'PERMISSION_DENIED',message:'sensitive account data'}}), {status:403})}, async url => {
    const r = await fetch(`${url}/api/address/autocomplete?q=Rua%20Augusta&sessionToken=${TOKEN}`);
    assert.equal(r.status,502);
    const body = await r.json();
    assert.equal(body.googleHttpStatus, 403);
    assert.match(body.error, /faturamento|restrições/i);
    assert.equal(JSON.stringify(body).includes('sensitive account data'),false);
  });
});
