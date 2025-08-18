// client/app/(tabs)/budget.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text, TextInput, Button, Card, Chip, Divider,
  FAB, IconButton, Snackbar,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Speedometer from "../../components/Speedometer";

/* ─── palette ─────────────────────────────────────────── */
const BG="#000000", CARD="#111111", TEXT="#FFFFFF";
const SUB="#9CA3AF", ACC="#00C8FF", WARN="#FF4D4D", BORDER="#1F2937";

/* ─── storage keys ────────────────────────────────────── */
const EVENTS_KEY="@fw_life_events_v1";
const K={
  salary:"@fw_salary",
  baseExpense:"@fw_base_expense",
  currentSavings:"@fw_current_savings",
  goals:"@fw_goals_v1",
};

/* ─── helpers ──────────────────────────────────────────── */
const monthBounds=d=>({ start:new Date(d.getFullYear(),d.getMonth(),1),
                        end:new Date(d.getFullYear(),d.getMonth()+1,1)});
const inMonth=(t,s,e)=>{const x=new Date(t);return x>=s&&x<e;};

/* ─── main component ──────────────────────────────────── */
export default function Budget(){

  /* persisted core data */
  const [salary,setSalary]         = useState(0);
  const [baseExpense,setBase]      = useState(0);
  const [savings,setSavings]       = useState(0);
  const [goals,setGoals]           = useState([]);

  const loadCore=useCallback(async()=>{
    const map=Object.fromEntries(await AsyncStorage.multiGet(Object.values(K)));
    setSalary(+map[K.salary]||0);
    setBase(+map[K.baseExpense]||0);
    setSavings(+map[K.currentSavings]||0);
    setGoals(JSON.parse(map[K.goals]||"[]"));
  },[]);
  useEffect(()=>{loadCore();},[loadCore]);

  /* spend events */
  const [events,setEvents] = useState([]);
  const loadEvents=useCallback(async()=>{
    try{ setEvents(JSON.parse(await AsyncStorage.getItem(EVENTS_KEY))||[]);}catch{setEvents([]);}
  },[]);
  useEffect(()=>{loadEvents();},[loadEvents]);
  const persistEvents=list=>{ setEvents(list); AsyncStorage.setItem(EVENTS_KEY,JSON.stringify(list)); };

  /* quick-spend form */
  const CATS=["Food","Travel","Bills","Shopping","Fun","Other"];
  const [cat,setCat] = useState(CATS[0]);
  const [amt,setAmt] = useState("");
  const addSpend=()=>{ const a=+amt; if(!a) return;
    persistEvents([{id:`e_${Date.now()}`,cat,amount:a,ts:new Date().toISOString()},...events]);
    setAmt("");
  };

  /* derived numbers */
  const {start,end}=monthBounds(new Date());
  const monthSpends=events.filter(e=>inMonth(e.ts,start,end)).reduce((s,e)=>s+e.amount,0);
  const monthlySave=Math.max(0,salary-(baseExpense+monthSpends));
  const speed=salary?Math.min(1,monthlySave/salary):0;

  const activeGoal=useMemo(()=>goals
    .map(g=>({...g,remaining:Math.max(0,g.amount-savings)}))
    .filter(g=>g.remaining>0)
    .sort((a,b)=>a.remaining-b.remaining)[0],[goals,savings]);
  const eta=activeGoal&&monthlySave>0?activeGoal.remaining/monthlySave:undefined;

  /* manage sheet */
  const [openSheet,setOpen] = useState(false);
  const TABS=["Numbers","Goals"];
  const [tab,setTab]        = useState("Numbers");

  /* snackbar */
  const [toast,setToast]=useState("");

  /* ───────────────────────────────────────── UI */
  return(
    <SafeAreaView style={st.safe}>
      <ScrollView contentContainerStyle={{padding:16,paddingBottom:120}} showsVerticalScrollIndicator={false}>
        {/* Overview */}
        <Card style={st.card}><Card.Content>
          <Text style={st.h}>Overview</Text>
          <Speedometer
            speed={speed}
            savingsPerMonth={monthlySave}
            goalName={activeGoal?.name}
            goalAmount={activeGoal?.amount}
            covered={Math.min(savings,activeGoal?.amount||0)}
            etaMonths={eta}
          />
        </Card.Content></Card>

        {/* Spends */}
        <Card style={st.card}><Card.Content>
          <Text style={st.h}>Spends</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical:6}}>
            {CATS.map(c=>(
              <Chip key={c} selected={cat===c} onPress={()=>setCat(c)}
                style={chip} selectedColor={ACC} mode="outlined">{c}</Chip>
            ))}
          </ScrollView>

          <TextInput label="Amount (₹)" value={amt} onChangeText={setAmt}
            keyboardType="numeric" mode="outlined" style={input} outlineStyle={oStyle} activeOutlineColor={ACC}/>
          <Button mode="contained" buttonColor={ACC} textColor="#000"
            style={{marginTop:6}} onPress={addSpend}>Add spend</Button>

          <Divider style={{backgroundColor:BORDER,marginVertical:8}}/>
          <Text style={st.sub}>This-month spends: ₹{monthSpends.toLocaleString()}</Text>

          <Divider style={{backgroundColor:BORDER,marginVertical:8}}/>
          <ScrollView style={{maxHeight:200}} showsVerticalScrollIndicator={false}>
            {!events.length && <Text style={st.sub}>No spends yet.</Text>}
            {events.map(e=>(
              <View key={e.id} style={{marginTop:6,flexDirection:"row",justifyContent:"space-between"}}>
                <Text style={{color:TEXT}}>₹{e.amount} · {e.cat}</Text>
                <IconButton icon="delete" size={18} iconColor={ACC}
                  onPress={()=>persistEvents(events.filter(x=>x.id!==e.id))}/>
              </View>
            ))}
            {events.length>0&&(
              <Button mode="outlined" textColor={ACC} style={{marginTop:6}}
                onPress={()=>persistEvents([])}>Clear all</Button>
            )}
          </ScrollView>
        </Card.Content></Card>

        {/* Calculator */}
        <CalculatorCard/>
      </ScrollView>

      {/* FAB */}
      <FAB icon={openSheet?"close":"cog"} style={fab} color="#000" onPress={()=>setOpen(!openSheet)}/>

      {/* manage sheet */}
      {openSheet&&(
        <Card style={sheet}><Card.Content>
          {/* header row with close */}
          <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TABS.map(x=>(
                <Chip key={x} selected={tab===x} onPress={()=>setTab(x)}
                  style={chip} selectedColor={ACC} mode="outlined">{x}</Chip>
              ))}
            </ScrollView>
            <IconButton icon="close" size={20} iconColor={SUB} onPress={()=>setOpen(false)}/>
          </View>

          {tab==="Numbers"&&(
            <>
              <TextInput label="Salary (₹)" value={String(salary)} onChangeText={v=>setSalary(+v||0)}
                keyboardType="numeric" mode="outlined" style={input} outlineStyle={oStyle} activeOutlineColor={ACC}/>
              <TextInput label="Base expense / mo (₹)" value={String(baseExpense)} onChangeText={v=>setBase(+v||0)}
                keyboardType="numeric" mode="outlined" style={input} outlineStyle={oStyle} activeOutlineColor={ACC}/>
              <TextInput label="Current savings (₹)" value={String(savings)} onChangeText={v=>setSavings(+v||0)}
                keyboardType="numeric" mode="outlined" style={input} outlineStyle={oStyle} activeOutlineColor={ACC}/>
              <Button mode="contained" buttonColor={ACC} textColor="#000" style={{marginTop:8}}
                onPress={async()=>{
                  await AsyncStorage.multiSet([
                    [K.salary,String(salary)],[K.baseExpense,String(baseExpense)],[K.currentSavings,String(savings)],
                  ]); setToast("Numbers saved");
                }}>Save</Button>
            </>
          )}

          {tab==="Goals"&&(
            <GoalsEditor goals={goals} onChange={async g=>{
              setGoals(g); await AsyncStorage.setItem(K.goals,JSON.stringify(g));
            }}/>
          )}
        </Card.Content></Card>
      )}

      <Snackbar visible={!!toast} onDismiss={()=>setToast("")} duration={1800}
        style={{backgroundColor:"#0F0F0F"}}><Text style={{color:TEXT}}>{toast}</Text></Snackbar>
    </SafeAreaView>
  );
}

