import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { initialState } from "./demo";
import { evaluateBenefits } from "./benefits";
import { AppState, Job } from "./domain";
import { theme } from "./theme";

type Tab = "inicio" | "trabajo" | "progreso" | "beneficios" | "perfil";
const money = (n:number) => `$${n.toLocaleString("es-AR")}`;

function ProgressBar({ value }: { value:number }) {
  return <View style={s.track}><View style={[s.fill,{width:`${Math.round(Math.max(0,Math.min(1,value))*100)}%`}]} /></View>;
}

export default function App() {
  const [state,setState] = useState<AppState>(initialState);
  const [tab,setTab] = useState<Tab>("inicio");
  const benefits = useMemo(()=>evaluateBenefits(state.worker,state.requestedBenefits),[state]);

  const acceptJob = (job:Job) => setState(prev=>({
    ...prev,jobs:prev.jobs.map(j=>j.id===job.id?{...j,status:"accepted"}:j)
  }));

  const completeJob = (job:Job) => setState(prev=>({
    ...prev,
    worker:{
      ...prev.worker,
      completedJobs:prev.worker.completedJobs+1,
      monthlyRegisteredIncome:prev.worker.monthlyRegisteredIncome+job.amount,
      lifetimeRegisteredIncome:prev.worker.lifetimeRegisteredIncome+job.amount,
    },
    jobs:prev.jobs.map(j=>j.id===job.id?{...j,status:"completed"}:j)
  }));

  const requestBenefit=(id:string)=>setState(prev=>({
    ...prev,requestedBenefits:Array.from(new Set([...prev.requestedBenefits,id]))
  }));

  return <SafeAreaView style={s.safe}>
    <View style={s.header}>
      <Text style={s.logo}>chang<Text style={s.at}>@</Text></Text>
      <Text style={s.small}>Tu trabajo construye futuro</Text>
    </View>

    <ScrollView contentContainerStyle={s.body}>
      {tab==="inicio" && <>
        <Text style={s.hello}>Hola, {state.worker.name.split(" ")[0]}</Text>
        <Text style={s.h1}>Lo que hiciste trabajando también construye historial.</Text>

        <View style={s.hero}>
          <Text style={s.label}>ACTIVIDAD REGISTRADA ESTE MES</Text>
          <Text style={s.big}>{money(state.worker.monthlyRegisteredIncome)}</Text>
          <Text style={s.muted}>{state.worker.completedJobs} trabajos completados · {state.worker.activeMonths} meses de actividad</Text>
        </View>

        {benefits.filter(b=>b.status==="available").slice(0,1).map(b=><View style={s.unlock} key={b.id}>
          <Text style={s.unlockTitle}>🔓 BENEFICIO DISPONIBLE</Text>
          <Text style={s.h2}>{b.title}</Text>
          <Text style={s.muted}>{b.description}</Text>
          <TouchableOpacity style={s.primary} onPress={()=>setTab("beneficios")}><Text style={s.primaryText}>VER BENEFICIO</Text></TouchableOpacity>
        </View>)}

        <Text style={s.section}>Próximo paso útil</Text>
        {benefits.filter(b=>b.status==="locked").slice(0,1).map(b=><View style={s.card} key={b.id}>
          <Text style={s.h2}>{b.title}</Text>
          <ProgressBar value={b.progress}/>
          <Text style={s.muted}>Te falta {b.missing.join(" y ")}.</Text>
        </View>)}
      </>}

      {tab==="trabajo" && <>
        <Text style={s.h1}>Trabajo disponible</Text>
        <Text style={s.muted}>Oportunidades compatibles con tu oficio y zona.</Text>
        {state.jobs.map(job=><View style={s.card} key={job.id}>
          <Text style={s.h2}>{job.title}</Text>
          <Text style={s.muted}>{job.zone} · {job.trade}</Text>
          <Text style={s.amount}>{money(job.amount)}</Text>
          {job.status==="available" && <TouchableOpacity style={s.primary} onPress={()=>acceptJob(job)}><Text style={s.primaryText}>ME INTERESA</Text></TouchableOpacity>}
          {job.status==="accepted" && <TouchableOpacity style={s.successBtn} onPress={()=>completeJob(job)}><Text style={s.darkText}>MARCAR TRABAJO COMPLETADO</Text></TouchableOpacity>}
          {job.status==="completed" && <Text style={s.done}>✓ Trabajo registrado en tu historial</Text>}
        </View>)}
      </>}

      {tab==="progreso" && <>
        <Text style={s.h1}>Mi progreso real</Text>
        <Text style={s.muted}>Sin puntos ni monedas. Esto representa trabajo que efectivamente hiciste.</Text>
        <View style={s.card}><Text style={s.label}>INGRESOS REGISTRADOS</Text><Text style={s.big}>{money(state.worker.lifetimeRegisteredIncome)}</Text></View>
        <View style={s.card}><Text style={s.label}>TRABAJOS COMPLETADOS</Text><Text style={s.big}>{state.worker.completedJobs}</Text></View>
        <View style={s.card}><Text style={s.label}>CONTINUIDAD</Text><Text style={s.big}>{state.worker.activeMonths} meses</Text></View>
      </>}

      {tab==="beneficios" && <>
        <Text style={s.h1}>Beneficios</Text>
        <Text style={s.muted}>Chang@ te muestra qué podés obtener con lo que ya construiste trabajando.</Text>
        {benefits.map(b=><View style={s.card} key={b.id}>
          <Text style={s.label}>{b.status==="locked"?"PRÓXIMO BENEFICIO":b.status==="requested"?"SOLICITUD INICIADA":"DESBLOQUEADO"}</Text>
          <Text style={s.h2}>{b.title}</Text>
          <Text style={s.provider}>{b.provider}</Text>
          <Text style={s.muted}>{b.description}</Text>
          {b.status==="locked" && <><ProgressBar value={b.progress}/><Text style={s.muted}>Te falta {b.missing.join(" y ")}.</Text></>}
          {b.status==="available" && <TouchableOpacity style={s.primary} onPress={()=>requestBenefit(b.id)}><Text style={s.primaryText}>QUIERO MI BENEFICIO</Text></TouchableOpacity>}
          {b.status==="requested" && <Text style={s.done}>✓ Chang@ inició el flujo de gestión</Text>}
        </View>)}
      </>}

      {tab==="perfil" && <>
        <Text style={s.h1}>Mi identidad laboral</Text>
        <View style={s.card}><Text style={s.h2}>{state.worker.name}</Text><Text style={s.muted}>{state.worker.trade}</Text></View>
        <View style={s.card}><Text style={s.h2}>Identidad {state.worker.verified?"verificada":"pendiente"}</Text></View>
        <View style={s.card}><Text style={s.h2}>Actividad {state.worker.formalized?"formalizada":"todavía no formalizada"}</Text></View>
      </>}
    </ScrollView>

    <View style={s.nav}>
      {([["inicio","Inicio"],["trabajo","Trabajo"],["progreso","Progreso"],["beneficios","Beneficios"],["perfil","Perfil"]] as [Tab,string][]).map(([key,label])=>
        <TouchableOpacity key={key} style={s.navItem} onPress={()=>setTab(key)}>
          <Text style={[s.navText,tab===key&&s.navActive]}>{label}</Text>
        </TouchableOpacity>)}
    </View>
  </SafeAreaView>;
}

