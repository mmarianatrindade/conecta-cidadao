import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { AddressSuggestion, SelectedAddress, addressApiConfigured, autocompleteAddresses, checkAddressApiStatus, newGoogleSessionToken, resolveAddress } from '../services/googleAddress';
import { Icon } from './Primitives';
import { T } from '../ui/theme';

type Props = { selected: SelectedAddress | null; onSelect: (address: SelectedAddress | null) => void };
type ConnectionState = 'checking'|'ready'|'not-configured'|'missing-key'|'unreachable';

export function GoogleAddressPicker({ selected, onSelect }: Props) {
  const [input, setInput] = useState(selected?.formattedAddress || '');
  const [options, setOptions] = useState<AddressSuggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState('');
  const [connection, setConnection] = useState<ConnectionState>(addressApiConfigured ? 'checking' : 'not-configured');
  const [connectionNote, setConnectionNote] = useState('');
  const token = useRef(newGoogleSessionToken());
  const seq = useRef(0);
  const connectionSeq = useRef(0);

  async function verifyConnection() {
    const current = ++connectionSeq.current;
    if (!addressApiConfigured) {
      setConnection('not-configured');
      setConnectionNote('O app não recebeu EXPO_PUBLIC_ADDRESS_API_BASE_URL. Configure a URL e reinicie o Expo.');
      return;
    }
    setConnection('checking');
    try {
      const status = await checkAddressApiStatus();
      if (current !== connectionSeq.current) return;
      setConnection(status.googleConfigured ? 'ready' : 'missing-key');
      setConnectionNote(status.googleConfigured ? '' : 'Servidor ativo, mas sem chave Google válida. Configure GOOGLE_MAPS_API_KEY em server/.env.');
    } catch (e) {
      if (current !== connectionSeq.current) return;
      setConnection('unreachable');
      setConnectionNote(e instanceof Error ? e.message : 'Não foi possível alcançar o servidor.');
    }
  }

  useEffect(() => { void verifyConnection(); }, []);

  useEffect(() => {
    const current = ++seq.current;
    if (connection !== 'ready' || selected || input.trim().length < 3) {
      setOptions([]); setBusy(false); return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setBusy(true); setError('');
      try {
        const results = await autocompleteAddresses(input, token.current, controller.signal);
        if (current === seq.current) setOptions(results);
      } catch (e) {
        if (!controller.signal.aborted && current === seq.current) {
          setError(e instanceof Error ? e.message : 'Falha na consulta ao Google.');
          setOptions([]);
        }
      } finally { if (current === seq.current) setBusy(false); }
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [input, selected, connection]);

  function changeText(value: string) {
    ++seq.current;
    if (selected) onSelect(null);
    setInput(value); setOptions([]); setError('');
  }
  function clear() {
    ++seq.current;
    token.current = newGoogleSessionToken();
    setInput(''); setOptions([]); setError(''); setChoosing(false); onSelect(null);
  }
  function useManual() {
    const value = input.trim();
    if (value.length < 5) { setError('Informe uma rua, número, bairro ou cidade para traçar a rota.'); return; }
    ++seq.current;
    setOptions([]); setError('');
    onSelect({ source: 'manual', placeId: null, formattedAddress: value });
  }
  async function choose(option: AddressSuggestion) {
    ++seq.current; setChoosing(true); setOptions([]); setError('');
    try {
      const location = await resolveAddress(option.placeId, token.current);
      setInput(location.formattedAddress); onSelect(location); token.current = newGoogleSessionToken();
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível selecionar este endereço.'); }
    finally { setChoosing(false); }
  }

  const connectionText = connection === 'ready' ? 'Google conectado ao servidor. Digite para receber sugestões.'
    : connection === 'checking' ? 'Conferindo conexão com o servidor...'
    : connection === 'missing-key' ? 'Servidor conectado, Google ainda não configurado.'
    : connection === 'not-configured' ? 'Busca Google ainda não configurada.'
    : 'Servidor de endereços inacessível.';

  return <View style={{ backgroundColor: T.white, borderColor: T.line, borderWidth: 1, borderRadius: 20, padding: 16, marginTop: 14, marginBottom: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <Icon name="navigate-outline" color={T.green} size={19}/>
      <Text style={{ color: T.ink, fontWeight: '800', fontSize: 14 }}>De onde você vai sair?</Text>
    </View>
    <Text style={{ color: T.muted, fontSize: 12, lineHeight: 18, marginBottom: 9 }}>
      Escolha um endereço sugerido pelo Google ou digite manualmente para traçar uma rota.
    </Text>
    <View style={{ borderColor: T.line, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: T.soft }}>
      <Icon name="location-outline" color={T.green} size={18}/>
      <TextInput
        accessibilityLabel="Endereço de partida"
        placeholder="Rua, número, bairro ou CEP"
        placeholderTextColor="#8B9FB4"
        style={{ flex: 1, minHeight: 46, color: T.ink, fontSize: 13, paddingHorizontal: 8 }}
        value={input}
        editable={!choosing}
        onChangeText={changeText}
        autoCorrect={false}
        returnKeyType="search"
      />
      {(busy || choosing) && <ActivityIndicator size="small" color={T.green} />}
      {!!input && <Pressable onPress={clear} accessibilityRole="button" accessibilityLabel="Limpar endereço" style={{ padding: 7 }}><Icon name="close-circle" color={T.muted} size={19}/></Pressable>}
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 }}>
      <Icon name={connection === 'ready' ? 'checkmark-circle-outline' : 'information-circle-outline'} color={connection === 'ready' ? T.blue : T.muted} size={16}/>
      <Text style={{ color: T.muted, fontSize: 11, flex: 1, lineHeight: 16 }}>{connectionText}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Verificar conexão com Google" accessibilityState={{disabled:connection === 'checking'}} disabled={connection === 'checking'} onPress={() => void verifyConnection()} style={{paddingVertical:6,paddingHorizontal:7,opacity:connection === 'checking'?0.55:1}}>
        <Text style={{color:T.blue,fontWeight:'700',fontSize:11}}>Verificar</Text>
      </Pressable>
    </View>
    {!!connectionNote && <Text accessibilityRole="alert" style={{ color: T.muted, fontSize: 11, marginTop: 4, lineHeight: 16 }}>{connectionNote}</Text>}
    {!!error && <Text accessibilityRole="alert" style={{ fontSize: 12, color: T.red, marginTop: 9 }}>{error}</Text>}
    {!!options.length && <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: T.line }}>
      {options.map(o => <Pressable key={o.placeId} onPress={() => void choose(o)} accessibilityRole="button" accessibilityLabel={`Selecionar ${o.label}`} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.line, flexDirection: 'row', gap: 9, alignItems: 'center' }}>
        <Icon name="location-outline" color={T.green} size={17}/>
        <View style={{ flex: 1 }}><Text style={{ color: T.ink, fontSize: 13, fontWeight: '700' }}>{o.mainText || o.label}</Text>{!!o.secondaryText && <Text style={{ color: T.muted, fontSize: 11, marginTop: 3 }}>{o.secondaryText}</Text>}</View>
      </Pressable>)}
    </View>}
    {(!selected && input.trim().length >= 5) && <Pressable accessibilityRole="button" onPress={useManual} style={{marginTop:10,backgroundColor:T.blueSoft,borderRadius:11,paddingVertical:11,paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:8}}>
      <Icon name="navigate-outline" color={T.blue} size={17}/><Text style={{fontSize:12,fontWeight:'700',color:T.navy,flex:1}}>Usar endereço digitado para traçar rota</Text>
    </Pressable>}
    {!!selected && <View style={{ marginTop: 10, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      <Icon name={selected.source === 'google' ? 'checkmark-circle' : 'information-circle'} color={T.blue}/>
      <Text style={{ flex: 1, fontSize: 12, color: T.navy, fontWeight: '700' }}>{selected.source === 'google' ? 'Endereço selecionado no Google.' : 'Endereço digitado, ainda não validado pelo Google.'} Abra uma unidade para traçar a rota.</Text>
    </View>}
    <Text style={{ marginTop: 8, alignSelf: 'flex-end', color: T.muted, fontSize: 10 }}>Sugestões quando disponíveis: Google Maps Platform</Text>
  </View>;
}
