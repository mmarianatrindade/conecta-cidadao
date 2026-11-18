import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Alert, Animated, Keyboard, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES, CATEGORY_MAP } from './src/data/categories';
import { CATALOG, EMERGENCY, POPULAR_QUERIES } from './src/data/catalog';
import { AppTab, CategoryId, Feedback, Journey, Problem, Task, Unit } from './src/data/types';
import { clearLocalData, insertCorrection, insertFeedback, insertJourney, loadLocalState, LocalState, makeId, removeJourney, updateJourneyStatus, updateTask, writeFavorite } from './src/db/storage';
import { Body, Button, Heading, Icon, Label, Pill, RoundButton, Rule, Small, Surface } from './src/components/Primitives';
import { T } from './src/ui/theme';
import { openAddress, phoneCall, visitUrl } from './src/ui/links';
import { formatDate, searchCatalog } from './src/utils/search';
import { GoogleAddressPicker } from './src/components/GoogleAddressPicker';
import { SelectedAddress } from './src/services/googleAddress';
import { openRoute } from './src/ui/links';

type ModalType = 'emergency'|'plan'|'feedback'|'report'|'privacy'|null;
const EMPTY: LocalState = { favorites:[],journeys:[],tasks:[],feedbacks:[],problems:[] };
const NAV: {id:AppTab;title:string;icon:string;active:string}[] = [
  {id:'inicio',title:'Início',icon:'home-outline',active:'home'},
  {id:'explorar',title:'Explorar',icon:'compass-outline',active:'compass'},
  {id:'jornada',title:'Minha jornada',icon:'calendar-outline',active:'calendar'},
  {id:'feedbacks',title:'Experiências',icon:'chatbubble-ellipses-outline',active:'chatbubble-ellipses'}
];
const WAIT = ['Não registrei','Até 15 min','15 a 30 min','30 a 60 min','Mais de 60 min'];
const OUTCOMES: {key:Feedback['resolved'];label:string}[] = [{key:'sim',label:'Sim'},{key:'parcial',label:'Parcialmente'},{key:'nao',label:'Não'}];
const ACCESS: {key:Feedback['access'];label:string}[] = [{key:'adequado',label:'Adequadas'},{key:'barreira',label:'Encontrei barreiras'},{key:'nao-avaliado',label:'Não sei avaliar'}];
const CLARITY: {key:Feedback['clarity'];label:string}[] = [{key:'claro',label:'Claras'},{key:'confuso',label:'Confusas'},{key:'nao-avaliado',label:'Não sei avaliar'}];