const c=theme.colors;
const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:c.bg},
  header:{paddingHorizontal:20,paddingVertical:14,borderBottomWidth:1,borderBottomColor:c.border},
  logo:{fontSize:28,fontWeight:"800",color:c.text}, at:{color:c.accent}, small:{color:c.muted,fontSize:12},
  body:{padding:18,paddingBottom:32,gap:14},
  hello:{color:c.primaryLight,fontWeight:"700",fontSize:15},
  h1:{color:c.text,fontSize:27,fontWeight:"800",lineHeight:33},
  h2:{color:c.text,fontSize:19,fontWeight:"700",marginBottom:5},
  muted:{color:c.muted,lineHeight:20},
  hero:{backgroundColor:c.card,borderRadius:24,padding:22,borderWidth:1,borderColor:c.border},
  label:{color:c.accent,fontSize:11,fontWeight:"800",letterSpacing:1},
  big:{color:c.text,fontSize:34,fontWeight:"800",marginVertical:8},
  card:{backgroundColor:c.card,borderRadius:14,padding:18,borderWidth:1,borderColor:c.border,gap:8},
  unlock:{backgroundColor:c.card,borderRadius:18,padding:18,borderWidth:1,borderColor:c.success,gap:8},
  unlockTitle:{color:c.success,fontWeight:"800",fontSize:12},
  section:{color:c.text,fontSize:18,fontWeight:"800",marginTop:8},
  amount:{color:c.text,fontSize:24,fontWeight:"800"},
  primary:{backgroundColor:c.primary,borderRadius:12,padding:14,alignItems:"center",marginTop:8},
  primaryText:{color:c.text,fontWeight:"800"},
  successBtn:{backgroundColor:c.success,borderRadius:12,padding:14,alignItems:"center",marginTop:8},
  darkText:{color:c.bg,fontWeight:"900"},
  done:{color:c.success,fontWeight:"700",marginTop:8},
  provider:{color:c.primaryLight,fontWeight:"700"},
  track:{height:8,backgroundColor:c.input,borderRadius:99,overflow:"hidden",marginVertical:8},
  fill:{height:"100%",backgroundColor:c.accent,borderRadius:99},
  nav:{flexDirection:"row",borderTopWidth:1,borderTopColor:c.border,backgroundColor:c.sidebar,paddingVertical:10},
  navItem:{flex:1,alignItems:"center",paddingVertical:8},
  navText:{color:c.muted,fontSize:11,fontWeight:"700"},
  navActive:{color:c.accent}
});
