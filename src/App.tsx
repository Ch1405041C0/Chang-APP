import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated, Easing, Modal, SafeAreaView, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { initialState } from "./demo";
import { evaluateBenefits } from "./benefits";
import { AppState, Job, WorkRequest } from "./domain";
import { inferTrade } from "./matching";
import { theme } from "./theme";

type Screen = "splash" | "role" | "client" | "clientMatch" | "workerReady" | "workerMap" | "progress" | "benefits" | "profile";
const money = (n:number) => n > 0 ? `$${n.toLocaleString("es-AR")}` : "A cotizar";
const defaultLocation = { latitude: -34.558, longitude: -58.545 };

function ProgressBar({value}:{value:number}) {
  return <View style={s.track}><View style={[s.fill,{width:`${Math.round(Math.max(0,Math.min(1,value))*100)}%`}]} /></View>;
}

export default function App(){
  const [state,setState]=useState<AppState>(initialState);
  const [screen,setScreen]=useState<Screen>("splash");
  const [history,setHistory]=useState<Screen[]>([]);
  const [goalOpen,setGoalOpen]=useState(false);
  const [description,setDescription]=useState("");
  const [activeRequest,setActiveRequest]=useState<WorkRequest|null>(null);
  const spin=useRef(new Animated.Value(0)).current;
  const word=useRef(new Animated.Value(0)).current;
  const slogan=useRef(new Animated.Value(0)).current;

  const navigate=(next:Screen)=>{setHistory(h=>[...h,screen]);setScreen(next)};
  const goBack=()=>setHistory(h=>{const prev=h[h.length-1];if(prev)setScreen(prev);return h.slice(0,-1)});
  const benefits=useMemo(()=>evaluateBenefits(state.worker,state.requestedBenefits),[state]);
  const next=benefits.find(b=>b.status==="locked");
  const unlocked=benefits.find(b=>b.status==="available");

  useEffect(()=>{
    if(screen!=="splash") return;
    Animated.sequence([
      Animated.timing(spin,{toValue:1,duration:650,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
      Animated.parallel([
        Animated.timing(word,{toValue:1,duration:500,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
        Animated.timing(slogan,{toValue:1,duration:650,delay:180,useNativeDriver:true}),
      ]),
      Animated.delay(800),
    ]).start(()=>setScreen("role"));
  },[screen]);

  useEffect(()=>{ if(screen==="role") setHistory([]); },[screen]);

  const createRequest=()=>{
    const clean=description.trim();
    if(clean.length<8) return;
    const request:WorkRequest={
      id:`req-${Date.now()}`,
      description:clean,
      inferredTrade:inferTrade(clean),
      zone:"Zona cercana",
      location:defaultLocation,
      status:"matched",
      createdAt:new Date().toISOString(),
    };
    setActiveRequest(request);
    setState(p=>({...p,requests:[request,...p.requests]}));
    navigate("clientMatch");
  };

  const publishRequest=()=>{
    if(!activeRequest) return;
    const job:Job={
      id:`job-${activeRequest.id}`,
      title:activeRequest.description.length>42?`${activeRequest.description.slice(0,42)}…`:activeRequest.description,
      description:activeRequest.description,
      trade:activeRequest.inferredTrade,
      amount:0,
      zone:activeRequest.zone,
      status:"available",
      location:activeRequest.location,
      distanceKm:1.2,
    };
    setState(p=>({...p,jobs:[job,...p.jobs],requests:p.requests.map(r=>r.id===activeRequest.id?{...r,status:"searching"}:r)}));
    setActiveRequest({...activeRequest,status:"searching"});
  };

  const accept=(job:Job)=>setState(p=>({...p,jobs:p.jobs.map(j=>j.id===job.id?{...j,status:"accepted"}:j)}));
  const complete=(job:Job)=>setState(p=>({...p,
    worker:{...p.worker,completedJobs:p.worker.completedJobs+1,monthlyRegisteredIncome:p.worker.monthlyRegisteredIncome+job.amount,lifetimeRegisteredIncome:p.worker.lifetimeRegisteredIncome+job.amount},
    jobs:p.jobs.map(j=>j.id===job.id?{...j,status:"completed"}:j),
  }));

  if(screen==="splash"){
    const rotate=spin.interpolate({inputRange:[0,1],outputRange:["-220deg","0deg"]});
    const slide=word.interpolate({inputRange:[0,1],outputRange:[-22,0]});
    return <SafeAreaView style={s.splash}><View style={s.splashBrand}>
      <View style={s.brandRow}><Animated.Text style={[s.splashWord,{opacity:word,transform:[{translateX:slide}]}]}>chang</Animated.Text><Animated.Text style={[s.splashAt,{transform:[{rotate}]}]}>@</Animated.Text></View>
      <Animated.View style={{opacity:slogan}}><Text style={s.claim}>TU TRABAJO CUENTA.</Text><Text style={s.claim}>TU HISTORIA CRECE.</Text></Animated.View>
    </View></SafeAreaView>;
  }

  if(screen==="role") return <Shell><View style={s.center}>
    <Text style={s.logoBig}>chang<Text style={s.at}>@</Text></Text><Text style={s.h1Center}>¿Qué necesitás hoy?</Text><Text style={s.mutedCenter}>Una misma comunidad. Dos formas de entrar.</Text>
    <TouchableOpacity style={s.roleCard} onPress={()=>navigate("client")}><Text style={s.roleIcon}>⌕</Text><Text style={s.roleTitle}>BUSCO UN CHANGARÍN</Text><Text style={s.mutedCenter}>Necesito alguien para hacer un trabajo</Text></TouchableOpacity>
    <TouchableOpacity style={s.roleCard} onPress={()=>navigate("workerReady")}><Text style={s.roleIcon}>⚒</Text><Text style={s.roleTitle}>SOY CHANGADOR</Text><Text style={s.mutedCenter}>Quiero encontrar trabajo</Text></TouchableOpacity>
  </View></Shell>;

  if(screen==="client") return <Shell back={goBack}>
    <Text style={s.eyebrow}>BUSCAR AYUDA</Text><Text style={s.h1}>¿Qué necesitás resolver?</Text>
    <View style={s.card}><Text style={s.h2}>Contáselo a Chang@</Text><Text style={s.muted}>Ej.: “Pierde agua abajo de la pileta y necesito alguien hoy.”</Text>
      <TextInput style={s.input} multiline value={description} onChangeText={setDescription} placeholder="Describí el trabajo..." placeholderTextColor={c.muted}/>
      <TouchableOpacity style={[s.primary,description.trim().length<8&&s.disabled]} disabled={description.trim().length<8} onPress={createRequest}><Text style={s.primaryText}>BUSCAR CHANGARINES CERCA</Text></TouchableOpacity>
    </View>
    <Text style={s.note}>Primera interpretación local. Después ChangAI reemplaza esta capa sin cambiar el flujo.</Text>
  </Shell>;

  if(screen==="clientMatch" && activeRequest) return <Shell back={goBack}>
    <Text style={s.eyebrow}>MATCHING</Text><Text style={s.h1}>Encontramos el oficio</Text>
    <View style={s.card}><Text style={s.muted}>Interpretamos tu pedido como</Text><Text style={s.bigTrade}>{activeRequest.inferredTrade}</Text><Text style={s.muted}>“{activeRequest.description}”</Text></View>
    <MapView style={s.realMap} initialRegion={{...activeRequest.location,latitudeDelta:0.055,longitudeDelta:0.055}}><Marker coordinate={activeRequest.location} title="Tu trabajo" description={activeRequest.inferredTrade}/></MapView>
    <View style={s.card}><Text style={s.eyebrow}>CHANGARÍN COMPATIBLE</Text><Text style={s.h2}>{state.worker.name}</Text><Text style={s.muted}>{state.worker.trade} · {state.worker.completedJobs} trabajos registrados {state.worker.verified?"· Verificado":""}</Text>
      {activeRequest.status==="matched" ? <TouchableOpacity style={s.primary} onPress={publishRequest}><Text style={s.primaryText}>PUBLICAR SOLICITUD</Text></TouchableOpacity> : <View style={s.searching}><Text style={s.success}>✓ SOLICITUD PUBLICADA</Text><Text style={s.muted}>Ya puede aparecer como oportunidad para changadores compatibles.</Text></View>}
    </View>
  </Shell>;

  if(screen==="workerReady") return <Shell back={goBack}><View style={s.center}>
    <Text style={s.eyebrow}>MODO CHANGADOR</Text><Text style={s.h1Center}>¿Salimos a buscar trabajo?</Text><Text style={s.mutedCenter}>Al ponerte disponible vas a ver oportunidades compatibles cerca tuyo.</Text>
    <View style={s.statusOff}><Text style={s.statusText}>● NO DISPONIBLE</Text></View><TouchableOpacity style={s.go} onPress={()=>{navigate("workerMap");setGoalOpen(true)}}><Text style={s.goText}>PONERME DISPONIBLE</Text></TouchableOpacity>
  </View></Shell>;

  if(screen==="workerMap") return <WorkerShell screen={screen} go={navigate} back={goBack}>
    <View style={s.row}><View><Text style={s.success}>● DISPONIBLE</Text><Text style={s.h1}>Oportunidades</Text></View><TouchableOpacity onPress={()=>navigate("workerReady")}><Text style={s.link}>Desconectar</Text></TouchableOpacity></View>
    <MapView style={s.realMap} initialRegion={{...defaultLocation,latitudeDelta:0.085,longitudeDelta:0.085}}>{state.jobs.filter(j=>j.status!=="completed").map(job=><Marker key={job.id} coordinate={job.location} title={job.title} description={`${job.zone} · ${money(job.amount)}`}/>)}</MapView>
    {state.jobs.map(job=><View style={s.card} key={job.id}><View style={s.row}><Text style={s.eyebrow}>{job.zone.toUpperCase()}</Text>{job.distanceKm&&<Text style={s.distance}>{job.distanceKm} km</Text>}</View><Text style={s.h2}>{job.title}</Text><Text style={s.muted}>{job.trade}</Text><Text style={s.amount}>{money(job.amount)}</Text>
      {job.status!=="completed"&&job.amount>0&&<Text style={s.impact}>Este trabajo suma {money(job.amount)} a tu actividad registrada.</Text>}
      {job.status==="available"&&<TouchableOpacity style={s.primary} onPress={()=>accept(job)}><Text style={s.primaryText}>ME INTERESA</Text></TouchableOpacity>}
      {job.status==="accepted"&&<TouchableOpacity style={s.go} onPress={()=>complete(job)}><Text style={s.goText}>TRABAJO COMPLETADO</Text></TouchableOpacity>}
      {job.status==="completed"&&<Text style={s.success}>✓ Registrado en tu historial</Text>}
    </View>)}
    <Modal visible={goalOpen} transparent animationType="fade" onRequestClose={()=>setGoalOpen(false)}><View style={s.modalShade}><View style={s.goalModal}><View style={s.row}><Text style={s.success}>● YA ESTÁS DISPONIBLE</Text><TouchableOpacity onPress={()=>setGoalOpen(false)}><Text style={s.close}>✕</Text></TouchableOpacity></View><Text style={s.popupIcon}>🎯</Text><Text style={s.eyebrow}>TU PRÓXIMO OBJETIVO</Text>{next?<><Text style={s.h1Center}>{next.title}</Text><ProgressBar value={next.progress}/><Text style={s.mutedCenter}>Te falta {next.missing.join(" y ")}.</Text></>:<Text style={s.h2}>Tu actividad sigue construyendo historial.</Text>}{unlocked&&<View style={s.unlock}><Text style={s.success}>🔓 BENEFICIO DISPONIBLE</Text><Text style={s.h2}>{unlocked.title}</Text></View>}<TouchableOpacity style={s.primary} onPress={()=>setGoalOpen(false)}><Text style={s.primaryText}>VER OPORTUNIDADES</Text></TouchableOpacity></View></View></Modal>
  </WorkerShell>;

  if(screen==="progress") return <WorkerShell screen={screen} go={navigate} back={goBack}><Text style={s.h1}>Mi progreso real</Text><View style={s.card}><Text style={s.eyebrow}>INGRESOS REGISTRADOS</Text><Text style={s.big}>{money(state.worker.lifetimeRegisteredIncome)}</Text></View><View style={s.card}><Text style={s.eyebrow}>TRABAJOS COMPLETADOS</Text><Text style={s.big}>{state.worker.completedJobs}</Text></View></WorkerShell>;
  if(screen==="benefits") return <WorkerShell screen={screen} go={navigate} back={goBack}><Text style={s.h1}>Beneficios</Text>{benefits.map(b=><View style={s.card} key={b.id}><Text style={s.eyebrow}>{b.status==="locked"?"EN PROGRESO":"DESBLOQUEADO"}</Text><Text style={s.h2}>{b.title}</Text><Text style={s.muted}>{b.description}</Text>{b.status==="locked"&&<><ProgressBar value={b.progress}/><Text style={s.muted}>Te falta {b.missing.join(" y ")}.</Text></>}</View>)}</WorkerShell>;
  return <WorkerShell screen={screen} go={navigate} back={goBack}><Text style={s.h1}>Mi identidad laboral</Text><View style={s.card}><Text style={s.h2}>{state.worker.name}</Text><Text style={s.muted}>{state.worker.trade}</Text><Text style={s.success}>{state.worker.verified?"✓ Identidad verificada":"Identidad pendiente"}</Text></View></WorkerShell>;
}

function Shell({children,back}:{children:React.ReactNode,back?:()=>void}){return <SafeAreaView style={s.safe}><View style={s.header}>{back?<TouchableOpacity onPress={back}><Text style={s.link}>← Volver</Text></TouchableOpacity>:<Text style={s.logo}>chang<Text style={s.at}>@</Text></Text>}</View><ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">{children}</ScrollView></SafeAreaView>}
function WorkerShell({children,screen,go,back}:{children:React.ReactNode,screen:Screen,go:(x:Screen)=>void,back:()=>void}){return <SafeAreaView style={s.safe}><View style={s.headerRow}><TouchableOpacity onPress={back}><Text style={s.link}>←</Text></TouchableOpacity><Text style={s.logo}>chang<Text style={s.at}>@</Text></Text><View style={{width:24}}/></View><ScrollView contentContainerStyle={s.workerBody}>{children}</ScrollView><WorkerNav go={go} active={screen}/></SafeAreaView>}
function WorkerNav({go,active}:{go:(x:Screen)=>void,active:Screen}){return <View style={s.nav}>{([["workerMap","Trabajo"],["progress","Progreso"],["benefits","Beneficios"],["profile","Perfil"]] as [Screen,string][]).map(([key,label])=><TouchableOpacity key={key} onPress={()=>go(key)}><Text style={[s.navText,active===key&&s.navActive]}>{label}</Text></TouchableOpacity>)}</View>}

const c=theme.colors;
const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:c.bg},splash:{flex:1,backgroundColor:c.bg,justifyContent:"center",alignItems:"center"},splashBrand:{alignItems:"center",gap:22},brandRow:{flexDirection:"row",alignItems:"baseline"},splashWord:{fontSize:58,fontWeight:"900",color:c.text},splashAt:{fontSize:64,fontWeight:"900",color:c.accent},claim:{fontSize:16,lineHeight:23,fontWeight:"900",letterSpacing:1.5,color:c.text,textAlign:"center"},
  header:{padding:18,borderBottomWidth:1,borderBottomColor:c.border},headerRow:{padding:18,borderBottomWidth:1,borderBottomColor:c.border,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},body:{padding:20,paddingBottom:44,gap:16},workerBody:{padding:14,paddingBottom:24,gap:12},center:{minHeight:570,justifyContent:"center",gap:16},
  logo:{fontSize:27,fontWeight:"900",color:c.text},logoBig:{fontSize:48,fontWeight:"900",color:c.text,textAlign:"center"},at:{color:c.accent},h1:{fontSize:30,lineHeight:35,fontWeight:"900",color:c.text},h1Center:{fontSize:30,lineHeight:36,fontWeight:"900",color:c.text,textAlign:"center"},h2:{fontSize:20,fontWeight:"800",color:c.text},big:{fontSize:34,fontWeight:"900",color:c.text},bigTrade:{fontSize:28,fontWeight:"900",color:c.accent},
  muted:{color:c.muted,lineHeight:21},mutedCenter:{color:c.muted,lineHeight:21,textAlign:"center"},eyebrow:{color:c.accent,fontSize:11,fontWeight:"900",letterSpacing:1.2},roleCard:{backgroundColor:c.card,borderWidth:1,borderColor:c.border,borderRadius:24,padding:25,alignItems:"center",gap:8},roleIcon:{fontSize:34,color:c.accent},roleTitle:{fontSize:19,fontWeight:"900",color:c.text},
  card:{backgroundColor:c.card,borderWidth:1,borderColor:c.border,borderRadius:16,padding:18,gap:8},input:{minHeight:120,backgroundColor:c.input,borderWidth:1,borderColor:c.border,borderRadius:12,padding:14,color:c.text,textAlignVertical:"top",fontSize:16},primary:{backgroundColor:c.accent,padding:16,borderRadius:14,alignItems:"center",marginTop:6},primaryText:{fontWeight:"900",color:c.bg},disabled:{opacity:.35},go:{backgroundColor:c.success,padding:17,borderRadius:14,alignItems:"center"},goText:{fontWeight:"900",color:c.bg},
  statusOff:{alignSelf:"center",padding:12,borderRadius:30,borderWidth:1,borderColor:c.border},statusText:{color:c.muted,fontWeight:"800"},success:{color:c.success,fontWeight:"900"},link:{color:c.accent,fontWeight:"800"},note:{color:c.muted,fontSize:12,lineHeight:18},row:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10},distance:{color:c.muted,fontSize:12,fontWeight:"700"},amount:{fontSize:25,fontWeight:"900",color:c.text},impact:{color:c.primaryLight,lineHeight:19},
  realMap:{height:250,borderRadius:16,overflow:"hidden"},searching:{borderWidth:1,borderColor:c.success,borderRadius:12,padding:14,gap:6,marginTop:6},track:{height:9,backgroundColor:c.input,borderRadius:20,overflow:"hidden",marginVertical:8},fill:{height:"100%",backgroundColor:c.accent,borderRadius:20},nav:{borderTopWidth:1,borderTopColor:c.border,backgroundColor:c.sidebar,paddingVertical:15,paddingHorizontal:18,flexDirection:"row",justifyContent:"space-between"},navText:{color:c.muted,fontSize:12,fontWeight:"800"},navActive:{color:c.accent},
  modalShade:{flex:1,backgroundColor:"rgba(0,0,0,.72)",justifyContent:"center",padding:20},goalModal:{backgroundColor:c.card,borderRadius:24,borderWidth:1,borderColor:c.border,padding:22,gap:14},popupIcon:{fontSize:48,textAlign:"center"},close:{color:c.text,fontSize:20},unlock:{borderWidth:1,borderColor:c.success,borderRadius:14,padding:14,gap:6},
});