/* ─── GoalsEditor ─────────────────────────────────────── */
function GoalsEditor({ goals,onChange }){
  const [items,setItems]   = useState(goals);
  const [name,setName]     = useState("");
  const [amt,setAmt]       = useState("");

  return(
    <>
      <TextInput label="Goal name" value={name} onChangeText={setName}
        mode="outlined" style={input} outlineStyle={oStyle} activeOutlineColor={ACC}/>
      <TextInput label="Amount (₹)" value={amt} onChangeText={setAmt}
        keyboardType="numeric" mode="outlined" style={input} outlineStyle={oStyle} activeOutlineColor={ACC}/>
      <Button mode="contained" buttonColor={ACC} textColor="#000"
        onPress={()=>{ if(!name||!amt) return;
          const n=[...items,{id:`g_${Date.now()}`,name,amount:+amt}];
          setItems(n); onChange(n); setName(""); setAmt("");
        }}>Add</Button>

      <Divider style={{backgroundColor:BORDER,marginVertical:8}}/>
      <ScrollView style={{maxHeight:220}} showsVerticalScrollIndicator={false}>
        {!items.length&&<Text style={st.sub}>No goals yet.</Text>}
        {items.map(g=>(
          <View key={g.id} style={{flexDirection:"row",justifyContent:"space-between",marginTop:6}}>
            <Text style={{color:TEXT}}>• {g.name} · ₹{g.amount.toLocaleString()}</Text>
            <IconButton icon="delete" size={18} iconColor={ACC}
              onPress={()=>{ const n=items.filter(x=>x.id!==g.id); setItems(n); onChange(n); }}/>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

/* ─── CalculatorCard ─────────────────────────────────── */
function CalculatorCard(){
  const MODES=["EMI","SIP","Tax"];
  const [mode,setMode] = useState("EMI");
  const [p,setP] = useState(""), [r,setR] = useState(""), [n,setN] = useState("");

  const res=useMemo(()=>{
    const P=+p,R=+r,N=+n;if(!P||!N||(mode!=="Tax"&&!R))return null;
    if(mode==="EMI"){const mr=R/12/100,emi=P*mr*Math.pow(1+mr,N)/(Math.pow(1+mr,N)-1);return `₹${emi.toFixed(0)} / month`;}
    if(mode==="SIP"){const mr=R/12/100,fv=P*((Math.pow(1+mr,N*12)-1)*(1+mr))/mr;return `₹${fv.toLocaleString()}`;}
    if(mode==="Tax"){const inc=P;let t=0;if(inc>250000)t+=Math.min(inc-250000,250000)*.05;if(inc>500000)t+=Math.min(inc-500000,500000)*.2;if(inc>1000000)t+=(inc-1000000)*.3;return `Estimated tax: ₹${t.toLocaleString()}`;}
  },[mode,p,r,n]);

  return(
    <Card style={st.card}><Card.Content>
      <Text style={st.h}>Calculator</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical:6}}>
        {MODES.map(m=>(
          <Chip key={m} selected={mode===m} onPress={()=>{setMode(m);setP("");setR("");setN("");}}
            style={chip} selectedColor={ACC} mode="outlined">{m}</Chip>
        ))}
      </ScrollView>
      <TextInput label={mode==="Tax"?"Income (₹)":"Principal / SIP (₹)"} value={p} onChangeText={setP}
        keyboardType="numeric" mode="outlined" style={input} outlineStyle={oStyle} activeOutlineColor={ACC}/>
      {mode!=="Tax"&&(
        <TextInput label="Rate (% p.a.)" value={r} onChangeText={setR}
          keyboardType="numeric" mode="outlined" style={input} outlineStyle={oStyle} activeOutlineColor={ACC}/>
      )}
      <TextInput label={mode==="EMI"?"Tenure (months)":"Tenure (years)"} value={n} onChangeText={setN}
        keyboardType="numeric" mode="outlined" style={input} outlineStyle={oStyle} activeOutlineColor={ACC}/>
      {res&&<Text style={{color:TEXT,fontWeight:"700",marginTop:8}}>{res}</Text>}
    </Card.Content></Card>
  );
}

/* ─── shared styles / tiny objects ───────────────────── */
const st=StyleSheet.create({
  safe:{flex:1,backgroundColor:BG},
  card:{backgroundColor:CARD,borderRadius:16,borderWidth:1,borderColor:BORDER,marginBottom:14},
  h:{color:TEXT,fontWeight:"700",fontSize:18,marginBottom:4},
  sub:{color:SUB},
});
const input={backgroundColor:"#0B0B0B",color:TEXT,marginTop:8};
const oStyle={borderColor:BORDER};
const chip={marginRight:6,backgroundColor:BG,borderColor:BORDER};
const fab={position:"absolute",right:16,bottom:86,backgroundColor:ACC};
const sheet={
  position:"absolute",left:12,right:12,bottom:12,backgroundColor:CARD,borderRadius:16,
  borderWidth:1,borderColor:BORDER,elevation:8,shadowColor:"#000",shadowOpacity:.35,
  shadowRadius:16,shadowOffset:{width:0,height:8},
};
