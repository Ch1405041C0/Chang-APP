import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { initialState } from "./demo";
import { evaluateBenefits } from "./benefits";
import { AppState, Job } from "./domain";
import { theme } from "./theme";

type Screen = "home" | "role" | "client" | "workerReady" | "workerGoal" | "workerMap" | "progress" | "benefits" | "profile";
const money=(n:number)=>`$${n.toLocaleString("es-AR")}`;

function ProgressBar({value}:{value:number}) {
  return <View style={s.track}><View style={[s.fill,{width:`${Math.round(Math.max(0,Math.min(1,value))*100)}%`}]} /></View>;
}

export default function App(){
  const [state,setState]=useState<AppState>(initialState);
  const [screen,setScreen]=useState<Screen>("home");
  const benefits=useMemo(()=>evaluateBenefits(state.worker,state.requestedBenefits),[state]);
  const next=benefits.find(b=>b.status==="locked");
  const unlocked=benefits.find(b=>b.status==="available");

  const accept=(job:Job)=>setState(p=>({...p,jobs:p.jobs.map(j=>j.id===job.id?{...j,status:"accepted"}:j)}));
  const complete=(job:Job)=>setState(p=>({...p,
    worker:{...p.worker,completedJobs:p.worker.completedJobs+1,
      monthlyRegisteredIncome:p.worker.monthlyRegisteredIncome+job.amount,
      lifetimeRegisteredIncome:p.worker.lifetimeRegisteredIncome+job.amount},
    jobs:p.jobs.map(j=>j.id===job.id?{...j,status:"completed"}:j)
  }));

  if(screen==="home") return <Shell>
    <View style={s.hero}>
      <Text style={s.logoHero}>chang<Text style={s.at}>@</Text></Text>
      <Text style={s.claim}>Cada changa cuenta.</Text>
      <Text style={s.promise}>Trabajá, registrá tu actividad y accedé a beneficios reales.</Text>

      <View style={s.steps}>
        <View style={s.step}><Text style={s.stepIcon}>💼</Text><View style={s.stepCopy}><Text style={s.stepTitle}>TRABAJÁ</Text><Text style={s.muted}>Encontrá oportunidades cerca tuyo.</Text></View></View>
        <View style={s.step}><Text style={s.stepIcon}>📈</Text><View style={s.stepCopy}><Text style={s.stepTitle}>SUMÁ</Text><Text style={s.muted}>Cada trabajo construye tu historial.</Text></View></View>
        <View style={s.step}><Text style={s.stepIcon}>🔓</Text><View style={s.stepCopy}><Text style={s.stepTitle}>AVANZÁ</Text><Text style={s.muted}>Tu actividad puede habilitar beneficios reales.</Text></View></View>
      </View>

      <TouchableOpacity style={s.go} onPress={()=>setScreen("workerReady")}><Text style={s.goText}>QUIERO TRABAJAR</Text></TouchableOpacity>
      <TouchableOpacity style={s.secondary} onPress={()=>setScreen("client")}><Text style={s.secondaryText}>NECESITO UN CHANGARÍN</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>setScreen("role")}><Text style={s.smallLink}>Ver modos de Chang@</Text></TouchableOpacity>
    </View>
  </Shell>;

  if(screen==="role") return <Shell>
    <View style={s.center}>
      <Text style={s.logoBig}>chang<Text style={s.at}>@</Text></Text>
      <Text style={s.h1Center}>¿Qué necesitás hoy?</Text>
      <Text style={s.mutedCenter}>Una misma comunidad. Dos formas de entrar.</Text>
      <TouchableOpacity style={s.roleCard} onPress={()=>setScreen("client")}>
        <Text style={s.roleIcon}>⌕</Text><Text style={s.roleTitle}>BUSCO UN CHANGARÍN</Text>
        <Text style={s.mutedCenter}>Necesito alguien para hacer un trabajo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.roleCard} onPress={()=>setScreen("workerReady")}>
        <Text style={s.roleIcon}>⚒</Text><Text style={s.roleTitle}>SOY CHANGADOR</Text>
        <Text style={s.mutedCenter}>Quiero encontrar trabajo</Text>
      </TouchableOpacity>
    </View>
  </Shell>;

  if(screen==="client") return <Shell back={()=>setScreen("role")}>
    <Text style={s.eyebrow}>BUSCAR AYUDA</Text><Text style={s.h1}>¿Qué necesitás resolver?</Text>
    <View style={s.card}><Text style={s.h2}>Contáselo a Chang@</Text>
      <Text style={s.muted}>Ej.: “Pierde agua abajo de la pileta y necesito alguien hoy.”</Text>
      <View style={s.fakeInput}><Text style={s.fakeInputText}>Describí el trabajo...</Text></View>
      <TouchableOpacity style={s.primary}><Text style={s.primaryText}>BUSCAR CHANGARINES CERCA</Text></TouchableOpacity>
    </View>
    <Text style={s.note}>Próxima iteración: interpretación IA + ubicación + matching + mapa del cliente.</Text>
  </Shell>;

  if(screen==="workerReady") return <Shell back={()=>setScreen("role")}>
    <View style={s.center}>
      <Text style={s.eyebrow}>MODO CHANGADOR</Text><Text style={s.h1Center}>¿Salimos a buscar trabajo?</Text>
      <Text style={s.mutedCenter}>Cuando estés disponible Chang@ puede mostrarte oportunidades compatibles con tu oficio.</Text>
      <View style={s.statusOff}><Text style={s.statusText}>● NO DISPONIBLE</Text></View>
      <TouchableOpacity style={s.go} onPress={()=>setScreen("workerGoal")}><Text style={s.goText}>PONERME DISPONIBLE</Text></TouchableOpacity>
    </View>
  </Shell>;

  if(screen==="workerGoal") return <Shell>
    <View style={s.center}>
      <Text style={s.success}>● YA ESTÁS DISPONIBLE</Text>
      <Text style={s.popupIcon}>🎯</Text><Text style={s.eyebrow}>TU PRÓXIMO OBJETIVO</Text>
      {next ? <><Text style={s.h1Center}>{next.title}</Text><ProgressBar value={next.progress}/>
        <Text style={s.mutedCenter}>Te falta {next.missing.join(" y ")}.</Text></> :
        <Text style={s.h1Center}>Tu actividad sigue construyendo historial.</Text>}
      {unlocked && <View style={s.unlock}><Text style={s.success}>🔓 BENEFICIO DISPONIBLE</Text><Text style={s.h2}>{unlocked.title}</Text></View>}
      <Text style={s.note}>No son puntos: son condiciones calculadas sobre actividad real registrada.</Text>
      <TouchableOpacity style={s.primary} onPress={()=>setScreen("workerMap")}><Text style={s.primaryText}>VER OPORTUNIDADES →</Text></TouchableOpacity>
    </View>
  </Shell>;

  if(screen==="workerMap") return <Shell>
    <View style={s.row}><View><Text style={s.success}>● DISPONIBLE</Text><Text style={s.h1}>Oportunidades</Text></View>
      <TouchableOpacity onPress={()=>setScreen("workerReady")}><Text style={s.link}>Desconectar</Text></TouchableOpacity></View>
    <View style={s.map}><Text style={s.mapText}>MAPA DE OPORTUNIDADES</Text><Text style={s.mutedCenter}>La geolocalización real entra en la próxima iteración.</Text></View>
    {state.jobs.map(job=><View style={s.card} key={job.id}>
      <Text style={s.eyebrow}>{job.zone.toUpperCase()}</Text><Text style={s.h2}>{job.title}</Text>
      <Text style={s.amount}>{money(job.amount)}</Text>
      {next && job.status!=="completed" && <Text style={s.impact}>Este trabajo suma {money(job.amount)} a tu actividad registrada.</Text>}
      {job.status==="available" && <TouchableOpacity style={s.primary} onPress={()=>accept(job)}><Text style={s.primaryText}>ME INTERESA</Text></TouchableOpacity>}
      {job.status==="accepted" && <TouchableOpacity style={s.go} onPress={()=>complete(job)}><Text style={s.goText}>TRABAJO COMPLETADO</Text></TouchableOpacity>}
      {job.status==="completed" && <Text style={s.success}>✓ Registrado en tu historial</Text>}
    </View>)}
    <WorkerNav go={setScreen}/>
  </Shell>;

  if(screen==="progress") return <Shell><Text style={s.h1}>Mi progreso real</Text>
    <View style={s.card}><Text style={s.eyebrow}>INGRESOS REGISTRADOS</Text><Text style={s.big}>{money(state.worker.lifetimeRegisteredIncome)}</Text></View>
    <View style={s.card}><Text style={s.eyebrow}>TRABAJOS COMPLETADOS</Text><Text style={s.big}>{state.worker.completedJobs}</Text></View>
    <WorkerNav go={setScreen}/></Shell>;

  if(screen==="benefits") return <Shell><Text style={s.h1}>Beneficios</Text>
    {benefits.map(b=><View style={s.card} key={b.id}><Text style={s.eyebrow}>{b.status==="locked"?"EN PROGRESO":"DESBLOQUEADO"}</Text>
      <Text style={s.h2}>{b.title}</Text><Text style={s.muted}>{b.description}</Text>
      {b.status==="locked"&&<><ProgressBar value={b.progress}/><Text style={s.muted}>Te falta {b.missing.join(" y ")}.</Text></>}
    </View>)}<WorkerNav go={setScreen}/></Shell>;

  return <Shell><Text style={s.h1}>Mi identidad laboral</Text><View style={s.card}><Text style={s.h2}>{state.worker.name}</Text><Text style={s.muted}>{state.worker.trade}</Text></View><WorkerNav go={setScreen}/></Shell>;
}