function AppContent() {
  const insets=useSafeAreaInsets();
  const [tab,setTab]=useState<AppTab>('inicio');
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [modal,setModal]=useState<ModalType>(null);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState<CategoryId|null>(null);
  const [filter,setFilter]=useState<'todos'|'presencial'|'digital'>('todos');
  const [routeOrigin,setRouteOrigin]=useState<SelectedAddress|null>(null);
  const [data,setData]=useState<LocalState>(EMPTY);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState(false);
  const [working,setWorking]=useState(false);
  const [planTitle,setPlanTitle]=useState('');
  const [planDate,setPlanDate]=useState('');
  const [planNote,setPlanNote]=useState('');
  const [feedbackUnit,setFeedbackUnit]=useState('');
  const [wait,setWait]=useState<string>('Não registrei');
  const [resolved,setResolved]=useState<Feedback['resolved']>('sim');
  const [access,setAccess]=useState<Feedback['access']>('nao-avaliado');
  const [clarity,setClarity]=useState<Feedback['clarity']>('nao-avaliado');
  const [comment,setComment]=useState('');
  const [reportText,setReportText]=useState('');
  const opacity=useRef(new Animated.Value(1)).current;
  const [lessMotion,setLessMotion]=useState(false);
  const workingRef=useRef(false);
  const selected=selectedId?CATALOG.find(u=>u.id===selectedId):undefined;
  const favoriteSet=useMemo(()=>new Set(data.favorites),[data.favorites]);
  const feedbackTarget=CATALOG.find(u=>u.id===feedbackUnit);
  const filtered=useMemo(()=>searchCatalog(CATALOG,query).filter(u=>(!category||u.category===category)&&(filter==='todos'||u.type===filter)),[query,category,filter]);
  const feedbackCount=data.feedbacks.length;
  const completedCount=data.journeys.filter(j=>j.status==='concluido').length;

  const reload=useCallback(async()=>{
    try { setData(await loadLocalState()); setLoadError(false); }
    catch (error) { console.error(error);setLoadError(true); }
    finally { setLoading(false); }
  },[]);
  useEffect(()=>{reload();AccessibilityInfo.isReduceMotionEnabled().then(setLessMotion).catch(()=>{});},[reload]);
  useEffect(()=>{
    if(lessMotion)return;
    opacity.setValue(0);
    Animated.timing(opacity,{toValue:1,duration:230,useNativeDriver:true}).start();
  },[tab,selectedId,lessMotion,opacity]);

  function explore(search='',cat:CategoryId|null=null) { setSelectedId(null);setQuery(search);setCategory(cat);setTab('explorar');Keyboard.dismiss(); }
  function goTab(t:AppTab){ setSelectedId(null);setTab(t);Keyboard.dismiss(); }
  function detail(id:string){setSelectedId(id);Keyboard.dismiss();}
  async function run(action:()=>Promise<void>,success?:string):Promise<boolean> {
    if(workingRef.current)return false;
    workingRef.current=true;
    try {setWorking(true);await action();await reload();if(success)Alert.alert('Tudo certo!',success);return true;}
    catch(error) {console.error(error);Alert.alert('Não foi possível salvar','Confira o armazenamento do celular e tente novamente.');return false;}
    finally{workingRef.current=false;setWorking(false);}
  }
  function toggleFavorite(unit:Unit){const willSave=!favoriteSet.has(unit.id);run(()=>writeFavorite(unit.id,willSave));}
  function openPlan(unit:Unit){setSelectedId(unit.id);setPlanTitle(`Atendimento em ${unit.name}`);setPlanDate('');setPlanNote('');setModal('plan');}
  function openFeedback(unit?:Unit){setFeedbackUnit(unit?.id||'');setWait('Não registrei');setResolved('sim');setAccess('nao-avaliado');setClarity('nao-avaliado');setComment('');setModal('feedback');}
  function openReport(unit:Unit){setSelectedId(unit.id);setReportText('');setModal('report');}
  async function savePlan(){
    if(!selected||!planTitle.trim()){Alert.alert('Preencha o nome','Dê um nome para este atendimento.');return;}
    const now=new Date().toISOString(); const id=makeId();
    const journey:Journey={id,unitId:selected.id,title:planTitle.trim(),plannedDate:planDate.trim(),note:planNote.trim(),status:'planejado',createdAt:now};
    const tasks=selected.before.map(text=>({id:makeId(),journeyId:id,text,done:false}));
    if(await run(()=>insertJourney(journey,tasks),'Seu atendimento foi adicionado à Minha Jornada.'))setModal(null);
  }
  async function saveFeedback(){
    if(!feedbackUnit){Alert.alert('Escolha uma unidade','Selecione sobre qual serviço deseja registrar a experiência.');return;}
    const f:Feedback={id:makeId(),unitId:feedbackUnit,date:new Date().toISOString(),waiting:wait||'Não registrei',resolved,access,clarity,comment:comment.trim()};
    if(await run(()=>insertFeedback(f),'Sua avaliação está salva neste aparelho. Ela não foi publicada nem enviada ao órgão.'))setModal(null);
  }
  async function saveReport(){
    if(!selected||reportText.trim().length<8){Alert.alert('Descreva a informação','Escreva ao menos 8 caracteres para identificar o que precisa ser conferido.');return;}
    const p:Problem={id:makeId(),unitId:selected.id,description:reportText.trim(),createdAt:new Date().toISOString()};
    if(await run(()=>insertCorrection(p),'O alerta está registrado localmente. Não foi enviado à prefeitura.'))setModal(null);
  }

  function unitCard(unit:Unit,compact=false){
    const c=CATEGORY_MAP[unit.category];
    return <Pressable key={unit.id} onPress={()=>detail(unit.id)} accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${unit.name}`} style={({pressed})=>[styles.unitCard,{opacity:pressed?.75:1,transform:[{scale:pressed?.992:1}]}]}>
      <View style={{width:54,height:54,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:c.soft}}><Icon name={c.icon} color={c.tint} size={26}/></View>
      <View style={{flex:1,gap:5}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:6,flexWrap:'wrap'}}><Text style={{fontSize:10,fontWeight:'800',letterSpacing:0.6,color:c.tint,textTransform:'uppercase'}}>{c.name}</Text><View style={{width:3,height:3,borderRadius:2,backgroundColor:T.subtle}}/><Text style={{fontSize:10,color:T.muted,fontWeight:'600'}}>{unit.type==='digital'?'Online':'Presencial'}</Text></View>
        <Text style={{fontSize:compact?14:15,fontWeight:'800',color:T.ink,lineHeight:20,letterSpacing:-.3}} numberOfLines={2}>{unit.name}</Text>
        <View style={{flexDirection:'row',alignItems:'center',gap:4}}><Icon name="location-outline" color={T.muted} size={13}/><Text numberOfLines={1} style={{fontSize:11,color:T.muted,flex:1}}>{unit.region}</Text></View>
        {!compact?<Text style={{fontSize:12,lineHeight:18,color:T.muted,marginTop:3}} numberOfLines={2}>{unit.summary}</Text>:null}
      </View>
      <View style={{height:28,width:28,borderRadius:10,backgroundColor:T.soft,alignItems:'center',justifyContent:'center'}}><Icon name="chevron-forward" size={15} color={T.navy2}/></View>
    </Pressable>;
  }
  const tabsContent = () => {
    if(tab==='inicio') return <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenPad}>
      <View style={[styles.rowBetween,{paddingBottom:2}]}>
        <View style={{flexDirection:'row',alignItems:'center',gap:11,flex:1}}>
          <View style={styles.brandMark}><Icon name="navigate" size={19} color={T.white}/></View>
          <View style={{flex:1}}><Text style={{fontSize:17,fontWeight:'900',letterSpacing:-.55,color:T.navy}}>conecta<Text style={{color:T.blue}}> cidadão.</Text></Text><Small style={{fontSize:11,marginTop:1}}>Seu acesso a serviços públicos</Small></View>
        </View>
        <RoundButton icon="call-outline" onPress={()=>setModal('emergency')} label="Telefones de emergência" filled color={T.red}/>
      </View>
      <LinearGradient colors={['#081D3B','#133966','#1B5C89']} style={styles.hero} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.heroTag}><Icon name="sparkles-outline" color="#B9E5FF" size={15}/><Text style={{color:'#C9E8FA',fontSize:10,fontWeight:'800',letterSpacing:1.25}}>SUA CIDADE, MAIS SIMPLES</Text></View>
        <Text style={styles.heroTitle}>O serviço certo.{"\n"}Sem complicação.</Text>
        <Text style={{color:'#D7E8F8',fontSize:13,lineHeight:20,marginBottom:17,maxWidth:315}}>Encontre onde ir, saiba como se preparar e acompanhe tudo em um só lugar.</Text>
        <Pressable onPress={()=>explore()} accessibilityRole="button" accessibilityLabel="Pesquisar serviços públicos" style={styles.heroSearch}><Icon name="search" size={20} color={T.blue}/><Text style={{color:T.muted,flex:1,fontSize:13,fontWeight:'600'}}>O que você precisa resolver?</Text><View style={styles.searchArrow}><Icon name="arrow-forward" size={17} color={T.white}/></View></Pressable>
        <View style={styles.decor1}/><View style={styles.decor2}/>
      </LinearGradient>
      <View style={styles.quickRow}>
        <Pressable accessibilityRole="button" onPress={()=>explore()} style={styles.quickAction}><View style={[styles.quickIcon,{backgroundColor:'#E1F0FE'}]}><Icon name="map-outline" color={T.blue} size={19}/></View><Text style={styles.quickLabel}>Encontrar lugar</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={()=>goTab('jornada')} style={styles.quickAction}><View style={[styles.quickIcon,{backgroundColor:'#E9ECFE'}]}><Icon name="checkbox-outline" color="#465DB1" size={19}/></View><Text style={styles.quickLabel}>Minha jornada</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={()=>openFeedback()} style={styles.quickAction}><View style={[styles.quickIcon,{backgroundColor:'#E7F4F8'}]}><Icon name="chatbubbles-outline" color="#287C9C" size={19}/></View><Text style={styles.quickLabel}>Dar feedback</Text></Pressable>
      </View>
      <View style={styles.rowBetween}><View><Heading style={styles.sectionTitle}>O que você procura?</Heading><Small style={{marginTop:-5,marginBottom:11}}>Explore os serviços por área</Small></View><Pressable accessibilityRole="button" onPress={()=>explore()}><Text style={styles.link}>Ver todas <Icon name="arrow-forward" size={12} color={T.blue}/></Text></Pressable></View>
      <View style={styles.categoryGrid}>{CATEGORIES.map(c=><Pressable key={c.id} accessibilityRole="button" accessibilityLabel={`Explorar ${c.name}`} onPress={()=>explore('',c.id)} style={({pressed})=>[styles.categoryCell,{opacity:pressed?.75:1}]}><View style={[styles.categoryIcon,{backgroundColor:c.soft}]}><Icon name={c.icon} color={c.tint} size={23}/></View><Text style={styles.catTitle} numberOfLines={2}>{c.name}</Text></Pressable>)}</View>
      <View style={[styles.rowBetween,{marginTop:3}]}><Heading style={styles.sectionTitle}>Buscas frequentes</Heading><Icon name="trending-up-outline" color={T.blue} size={20}/></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingBottom:4,paddingTop:1}}>{POPULAR_QUERIES.map(q=><Pressable key={q.query} onPress={()=>explore(q.query)} accessibilityRole="button" style={styles.suggestChip}><Icon name="search" size={15} color={T.blue}/><Text style={{color:T.navy2,fontSize:12,fontWeight:'700'}}>{q.label}</Text><Icon name="arrow-up-forward" size={13} color={T.blue}/></Pressable>)}</ScrollView>
      <View style={{marginTop:15}}><View style={styles.rowBetween}><Heading style={styles.sectionTitle}>Serviços em destaque</Heading><Small>São Paulo, SP</Small></View>{CATALOG.slice(0,3).map(u=>unitCard(u,true))}</View>
      <Surface style={{backgroundColor:T.blueSoft,marginTop:15,borderColor:'#CDE7F8'}}><View style={{flexDirection:'row',gap:12}}><View style={styles.trustIcon}><Icon name="shield-checkmark" color={T.blue} size={22}/></View><View style={{flex:1}}><Label>Informação com fonte</Label><Small style={{marginTop:5}}>Cada unidade informa a origem dos dados e a data de verificação. Não prometemos atendimento em tempo real.</Small></View></View></Surface>
      <View style={{height:12}}/>
    </ScrollView>;
    if(tab==='explorar') return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.screenPad} showsVerticalScrollIndicator={false}>
      <View style={styles.rowBetween}><View><Small>EXPLORE SUA CIDADE · SÃO PAULO</Small><Heading>Encontre o que precisa</Heading></View><RoundButton icon="call-outline" onPress={()=>setModal('emergency')} label="Emergências" color={T.red}/></View>
      <View style={styles.searchField}><Icon name="search-outline" color={T.muted}/><TextInput accessibilityLabel="Pesquisar unidades ou necessidades" placeholder="Ex.: vacina, RG, emprego..." placeholderTextColor="#869CB1" value={query} onChangeText={setQuery} style={styles.searchInput} returnKeyType="search"/>{!!query&&<Pressable onPress={()=>setQuery('')} accessibilityLabel="Limpar pesquisa"><Icon name="close-circle" color={T.muted}/></Pressable>}</View>
      <GoogleAddressPicker selected={routeOrigin} onSelect={setRouteOrigin}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:4}}><FilterChip label="Todas" active={!category} onPress={()=>setCategory(null)}/>{CATEGORIES.map(c=><FilterChip key={c.id} label={c.name} active={category===c.id} onPress={()=>setCategory(category===c.id?null:c.id)}/>)}</ScrollView>
      <View style={{flexDirection:'row',gap:8,marginTop:10,marginBottom:13}}><FilterChip label="Todos" active={filter==='todos'} onPress={()=>setFilter('todos')}/><FilterChip label="Presenciais" active={filter==='presencial'} onPress={()=>setFilter('presencial')}/><FilterChip label="Digitais" active={filter==='digital'} onPress={()=>setFilter('digital')}/></View>
      <View style={styles.rowBetween}><Text style={{fontSize:13,fontWeight:'800',color:T.ink}}>{filtered.length} resultados</Text><Small>Catálogo inicial · Não exaustivo</Small></View>
      <View style={{marginTop:10,gap:10}}>{filtered.map(u=>unitCard(u))}</View>
      {!filtered.length&&<Surface style={{alignItems:'center',gap:10,paddingVertical:34}}><Icon name="search-outline" size={35} color={T.muted}/><Label>Nenhum resultado nesta amostra.</Label><Small style={{textAlign:'center'}}>Tente outro termo ou remova algum filtro. O catálogo ainda está em expansão.</Small><Button title="Limpar filtros" kind="soft" onPress={()=>{setQuery('');setCategory(null);setFilter('todos');}}/></Surface>}
      <View style={{marginTop:18,marginBottom:10}}><Small>O endereço de partida é opcional, não é guardado nem enviado ao catálogo. Ao pesquisar, o texto é enviado ao Google por nosso servidor. A lista de unidades permanece baseada em fontes oficiais, não na busca do Google.</Small></View>
    </ScrollView>;
    if(tab==='jornada')return <ScrollView contentContainerStyle={styles.screenPad} showsVerticalScrollIndicator={false}>
      <View style={styles.rowBetween}><View><Small>Seu espaço privado</Small><Heading>Minha jornada</Heading></View><RoundButton icon="lock-closed-outline" onPress={()=>setModal('privacy')} label="Dados e privacidade"/></View>
      <View style={{flexDirection:'row',gap:10,marginVertical:18}}><StatCard number={String(data.journeys.length)} label="Atendimentos" icon="calendar-outline"/><StatCard number={String(completedCount)} label="Concluídos" icon="checkmark-circle-outline"/><StatCard number={String(data.favorites.length)} label="Salvos" icon="bookmark-outline"/></View>
      <Heading style={styles.sectionTitle}>Meus atendimentos</Heading>
      {!data.journeys.length&&<EmptyState icon="calendar-outline" title="Sua jornada começa aqui" description="Encontre uma unidade e toque em 'Organizar visita' para criar checklists e acompanhar o que precisa resolver." action="Explorar serviços" onPress={()=>explore()}/>}
      {data.journeys.map(j=>{
        const unit=CATALOG.find(u=>u.id===j.unitId);
        const tasks=data.tasks.filter(t=>t.journeyId===j.id);
        const done=tasks.filter(t=>t.done).length;
        return <Surface key={j.id} style={{marginBottom:12}}><View style={styles.rowBetween}><Pill tint={j.status==='concluido'?T.green:T.amber} bg={j.status==='concluido'?T.mint:T.amberSoft}>{j.status==='concluido'?'Concluído':'Em planejamento'}</Pill><Pressable onPress={()=>Alert.alert('Excluir atendimento','Deseja excluir a jornada e suas tarefas?', [{text:'Cancelar',style:'cancel'},{text:'Excluir',style:'destructive',onPress:()=>run(()=>removeJourney(j.id))}])} accessibilityLabel="Excluir atendimento"><Icon name="trash-outline" color={T.muted}/></Pressable></View>
          <Text style={{fontSize:16,fontWeight:'800',color:T.ink,marginTop:12}}>{j.title}</Text><Small style={{marginTop:4}}>{unit?.name||'Unidade'}{j.plannedDate?` · ${j.plannedDate}`:''}</Small>
          {!!j.note&&<Body style={{marginTop:9}}>{j.note}</Body>}
          <View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${tasks.length?done/tasks.length*100:100}%`}]}/></View><Small style={{marginBottom:9}}>{done} de {tasks.length} tarefas concluídas</Small>
          {tasks.map(t=><Pressable key={t.id} accessibilityRole="checkbox" accessibilityState={{checked:t.done}} onPress={()=>run(()=>updateTask(t.id,!t.done))} style={styles.taskRow}><Icon name={t.done?'checkbox':'square-outline'} color={t.done?T.green:T.muted} size={21}/><Text style={{flex:1,color:t.done?T.muted:T.ink,textDecorationLine:t.done?'line-through':'none',fontSize:13,lineHeight:19}}>{t.text}</Text></Pressable>)}
          {j.status==='planejado'?<Button title="Marcar atendimento concluído" kind="outline" icon="checkmark-circle-outline" onPress={()=>run(()=>updateJourneyStatus(j.id,'concluido'),'Atendimento marcado como concluído.')} style={{marginTop:11}}/>:<Button title="Registrar experiência" kind="soft" icon="chatbubble-outline" onPress={()=>openFeedback(unit)} style={{marginTop:11}}/>}
        </Surface>;
      })}
      <Heading style={[styles.sectionTitle,{marginTop:17}]}>Unidades favoritas</Heading>
      {data.favorites.length?data.favorites.map(id=>{const unit=CATALOG.find(u=>u.id===id);return unit?unitCard(unit,true):null;}):<Small style={{marginTop:10}}>Nenhuma unidade salva ainda. Use o marcador de favorito nas fichas.</Small>}
      <View style={{height:14}}/>
    </ScrollView>;
    return <ScrollView contentContainerStyle={styles.screenPad} showsVerticalScrollIndicator={false}>
      <View style={styles.rowBetween}><View><Small>Sua voz importa</Small><Heading>Minhas experiências</Heading></View><RoundButton icon="lock-closed-outline" onPress={()=>setModal('privacy')} label="Privacidade"/></View>
      <Surface style={{backgroundColor:T.blueSoft,borderColor:'#CFE4F7',marginTop:18}}><View style={{flexDirection:'row',gap:12,alignItems:'center'}}><Icon name="chatbubbles-outline" size={31} color={T.green}/><View style={{flex:1}}><Label>Feedback para melhorar jornadas</Label><Small style={{marginTop:4}}>Registre o que aconteceu. Seus relatos são privados nesta versão e não substituem ouvidorias oficiais.</Small></View></View><Button title="Registrar nova experiência" onPress={()=>openFeedback()} icon="add-circle-outline" style={{marginTop:13}}/></Surface>
      <View style={{flexDirection:'row',gap:10,marginTop:18,marginBottom:19}}><StatCard number={String(feedbackCount)} label="Relatos salvos" icon="chatbubble-outline"/><StatCard number={String(data.feedbacks.filter(f=>f.resolved==='sim').length)} label="Resolvidos" icon="checkmark-done-outline"/></View>
      <Heading style={styles.sectionTitle}>Histórico pessoal</Heading>
      {!feedbackCount&&<EmptyState icon="chatbubble-outline" title="Ainda não há avaliações" description="Depois de utilizar um serviço, volte aqui para registrar sua experiência. Leva cerca de um minuto." action="Criar avaliação" onPress={()=>openFeedback()}/>}
      {data.feedbacks.map(f=>{const unit=CATALOG.find(u=>u.id===f.unitId);return <Surface key={f.id} style={{marginBottom:10}}><View style={styles.rowBetween}><Pill tint={f.resolved==='sim'?T.green:T.amber} bg={f.resolved==='sim'?T.mint:T.amberSoft}>{f.resolved==='sim'?'Resolvido':f.resolved==='parcial'?'Parcialmente resolvido':'Não resolvido'}</Pill><Small>{new Date(f.date).toLocaleDateString('pt-BR')}</Small></View><Label style={{marginTop:10}}>{unit?.name||'Unidade'}</Label><Small style={{marginTop:5}}>Espera: {f.waiting} · Informações: {f.clarity==='claro'?'claras':f.clarity==='confuso'?'confusas':'não avaliadas'}</Small>{!!f.comment&&<Body style={{marginTop:9}}>{f.comment}</Body>}</Surface>})}
      <Surface style={{marginTop:9}}><Label>Precisa fazer uma reclamação oficial?</Label><Small style={{marginTop:4,marginBottom:12}}>As avaliações do app não são enviadas a órgãos públicos. Consulte os canais de ouvidoria e serviços oficiais.</Small><View style={{gap:8}}><Button title="SP156 — Serviços municipais" icon="open-outline" kind="outline" onPress={()=>visitUrl('https://sp156.prefeitura.sp.gov.br/')}/><Button title="Fala.BR — Órgãos participantes" icon="open-outline" kind="soft" onPress={()=>visitUrl('https://falabr.cgu.gov.br/')}/></View></Surface>
      <View style={{height:13}}/>
    </ScrollView>;
  };

  function detailScreen(unit:Unit){const c=CATEGORY_MAP[unit.category];const isFavorite=favoriteSet.has(unit.id);
    return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenPad}>
      <View style={styles.rowBetween}><RoundButton icon="arrow-back" onPress={()=>setSelectedId(null)} label="Voltar"/><View style={{flexDirection:'row',gap:9}}><RoundButton icon={isFavorite?'bookmark':'bookmark-outline'} filled={isFavorite} onPress={()=>toggleFavorite(unit)} label={isFavorite?'Remover favorito':'Salvar favorito'}/><RoundButton icon="call-outline" color={T.red} onPress={()=>setModal('emergency')} label="Emergências"/></View></View>
      <LinearGradient colors={[c.soft,'#FFFFFF']} style={[styles.detailHero,{borderColor:T.line}]}><View style={[styles.largeIcon,{backgroundColor:c.soft}]}><Icon name={c.icon} size={29} color={c.tint}/></View><Small style={{textTransform:'uppercase',fontSize:10,fontWeight:'800',letterSpacing:1,color:c.tint}}>{c.name} · {unit.kind}</Small><Heading style={{marginTop:7,fontSize:25,lineHeight:31}}>{unit.name}</Heading><View style={{flexDirection:'row',gap:5,alignItems:'center',marginTop:10}}><Icon name={unit.type==='digital'?'globe-outline':'location-outline'} size={16} color={T.muted}/><Small style={{flex:1}}>{unit.address||unit.region}</Small></View></LinearGradient>
      <View style={{flexDirection:'row',gap:7,flexWrap:'wrap',marginTop:15}}><Pill>Fonte oficial identificada</Pill><Pill bg={T.soft} tint={T.muted}>Revisado em {formatDate(unit.checkedAt)}</Pill></View>
      <Body style={{marginTop:13}}>{unit.summary}</Body>
      {!!unit.caution&&<Surface style={{backgroundColor:T.amberSoft,borderColor:'#F2E2BD',marginTop:16}}><View style={{flexDirection:'row',gap:9}}><Icon name="alert-circle-outline" color={T.amber}/><Body style={{flex:1,color:'#75511F'}}>{unit.caution}</Body></View></Surface>}
      <Heading style={styles.sectionTitle}>O que você encontra aqui</Heading>
      <Surface><View style={{gap:11}}>{unit.services.map(s=><View key={s} style={{flexDirection:'row',gap:9,alignItems:'flex-start'}}><Icon name="checkmark-circle-outline" color={T.green} size={20}/><Body style={{flex:1}}>{s}</Body></View>)}</View></Surface>
      <Heading style={styles.sectionTitle}>Como acessar</Heading>
      <Surface><Body>{unit.access}</Body>{!!unit.hours&&<View style={{flexDirection:'row',gap:9,marginTop:12,alignItems:'flex-start'}}><Icon name="time-outline" color={T.green}/><Body style={{flex:1}}>{unit.hours}</Body></View>}</Surface>
      <Heading style={styles.sectionTitle}>Antes de ir</Heading>
      <Surface><View style={{gap:12}}>{unit.before.map((step,i)=><View key={i} style={{flexDirection:'row',alignItems:'flex-start',gap:11}}><View style={styles.stepNumber}><Text style={{fontSize:12,color:T.green,fontWeight:'800'}}>{i+1}</Text></View><Body style={{flex:1}}>{step}</Body></View>)}</View></Surface>
      <View style={{gap:10,marginTop:20}}><Button title="Organizar meu atendimento" icon="calendar-outline" onPress={()=>openPlan(unit)}/><Button title={unit.type==='digital'?'Abrir serviço oficial':'Ver endereço no mapa'} icon={unit.type==='digital'?'open-outline':'navigate-outline'} kind="soft" onPress={()=>unit.type==='digital'?visitUrl(unit.source):openAddress(unit.address||unit.name)}/><Button title="Registrar experiência" icon="chatbubble-ellipses-outline" kind="outline" onPress={()=>openFeedback(unit)}/>{unit.type==='presencial'&&routeOrigin&&<Button title="Traçar rota a partir do endereço escolhido" icon="navigate-outline" kind="outline" onPress={()=>openRoute(unit.address||unit.name,routeOrigin.formattedAddress)}/>}</View>
      <Surface style={{marginTop:19}}><View style={styles.rowBetween}><Label>Fonte e transparência</Label><Icon name="shield-checkmark-outline" color={T.green}/></View><Small style={{marginTop:5,marginBottom:10}}>Fonte: {unit.sourceLabel}. A informação pode mudar. O Conecta Cidadão não é um órgão oficial nem informa disponibilidade em tempo real.</Small><Button title="Consultar fonte oficial" icon="open-outline" kind="outline" onPress={()=>visitUrl(unit.source)}/><Pressable onPress={()=>openReport(unit)} accessibilityRole="button" style={{paddingTop:14,alignItems:'center'}}><Text style={styles.link}>Encontrou algum dado incorreto?</Text></Pressable></Surface>
      <View style={{height:20}}/>
    </ScrollView>;
  }
  const modalStyle={backgroundColor:T.white,borderTopLeftRadius:30,borderTopRightRadius:30,padding:22,paddingBottom:24+insets.bottom,maxHeight:'90%' as const};
  const closeModal=()=>{if(!workingRef.current)setModal(null);};
  const modalHead=(title:string,desc?:string)=><View style={{marginBottom:14}}><View style={styles.rowBetween}><Heading style={{fontSize:22,flex:1}}>{title}</Heading><RoundButton icon="close" onPress={closeModal} label="Fechar"/></View>{desc?<Small style={{marginTop:6}}>{desc}</Small>:null}</View>;
  return <SafeAreaView style={styles.root} edges={['top']}><StatusBar barStyle="dark-content"/>
    {loading?<View style={{flex:1,alignItems:'center',justifyContent:'center',gap:13}}><ActivityIndicator size="large" color={T.green}/><Label>Preparando o Conecta Cidadão...</Label></View>:loadError?<View style={{flex:1,padding:22,alignItems:'center',justifyContent:'center',gap:10}}><Icon name="alert-circle-outline" size={36} color={T.amber}/><Heading>Não foi possível abrir o armazenamento</Heading><Small style={{textAlign:'center'}}>Reinicie o aplicativo ou tente novamente.</Small><Button title="Tentar novamente" onPress={reload}/></View>:<>
      <Animated.View style={{flex:1,opacity}}>{selected?detailScreen(selected):tabsContent()}</Animated.View>
      <View style={[styles.tabBar,{paddingBottom:Math.max(insets.bottom,9)}]}>{NAV.map(n=>{const active=tab===n.id&&!selected;return <Pressable key={n.id} onPress={()=>goTab(n.id)} accessibilityRole="tab" accessibilityState={{selected:active}} accessibilityLabel={n.title} style={{flex:1,alignItems:'center',justifyContent:'center',gap:4,minHeight:57}}><View style={{width:48,height:31,borderRadius:13,backgroundColor:active?T.mint:'transparent',alignItems:'center',justifyContent:'center'}}><Icon name={active?n.active:n.icon} size={21} color={active?T.navy:T.muted}/></View><Text style={{fontSize:10,fontWeight:active?'800':'600',color:active?T.navy:T.muted}} numberOfLines={1}>{n.title}</Text></Pressable>})}</View>
    </>}
    <Modal visible={modal!==null} transparent animationType="slide" onRequestClose={closeModal}><View style={styles.modalScrim}><Pressable style={{flex:1}} onPress={closeModal} accessibilityLabel="Fechar janela"/><SafeAreaView edges={['bottom']} style={modalStyle}><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {modal==='emergency'&&<>{modalHead('Precisa de ajuda urgente?','Em caso de risco imediato, ligue diretamente ao serviço de emergência. O aplicativo não faz triagem nem intermediários.')}{EMERGENCY.map(e=><Pressable key={e.number} onPress={()=>phoneCall(e.number)} accessibilityRole="button" accessibilityLabel={`Ligar ${e.number} ${e.name}`} style={styles.emergencyRow}><View style={{width:46,height:46,borderRadius:14,backgroundColor:T.redSoft,alignItems:'center',justifyContent:'center'}}><Icon name={e.icon} color={T.red}/></View><View style={{flex:1}}><Label>{e.name}</Label><Small>Toque para iniciar a chamada</Small></View><Text style={{fontSize:23,fontWeight:'900',color:T.red}}>{e.number}</Text><Icon name="call-outline" color={T.red}/></Pressable>)}<Small style={{marginTop:15}}>Os números acima são serviços oficiais do Brasil. Se não for uma emergência, explore o catálogo para encontrar orientações.</Small></>}
      {modal==='plan'&&<>{modalHead('Organizar atendimento','Crie um registro pessoal. Isso não equivale a um agendamento oficial.')}
        <Label style={{marginBottom:7}}>Nome do compromisso</Label><TextInput style={styles.input} accessibilityLabel="Nome do compromisso" value={planTitle} onChangeText={setPlanTitle} placeholder="Ex.: Visita à UBS"/>
        <Label style={{marginTop:16,marginBottom:7}}>Quando pretende ir? (opcional)</Label><TextInput style={styles.input} accessibilityLabel="Data planejada" value={planDate} onChangeText={setPlanDate} placeholder="Ex.: 21/11 às 14h"/>
        <Label style={{marginTop:16,marginBottom:7}}>Observações (opcional)</Label><TextInput style={[styles.input,{minHeight:80,textAlignVertical:'top'}]} multiline accessibilityLabel="Observações" value={planNote} onChangeText={setPlanNote} placeholder="Anotações sem dados pessoais sensíveis"/>
        <Surface style={{marginTop:14,backgroundColor:T.soft}}><Label>Checklist automático</Label><Small style={{marginTop:5}}>Vamos criar {selected?.before.length||0} tarefa(s) de preparação com base nas orientações da ficha.</Small></Surface><Button title="Salvar na Minha Jornada" loading={working} onPress={savePlan} style={{marginTop:17}}/></>}
      {modal==='feedback'&&<>{modalHead('Compartilhe sua experiência','Este registro fica apenas no seu aparelho. Evite incluir dados médicos, nomes de servidores ou ocorrências policiais.')}
        <Label style={{marginBottom:7}}>Onde você foi atendida?</Label>
        <ScrollView horizontal style={{maxHeight:54}} showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingRight:8}}>{CATALOG.filter(u=>u.type==='presencial').map(u=><FilterChip key={u.id} label={u.name} active={feedbackUnit===u.id} onPress={()=>setFeedbackUnit(u.id)}/>)}</ScrollView>
        {feedbackTarget?<Small style={{marginTop:7}}>Selecionado: {feedbackTarget.name}</Small>:<Small style={{marginTop:7,color:T.amber}}>Selecione uma unidade para continuar.</Small>}
        <Label style={{marginTop:18,marginBottom:9}}>Quanto tempo você esperou?</Label><WrapOptions options={WAIT.map(w=>({key:w,label:w}))} selected={wait} onChange={setWait}/>
        <Label style={{marginTop:18,marginBottom:9}}>Você conseguiu resolver?</Label><WrapOptions options={OUTCOMES} selected={resolved} onChange={setResolved}/>
        <Label style={{marginTop:18,marginBottom:9}}>Como estava a acessibilidade?</Label><WrapOptions options={ACCESS} selected={access} onChange={setAccess}/>
        <Label style={{marginTop:18,marginBottom:9}}>As informações eram claras?</Label><WrapOptions options={CLARITY} selected={clarity} onChange={setClarity}/>
        <Label style={{marginTop:18,marginBottom:7}}>Comentário privado (opcional)</Label><TextInput multiline value={comment} onChangeText={setComment} maxLength={300} style={[styles.input,{minHeight:86,textAlignVertical:'top'}]} placeholder="Conte de forma geral o que ajudou ou dificultou." accessibilityLabel="Comentário sobre atendimento"/>
        <Button title="Salvar minha avaliação" loading={working} onPress={saveFeedback} style={{marginTop:18}}/>
      </>}
      {modal==='report'&&<>{modalHead('Informação para conferir',`Unidade: ${selected?.name||''}`)}<Body>Descreva qual informação desta ficha parece incorreta ou desatualizada.</Body><TextInput multiline value={reportText} onChangeText={setReportText} style={[styles.input,{marginTop:13,minHeight:110,textAlignVertical:'top'}]} placeholder="Ex.: o horário no cartaz é diferente do site" accessibilityLabel="Descrever dado incorreto"/><Small style={{marginTop:10}}>A sinalização é salva localmente e não é enviada à equipe nem ao órgão responsável.</Small><Button title="Salvar observação" loading={working} onPress={saveReport} style={{marginTop:15}}/></>}
      {modal==='privacy'&&<>{modalHead('Seus dados e privacidade')}<Body>Favoritos, jornadas, checklists, avaliações e alertas são salvos no banco de dados local do aplicativo. Não criamos conta e não solicitamos CPF ou GPS. Se você usar a busca de endereço do Google, o texto pesquisado será enviado ao Google por meio de nosso servidor, somente para gerar sugestões e rotas. O endereço selecionado não é salvo no histórico local.</Body><Rule/><Label>O que acontece ao apagar?</Label><Small style={{marginTop:8}}>Todos os seus registros pessoais locais são excluídos; o catálogo público permanece no aplicativo.</Small><Button title="Apagar meus registros locais" kind="danger" icon="trash-outline" onPress={()=>Alert.alert('Excluir meus dados?', 'Essa ação não poderá ser desfeita.',[{text:'Cancelar',style:'cancel'},{text:'Excluir',style:'destructive',onPress:async()=>{if(await run(clearLocalData,'Seus dados locais foram apagados.'))setModal(null);}}])} style={{marginTop:19}}/></>}
    </ScrollView></SafeAreaView></View></Modal>
  </SafeAreaView>;
}
function FilterChip({label,active,onPress}:{label:string;active:boolean;onPress:()=>void}){
  return <Pressable accessibilityRole="button" accessibilityState={{selected:active}} onPress={onPress} style={({pressed})=>[{paddingHorizontal:13,minHeight:40,borderRadius:999,backgroundColor:active?T.green:T.white,borderWidth:1,borderColor:active?T.green:T.line,justifyContent:'center',opacity:pressed?.7:1}]}><Text style={{color:active?T.white:T.muted,fontSize:12,fontWeight:active?'800':'600'}} numberOfLines={1}>{label}</Text></Pressable>;
}
function WrapOptions<V extends string>({options,selected,onChange}:{options:{key:V;label:string}[];selected:V;onChange:(value:V)=>void}){
  return <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{options.map(o=><FilterChip key={o.key} label={o.label} active={selected===o.key} onPress={()=>onChange(o.key)}/>)}</View>;
}
function StatCard({number,label,icon}:{number:string;label:string;icon:string}){
  return <Surface style={{flex:1,padding:11,gap:5}}><Icon name={icon} color={T.green} size={18}/><Text style={{color:T.ink,fontSize:23,fontWeight:'800'}}>{number}</Text><Text style={{fontSize:11,color:T.muted}}>{label}</Text></Surface>;
}
function EmptyState({icon,title,description,action,onPress}:{icon:string;title:string;description:string;action:string;onPress:()=>void}){
  return <Surface style={{alignItems:'center',gap:12,paddingVertical:29,marginTop:10}}><View style={{width:70,height:70,borderRadius:22,backgroundColor:T.mint,alignItems:'center',justifyContent:'center'}}><Icon name={icon} size={32} color={T.green}/></View><Heading style={{fontSize:19,textAlign:'center'}}>{title}</Heading><Small style={{textAlign:'center',marginHorizontal:11}}>{description}</Small><Button title={action} onPress={onPress} kind="soft"/></Surface>;
}
export default function App(){return <SafeAreaProvider><AppContent/></SafeAreaProvider>}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:T.light},
 screenPad:{paddingHorizontal:19,paddingTop:19,paddingBottom:31,gap:0},
 rowBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
 brandMark:{width:42,height:42,borderRadius:15,backgroundColor:T.navy,alignItems:'center',justifyContent:'center'},
 hero:{marginTop:19,borderRadius:27,padding:21,paddingTop:24,paddingBottom:23,overflow:'hidden',shadowColor:T.navy,shadowOffset:{width:0,height:11},shadowOpacity:0.13,shadowRadius:17,elevation:5},
 heroTag:{flexDirection:'row',gap:8,alignItems:'center',alignSelf:'flex-start',paddingHorizontal:10,paddingVertical:8,borderRadius:999,backgroundColor:'#FFFFFF14',borderWidth:1,borderColor:'#FFFFFF24'},
 heroTitle:{fontSize:30,lineHeight:35,fontWeight:'900',letterSpacing:-1.15,color:T.white,maxWidth:310,marginTop:18,marginBottom:11},
 heroSearch:{flexDirection:'row',alignItems:'center',gap:11,backgroundColor:T.white,borderRadius:16,paddingHorizontal:13,minHeight:57,zIndex:3,shadowColor:'#020E20',shadowOpacity:0.1,shadowRadius:7},
 searchArrow:{width:30,height:30,borderRadius:10,backgroundColor:T.blue,alignItems:'center',justifyContent:'center'},
 decor1:{position:'absolute',width:170,height:170,borderRadius:100,borderWidth:1,borderColor:'#FFFFFF23',top:-70,right:-65},
 decor2:{position:'absolute',width:100,height:100,borderRadius:100,borderWidth:1,borderColor:'#FFFFFF21',top:55,right:-45},
 quickRow:{flexDirection:'row',gap:8,marginTop:17,marginBottom:6},
 quickAction:{flex:1,backgroundColor:T.white,borderWidth:1,borderColor:T.line,borderRadius:18,paddingVertical:13,paddingHorizontal:5,alignItems:'center',gap:8,minHeight:91,shadowColor:T.navy,shadowOpacity:0.025,shadowRadius:8},
 quickIcon:{width:36,height:36,borderRadius:12,alignItems:'center',justifyContent:'center'},
 quickLabel:{fontSize:11,fontWeight:'700',color:T.navy,textAlign:'center'},
 sectionTitle:{fontSize:18,lineHeight:24,marginTop:25,marginBottom:12},
 trustIcon:{width:44,height:44,borderRadius:14,backgroundColor:T.white,alignItems:'center',justifyContent:'center'},
 link:{fontSize:12,color:T.blue,fontWeight:'800'},
 categoryGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:10},
 categoryCell:{width:'31%',backgroundColor:T.white,borderWidth:1,borderColor:T.line,paddingVertical:14,paddingHorizontal:7,minHeight:111,borderRadius:19,alignItems:'center',justifyContent:'center',gap:8,shadowColor:T.navy,shadowOpacity:0.02,shadowRadius:8},
 categoryIcon:{width:47,height:47,borderRadius:16,alignItems:'center',justifyContent:'center'},
 catTitle:{color:T.ink,fontSize:11,fontWeight:'700',textAlign:'center',lineHeight:15},
 suggestChip:{flexDirection:'row',gap:8,alignItems:'center',borderRadius:13,paddingVertical:12,paddingHorizontal:12,backgroundColor:T.white,borderWidth:1,borderColor:T.line},
 unitCard:{padding:14,backgroundColor:T.white,borderRadius:20,flexDirection:'row',gap:12,borderWidth:1,borderColor:T.line,alignItems:'center',marginBottom:10,shadowColor:T.navy,shadowOpacity:0.025,shadowRadius:12,shadowOffset:{width:0,height:5}},
 searchField:{height:55,borderWidth:1,borderColor:T.line,backgroundColor:T.white,borderRadius:17,marginTop:20,marginBottom:13,flexDirection:'row',alignItems:'center',paddingHorizontal:15,gap:10},
 searchInput:{fontSize:14,color:T.ink,flex:1,height:52},
 tabBar:{borderTopWidth:1,borderTopColor:T.line,backgroundColor:T.white,flexDirection:'row',alignItems:'center',paddingTop:7,paddingHorizontal:6,shadowColor:T.navy,shadowOffset:{width:0,height:-4},shadowOpacity:0.03,shadowRadius:7},
 detailHero:{padding:20,marginTop:17,borderRadius:24,borderWidth:1},
 largeIcon:{width:61,height:61,borderRadius:19,justifyContent:'center',alignItems:'center',marginBottom:14},
 stepNumber:{height:24,width:24,borderRadius:12,backgroundColor:T.mint,alignItems:'center',justifyContent:'center'},
 progressTrack:{height:7,borderRadius:8,backgroundColor:T.soft,marginTop:15,marginBottom:7,overflow:'hidden'},
 progressFill:{height:'100%',backgroundColor:T.blue,borderRadius:8},
 taskRow:{minHeight:44,flexDirection:'row',alignItems:'center',gap:9,paddingVertical:6},
 modalScrim:{flex:1,backgroundColor:'#06172CAB',justifyContent:'flex-end'},
 input:{backgroundColor:T.light,borderColor:T.line,borderWidth:1,borderRadius:13,minHeight:48,paddingHorizontal:13,paddingVertical:11,color:T.ink,fontSize:14},
 emergencyRow:{flexDirection:'row',gap:12,alignItems:'center',borderWidth:1,borderColor:T.line,borderRadius:16,padding:12,marginBottom:9}
});