function Shell({children,back}:{children:React.ReactNode,back?:()=>void}){
 return <SafeAreaView style={s.safe}><View style={s.header}>{back?<TouchableOpacity onPress={back}><Text style={s.link}>← Volver</Text></TouchableOpacity>:<Text style={s.logo}>chang<Text style={s.at}>@</Text></Text>}</View><ScrollView contentContainerStyle={s.body}>{children}</ScrollView></SafeAreaView>;
}
function WorkerNav({go}:{go:(s:Screen)=>void}){return <View style={s.nav}>
 {([["workerMap","Trabajo"],["progress","Progreso"],["benefits","Beneficios"],["profile","Perfil"]] as [Screen,string][]).map(([k,l])=><TouchableOpacity key={k} onPress={()=>go(k)}><Text style={s.navText}>{l}</Text></TouchableOpacity>)}
</View>}

const c=theme.colors;
const s=StyleSheet.create({
 hero:{minHeight:650,justifyContent:"center",gap:16},logoHero:{fontSize:58,fontWeight:"900",color:c.text,letterSpacing:-2},claim:{fontSize:38,lineHeight:42,fontWeight:"900",color:c.text},promise:{fontSize:19,lineHeight:27,color:c.muted,maxWidth:360},steps:{gap:10,marginVertical:8},step:{flexDirection:"row",alignItems:"center",gap:13,backgroundColor:c.card,borderWidth:1,borderColor:c.border,borderRadius:16,padding:14},stepIcon:{fontSize:25},stepCopy:{flex:1,gap:2},stepTitle:{fontSize:13,fontWeight:"900",letterSpacing:1,color:c.accent},secondary:{padding:16,borderRadius:14,alignItems:"center",borderWidth:1,borderColor:c.primary},secondaryText:{fontWeight:"900",color:c.primaryLight},smallLink:{textAlign:"center",color:c.muted,fontWeight:"700",padding:8},
 safe:{flex:1,backgroundColor:c.bg},header:{padding:18,borderBottomWidth:1,borderBottomColor:c.border},
 body:{padding:20,paddingBottom:40,gap:16},logo:{fontSize:27,fontWeight:"900",color:c.text},logoBig:{fontSize:48,fontWeight:"900",color:c.text},at:{color:c.accent},
 center:{minHeight:570,justifyContent:"center",gap:16},h1:{fontSize:30,lineHeight:35,fontWeight:"900",color:c.text},h1Center:{fontSize:30,lineHeight:36,fontWeight:"900",color:c.text,textAlign:"center"},
 h2:{fontSize:20,fontWeight:"800",color:c.text},muted:{color:c.muted,lineHeight:21},mutedCenter:{color:c.muted,lineHeight:21,textAlign:"center"},
 eyebrow:{color:c.accent,fontSize:11,fontWeight:"900",letterSpacing:1.2},roleCard:{backgroundColor:c.card,borderWidth:1,borderColor:c.border,borderRadius:24,padding:25,alignItems:"center",gap:8},
 roleIcon:{fontSize:34,color:c.accent},roleTitle:{fontSize:19,fontWeight:"900",color:c.text},primary:{backgroundColor:c.primary,padding:16,borderRadius:14,alignItems:"center",marginTop:6},
 primaryText:{fontWeight:"900",color:c.text},go:{backgroundColor:c.success,padding:17,borderRadius:14,alignItems:"center"},goText:{fontWeight:"900",color:c.bg},
 card:{backgroundColor:c.card,borderWidth:1,borderColor:c.border,borderRadius:16,padding:18,gap:8},fakeInput:{backgroundColor:c.input,borderRadius:12,padding:17,marginTop:6},fakeInputText:{color:c.muted},
 statusOff:{alignSelf:"center",padding:12,borderRadius:30,borderWidth:1,borderColor:c.border},statusText:{color:c.muted,fontWeight:"800"},success:{color:c.success,fontWeight:"900"},
 popupIcon:{fontSize:52,textAlign:"center"},unlock:{borderWidth:1,borderColor:c.success,borderRadius:14,padding:14,gap:5},track:{height:9,backgroundColor:c.input,borderRadius:99,overflow:"hidden"},
 fill:{height:"100%",backgroundColor:c.accent},note:{fontSize:12,lineHeight:18,color:c.muted,textAlign:"center"},row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
 link:{color:c.accent,fontWeight:"800"},map:{height:190,borderRadius:20,borderWidth:1,borderColor:c.border,backgroundColor:c.input,justifyContent:"center",alignItems:"center",padding:20},
 mapText:{color:c.text,fontWeight:"900",letterSpacing:1},amount:{fontSize:26,fontWeight:"900",color:c.text},impact:{color:c.primaryLight,fontSize:13},big:{fontSize:36,fontWeight:"900",color:c.text},
 nav:{flexDirection:"row",justifyContent:"space-around",paddingVertical:18,marginTop:8,borderTopWidth:1,borderTopColor:c.border},navText:{color:c.accent,fontWeight:"800"}
});