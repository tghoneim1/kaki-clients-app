import { useState, useEffect } from "react";

const DEFAULT_PRODUCTS = [
  { id:"whole",        name:"فرخة كاملة",          emoji:"🐔", price:190 },
  { id:"shamoort",     name:"فرخة صغيرة (شاموط)",  emoji:"🐣", price:150 },
  { id:"breast_full",  name:"صدور كاملة ك",         emoji:"🥩", price:250 },
  { id:"breast_deb",   name:"صدور مخلية كاملة ك",  emoji:"🥩", price:390 },
  { id:"fillet",       name:"صدور فيليه ك",         emoji:"🥩", price:390 },
  { id:"wings",        name:"وراك كاملة ك",         emoji:"🍗", price:100 },
  { id:"tips",         name:"دبوس ك",               emoji:"🍖", price:100 },
  { id:"shish_half",   name:"شيش طاوق ½ك",         emoji:"🍢", price:195 },
  { id:"shish_full",   name:"شيش طاوق ك",          emoji:"🍢", price:390 },
  { id:"shawarma_half",name:"شاورمة فراخ ½ك",      emoji:"🌯", price:195 },
  { id:"shawarma_full",name:"شاورمة فراخ ك",       emoji:"🌯", price:390 },
  { id:"liver_giz",    name:"كبد وقوانص ك",        emoji:"🫀", price:80  },
  { id:"liver",        name:"كبدة ك",               emoji:"🫀", price:80  },
  { id:"gizzard",      name:"قوانص ك",             emoji:"🫁", price:70  },
];

const ST_FLOW  = ["جديد","قيد التحضير","جاهز","في الطريق","تم التسليم","تم الدفع"];
const ST_COLOR = {"جديد":"#f59e0b","قيد التحضير":"#3b82f6","جاهز":"#8b5cf6","في الطريق":"#f97316","تم التسليم":"#10b981","تم الدفع":"#059669"};
const ST_ICON  = {"جديد":"🆕","قيد التحضير":"👨‍🍳","جاهز":"✅","في الطريق":"🛵","تم التسليم":"📦","تم الدفع":"💵"};
const DELIVERY = [{name:"طلبات Go",logo:"🛵"},{name:"Rabbit",logo:"🐇"},{name:"Uber Flash",logo:"⚡"},{name:"سائق خاص",logo:"🏍️"}];
const COST_CATS= [
  {id:"chicks",name:"كتاكيت",emoji:"🐣"},{id:"feed",name:"العلاف",emoji:"🌾"},
  {id:"meds",name:"الأدوية",emoji:"💊"},{id:"vitamins",name:"الفيتامينات",emoji:"💉"},
  {id:"vet",name:"الطبيب البيطري",emoji:"🩺"},{id:"water",name:"المياه",emoji:"💧"},
  {id:"electric",name:"الكهرباء",emoji:"⚡"},{id:"cleaning",name:"النظافة",emoji:"🧹"},
  {id:"labor",name:"العمالة",emoji:"👷"},{id:"packing",name:"التغليف",emoji:"📦"},
  {id:"transport",name:"النقل",emoji:"🚚"},{id:"other",name:"أخرى",emoji:"📝"},
];
const ROLES = {
  manager:  {label:"مدير", emoji:"👑",pin:"1234",color:"#f59e0b",tabs:["dashboard","new","orders","clients","costs","settings"],canAdvance:ST_FLOW,canPay:true,canDeliver:true},
  kitchen:  {label:"مطبخ", emoji:"👨‍🍳",pin:"1111",color:"#3b82f6",tabs:["orders"],canAdvance:["قيد التحضير","جاهز","في الطريق"],canPay:false,canDeliver:false},
  delivery: {label:"توصيل",emoji:"🛵",pin:"2222",color:"#f97316",tabs:["orders"],canAdvance:["في الطريق","تم التسليم"],canPay:false,canDeliver:true},
  cashier:  {label:"كاشير",emoji:"💳",pin:"3333",color:"#10b981",tabs:["orders","dashboard"],canAdvance:[],canPay:true,canDeliver:false},
};

const BG="#0d1117",CARD="#1a2035",BDR="#252d3d",TXT="#f1f5f9",SUB="#64748b",MUT="#94a3b8";
const css={
  card:{background:CARD,borderRadius:16,padding:"14px 16px",marginBottom:12,border:`1px solid ${BDR}`},
  inp:{width:"100%",background:BG,border:`1px solid ${BDR}`,borderRadius:10,padding:"10px 14px",color:TXT,fontSize:14,fontFamily:"'Cairo',sans-serif",direction:"rtl",boxSizing:"border-box",outline:"none",marginBottom:8},
  lbl:{display:"block",fontSize:11,color:MUT,marginBottom:3,fontWeight:700},
  btn:(bg="#d97706",fg="#000")=>({background:bg,color:fg,border:"none",borderRadius:10,padding:"11px 16px",fontWeight:800,fontSize:14,fontFamily:"'Cairo',sans-serif",cursor:"pointer",width:"100%",marginTop:4}),
  sm:bg=>({background:bg,color:"#fff",border:"none",borderRadius:8,padding:"6px 11px",fontSize:12,fontFamily:"'Cairo',sans-serif",fontWeight:700,cursor:"pointer",margin:2}),
  badge:st=>({background:ST_COLOR[st]+"22",color:ST_COLOR[st],border:`1px solid ${ST_COLOR[st]}44`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}),
  stat:c=>({background:`linear-gradient(135deg,${c}18,${c}05)`,border:`1px solid ${c}28`,borderRadius:14,padding:"12px",flex:1,minWidth:0}),
};

let _n=200;
const uid=p=>`${p}-${++_n}`;
const ago=ts=>{const m=Math.floor((Date.now()-ts)/60000);if(m<1)return"الآن";if(m<60)return`${m}د`;return`${Math.floor(m/60)}س`;};
const nxt=st=>{const i=ST_FLOW.indexOf(st);return i<ST_FLOW.length-1?ST_FLOW[i+1]:null;};
const findC=(cs,name,phone,memberId)=>{
  const n=s=>(s||"").replace(/\s+/g,"").toLowerCase();
  if(memberId){const c=cs.find(c=>n(c.memberId)===n(memberId));if(c)return c;}
  if(phone){const c=cs.find(c=>n(c.phone)===n(phone));if(c)return c;}
  if(name){const c=cs.find(c=>n(c.name).includes(n(name))||n(name).includes(n(c.name)));if(c)return c;}
  return null;
};
let _memberNum=0;
const genMemberId=clients=>{
  const nums=clients.map(c=>parseInt((c.memberId||"MBR-000").split("-")[1]||0));
  const max=nums.length?Math.max(...nums):0;
  return `MBR-${String(max+1).padStart(3,"0")}`;
};

const EMPTY={orders:[],clients:[],costs:[],cycle:1,prices:{},pricesByCycle:{},avgWeight:2};

// ── Firebase config ──────────────────────────────────────────
// Replace with your Firebase config from console.firebase.google.com
const FIREBASE_URL="https://kaki-app-6b8ba-default-rtdb.firebaseio.com";

async function loadDB(){
  try{
    const r=await fetch(`${FIREBASE_URL}/db.json`);
    const d=await r.json();
    return d?{...EMPTY,...d}:EMPTY;
  }catch{
    // Fallback to localStorage if Firebase unavailable
    try{const r=localStorage.getItem("cop5");return r?{...EMPTY,...JSON.parse(r)}:EMPTY;}catch{return EMPTY;}
  }
}

async function saveDB(d){
  try{
    await fetch(`${FIREBASE_URL}/db.json`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(d)
    });
    // Also save locally as backup
    localStorage.setItem("cop5",JSON.stringify(d));
  }catch{
    try{localStorage.setItem("cop5",JSON.stringify(d));}catch{}
  }
}

// ─── Detailed Costs System ────────────────────────────────────
const CUID=()=>Math.random().toString(36).slice(2,8);
const EMPTY_COSTS=()=>({
  chicks:   [{id:CUID(),name:"كتاكيت",count:"",priceEach:""}],
  feed:     [{id:CUID(),name:"علاف عادي",bags:"",bagWeight:"",bagPrice:""}],
  vitamins: [{id:CUID(),name:"فيتامينات عامة",amount:""}],
  meds:     [{id:CUID(),name:"أدوية عامة",amount:""}],
  electric: [{id:CUID(),name:"كهرباء",units:"",pricePerUnit:""}],
  water:    [{id:CUID(),name:"مياه",units:"",pricePerUnit:""}],
  vets:     [{id:CUID(),name:"الطبيب البيطري",role:"طبيب",salary:""}],
  employees:[{id:CUID(),name:"موظف ١",role:"عامل",salary:""},{id:CUID(),name:"موظف ٢",role:"عامل",salary:""}],
  cleaning: [{id:CUID(),name:"نظافة عامة",amount:""}],
  packaging:[
    {id:CUID(),name:"كيس صغير",count:"",priceEach:""},
    {id:CUID(),name:"كيس كبير",count:"",priceEach:""},
    {id:CUID(),name:"صينية",count:"",priceEach:""},
    {id:CUID(),name:"غلاف شفاف",count:"",priceEach:""},
    {id:CUID(),name:"ملصقات",count:"",priceEach:""},
  ],
  other:[],
});
const CN=v=>parseFloat(v)||0;
const sumC=l=>(l||[]).reduce((s,x)=>s+CN(x.count)*CN(x.priceEach),0);
const sumF=l=>(l||[]).reduce((s,x)=>s+CN(x.bags)*CN(x.bagPrice),0);
const sumA=l=>(l||[]).reduce((s,x)=>s+CN(x.amount),0);
const sumM=l=>(l||[]).reduce((s,x)=>s+CN(x.units)*CN(x.pricePerUnit),0);
const sumS=l=>(l||[]).reduce((s,x)=>s+CN(x.salary),0);
const sumP=l=>(l||[]).reduce((s,x)=>s+CN(x.count)*CN(x.priceEach),0);
const calcCostTotal=c=>!c?0:sumC(c.chicks)+sumF(c.feed)+sumA(c.vitamins)+sumA(c.meds)+sumM(c.electric)+sumM(c.water)+sumS(c.vets)+sumS(c.employees)+sumA(c.cleaning)+sumP(c.packaging)+sumA(c.other);
const calcCostBD=c=>({
  "🐣 كتاكيت":sumC(c?.chicks),"🌾 علف":sumF(c?.feed),"💉 فيتامينات":sumA(c?.vitamins),
  "💊 أدوية":sumA(c?.meds),"⚡ كهرباء":sumM(c?.electric),"💧 مياه":sumM(c?.water),
  "🩺 أطباء":sumS(c?.vets),"👷 موظفين":sumS(c?.employees),"🧹 نظافة":sumA(c?.cleaning),
  "📦 تغليف":sumP(c?.packaging),"📝 أخرى":sumA(c?.other),
});
const COSTS_KEY="costs-cycles-v4";
const loadCostsDB=()=>{
  try{const r=localStorage.getItem(COSTS_KEY);if(r)return JSON.parse(r);}catch{}
  const id=CUID();
  return{cycles:[{id,name:"دورة ١",birds:"500",startDate:"",endDate:"",notes:"",status:"active",costs:EMPTY_COSTS()}]};
};
const saveCostsDB=d=>{try{localStorage.setItem(COSTS_KEY,JSON.stringify(d));}catch{}};
const CFMT=n=>Math.round(n).toLocaleString();
const SI={width:"100%",background:"#0d1117",border:"1px solid #252d3d",borderRadius:9,padding:"9px 12px",color:"#f1f5f9",fontSize:13,fontFamily:"'Cairo',sans-serif",direction:"rtl",boxSizing:"border-box",outline:"none"};
const CLBl={display:"block",fontSize:11,color:"#94a3b8",marginBottom:3,fontWeight:700};
const CBTN=(bg,fg,ex={})=>({background:bg,color:fg,border:"none",borderRadius:9,padding:"9px 14px",fontWeight:800,fontSize:12,fontFamily:"'Cairo',sans-serif",cursor:"pointer",...ex});
const CTAG=c=>({background:`${c}22`,color:c,border:`1px solid ${c}44`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,display:"inline-block"});

// ─── Costs sub-components (OUTSIDE main to prevent remounting) ─
function CTRow({label,total,color}){
  return(
    <div style={{background:"#0d1117",borderRadius:8,padding:"7px 11px",marginTop:6,display:"flex",justifyContent:"space-between"}}>
      <span style={{fontSize:12,color:"#94a3b8"}}>{label}</span>
      <span style={{fontWeight:900,fontSize:13,color:color||"#f59e0b"}}>ج.م {CFMT(total)}</span>
    </div>
  );
}
function CICard({children,canDelete,onDelete}){
  return(
    <div style={{background:"#0d1117",borderRadius:10,padding:"10px 12px",marginBottom:8,border:"1px solid #252d3d"}}>
      {canDelete&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}><button onClick={onDelete} style={{background:"#dc262618",border:"none",borderRadius:6,padding:"3px 9px",cursor:"pointer",fontSize:11,color:"#ef4444",fontFamily:"'Cairo',sans-serif"}}>🗑 حذف</button></div>}
      {children}
    </div>
  );
}
function CSec({id,icon,title,total,color,openSec,onToggle,children}){
  const c=color||"#f59e0b";const open=openSec===id;
  return(
    <div style={{background:"#1a2035",borderRadius:14,marginBottom:10,border:`1px solid ${c}33`,overflow:"hidden"}}>
      <div style={{background:`${c}12`,padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",borderBottom:open?`1px solid ${c}22`:"none"}} onClick={()=>onToggle(open?null:id)}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:19}}>{icon}</span>
          <div><div style={{fontWeight:800,fontSize:13,color:"#f1f5f9"}}>{title}</div>{total>0&&<div style={{fontSize:11,color:c,fontWeight:700}}>ج.م {CFMT(total)}</div>}</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {total>0&&<span style={CTAG(c)}>ج.م {CFMT(total)}</span>}
          <span style={{color:"#94a3b8",fontSize:14}}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {open&&<div style={{padding:"13px 14px"}}>{children}</div>}
    </div>
  );
}
function CAddForm({title,color,fields,onConfirm,onCancel}){
  const [vals,setVals]=useState(()=>fields.reduce((a,f)=>({...a,[f.key]:""}),{}));
  return(
    <div style={{background:"#1a2035",borderRadius:12,padding:"13px 14px",marginTop:8,border:`2px solid ${color}55`}}>
      <div style={{fontWeight:800,fontSize:13,color,marginBottom:10}}>➕ {title}</div>
      {fields.map(f=>(
        <div key={f.key} style={{marginBottom:8}}>
          <label style={CLBl}>{f.label}</label>
          <input style={{...SI,marginBottom:0}} type={f.type||"text"} placeholder={f.ph||""} value={vals[f.key]||""}
            onChange={e=>setVals(v=>({...v,[f.key]:e.target.value}))}
            onKeyDown={e=>{if(e.key==="Enter"&&fields.indexOf(f)===fields.length-1)onConfirm(vals);}}/>
        </div>
      ))}
      <div style={{display:"flex",gap:8,marginTop:6}}>
        <button onClick={onCancel} style={{...CBTN("#374151","#fff",{flex:1})}}>إلغاء</button>
        <button onClick={()=>onConfirm(vals)} style={{...CBTN(color,"#000",{flex:2})}}>✅ تأكيد الإضافة</button>
      </div>
    </div>
  );
}

async function parseWA(msg,products){
  const names=products.map(p=>`${p.id}=${p.name}`).join(", ");
  const emptyItems=products.reduce((a,p)=>({...a,[p.id]:0}),{});
  const sys=`Egyptian chicken business order parser. Extract from Arabic/English WhatsApp messages.
Products: ${names}.
IMPORTANT aliases — map these words to the correct product id:
- بانيه، باني، بانيه مقلي، فيليه، فليه → fillet
- شاموط، شاموورط، فرخة صغيرة → shamoort
- وراك، ارجل، أجنحة → wings
- دبابيس، دبوس → tips
- شيش، شيش طاووق، شيش طاوق نص → shish_half
- شيش طاووق كيلو، شيش كيلو → shish_full
- شاورما نص، شاورمة نص → shawarma_half
- شاورما كيلو، شاورمة كيلو → shawarma_full
- كبدة → liver
- قوانص → gizzard
- كبد وقوانص → liver_giz
- فرخة، دجاجة، دجاجة كاملة → whole
- صدور كاملة، صدور → breast_full
- صدور مخلية، صدر مخلي → breast_deb
Return ONLY valid JSON no markdown: {"client":"","phone":"","address":"","notes":"","items":${JSON.stringify(emptyItems)}}`;
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:sys,messages:[{role:"user",content:msg}]})});
  const d=await r.json();
  return JSON.parse((d.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim());
}

export default function App(){
  const [role,setRole]=useState(null);
  const [pinScr,setPinScr]=useState(true);
  const [pinTgt,setPinTgt]=useState(null);
  const [pinIn,setPinIn]=useState("");
  const [pinErr,setPinErr]=useState(false);
  const [db,setDb]=useState(EMPTY);
  const [dbLoaded,setDbLoaded]=useState(false);
  const [syncing,setSyncing]=useState(false);
  const [lastSync,setLastSync]=useState(null);

  // Load from Firebase on mount
  useEffect(()=>{
    loadDB().then(d=>{setDb(d);setDbLoaded(true);setLastSync(Date.now());});
  },[]);

  // Auto-sync every 10 seconds
  useEffect(()=>{
    const id=setInterval(async()=>{
      const d=await loadDB();
      setDb(d);setLastSync(Date.now());
    },10000);
    return()=>clearInterval(id);
  },[]);
  const [view,setView]=useState("orders");
  const [toast,setToast]=useState(null);

  // Merge: cycle prices override global prices override defaults
  const cycleKey=`cycle-${db.cycle||1}`;
  const cyclePrices=db.pricesByCycle?.[cycleKey]||{};
  const products=DEFAULT_PRODUCTS.map(p=>({...p,price:cyclePrices[p.id]??db.prices?.[p.id]??p.price}));
  const tot=items=>Object.entries(items||{}).reduce((s,[id,q])=>{const p=products.find(x=>x.id===id);return s+(p?p.price*(q||0):0);},0);
  const emptyItems=()=>products.reduce((a,p)=>({...a,[p.id]:0}),{});

  const EF={client:"",phone:"",address:"",notes:"",deliveryDate:"",memberSearch:"",items:emptyItems()};
  const [form,setForm]=useState(EF);
  const [memberHint,setMemberHint]=useState(null); // found client by member search
  const [waMsg,setWaMsg]=useState("");
  const [parsing,setParsing]=useState(false);
  const [parsed,setParsed]=useState(null);
  const [matchedC,setMatchedC]=useState(null);
  const [oMode,setOMode]=useState("whatsapp");
  const [expOrder,setExpOrder]=useState(null);
  const [expClient,setExpClient]=useState(null);
  const [fSt,setFSt]=useState("الكل");
  const [cSearch,setCSearch]=useState("");
  // Price editing state
  const [priceEdits,setPriceEdits]=useState({});
  const [priceSaved,setPriceSaved]=useState(false);

  const ro=role?ROLES[role]:null;
  const T=(msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),2800);};
  const mutate=async fn=>{const next=fn(db);setDb(next);await saveDB(next);setLastSync(Date.now());};

  // ── Detailed Costs State ──
  const [costsDB,setCostsDB]=useState(()=>loadCostsDB());
  const [costsView,setCostsView]=useState("cycles");
  const [costsSelId,setCostsSelId]=useState(()=>loadCostsDB().cycles[0]?.id);
  const [costsOpenSec,setCostsOpenSec]=useState(null);
  const [costsAddOpen,setCostsAddOpen]=useState(null);
  const [costsShowNew,setCostsShowNew]=useState(false);
  const [costsEditName,setCostsEditName]=useState(false);
  const [costsNf,setCostsNf]=useState({name:"",birds:"500",startDate:"",endDate:"",notes:""});

  const persistCosts=next=>{setCostsDB(next);saveCostsDB(next);};
  const costsSel=costsDB.cycles.find(c=>c.id===costsSelId)||costsDB.cycles[0];
  const costsData={...EMPTY_COSTS(),...(costsSel?.costs||{})};
  const costsBirds=CN(costsSel?.birds)||500;
  const GRAND=calcCostTotal(costsData);

  const updCostsData=fn=>persistCosts({...costsDB,cycles:costsDB.cycles.map(c=>c.id===costsSelId?{...c,costs:fn({...EMPTY_COSTS(),...c.costs})}:c)});
  const updCostsCycle=fields=>persistCosts({...costsDB,cycles:costsDB.cycles.map(c=>c.id===costsSelId?{...c,...fields}:c)});
  const updCostItem=(key,id,flds)=>updCostsData(c=>({...c,[key]:(c[key]||[]).map(x=>x.id===id?{...x,...flds}:x)}));
  const delCostItem=(key,id)=>updCostsData(c=>({...c,[key]:(c[key]||[]).filter(x=>x.id!==id)}));
  const addCostItem=(key,item)=>{updCostsData(c=>({...c,[key]:[...(c[key]||[]),{id:CUID(),...item}]}));setCostsAddOpen(null);T("✅ تمت الإضافة");};

  const addCostCycle=()=>{
    if(!costsNf.name.trim()){T("أدخل اسم الدورة","err");return;}
    const id=CUID();
    persistCosts({...costsDB,cycles:[...costsDB.cycles,{id,...costsNf,status:"active",costs:EMPTY_COSTS()}]});
    setCostsSelId(id);setCostsShowNew(false);setCostsNf({name:"",birds:"500",startDate:"",endDate:"",notes:""});
    setCostsView("entry");T("✅ تم إنشاء الدورة");
  };
  const delCostCycle=id=>{
    if(costsDB.cycles.length<=1){T("لا يمكن حذف الدورة الوحيدة","err");return;}
    const next=costsDB.cycles.filter(c=>c.id!==id);
    persistCosts({...costsDB,cycles:next});setCostsSelId(next[0].id);T("🗑️ تم الحذف");
  };
  const toggleCostsSec=id=>setCostsOpenSec(id);

  // Profit calculations
  const revenue=db.orders.filter(o=>o.status==="تم الدفع").reduce((s,o)=>s+o.total,0);
  const pending=db.orders.filter(o=>o.status!=="تم الدفع").reduce((s,o)=>s+o.total,0);
  const profit=revenue-GRAND;
  const avgWeight=db.avgWeight||2;
  const totalKg=costsBirds*avgWeight;
  const costPerKg=totalKg>0?GRAND/totalKg:0;
  const profitPerKg=totalKg>0?profit/totalKg:0;

  const pickRole=rk=>{setPinTgt(rk);setPinIn("");setPinErr(false);};
  const digitFixed=d=>{
    const p=pinIn+d;setPinIn(p);
    if(p.length===4){
      if(p===ROLES[pinTgt].pin){
        // Correct role PIN
        setRole(pinTgt);setPinScr(false);setView(ROLES[pinTgt].tabs[0]);
      } else if(p===ROLES["manager"].pin && pinTgt!=="manager"){
        // Master manager PIN works on any screen
        setRole("manager");setPinScr(false);setView(ROLES["manager"].tabs[0]);
      } else {
        setPinErr(true);setTimeout(()=>{setPinIn("");setPinErr(false);},700);
      }
    }
  };

  const advance=id=>{mutate(d=>({...d,orders:d.orders.map(o=>{if(o.id!==id)return o;const i=ST_FLOW.indexOf(o.status);return i<ST_FLOW.length-1?{...o,status:ST_FLOW[i+1]}:o;})}));T("✅ تم التحديث");};
  const assignDel=(id,svc)=>{mutate(d=>({...d,orders:d.orders.map(o=>o.id===id?{...o,deliveryService:svc}:o)}));T(`🛵 ${svc}`);};
  const pay=(id,m)=>{mutate(d=>({...d,orders:d.orders.map(o=>o.id===id?{...o,paymentMethod:m,status:"تم الدفع"}:o)}));setExpOrder(null);T("💰 تم الدفع");};

  const handleWA=async()=>{
    if(!waMsg.trim()){T("الصق رسالة أولاً","err");return;}
    setParsing(true);setMatchedC(null);setParsed(null);setMemberHint(null);
    try{
      const p=await parseWA(waMsg,products);
      const ex=findC(db.clients,p.client,p.phone);
      const baseItems=emptyItems();
      if(ex){setMatchedC(ex);setForm(f=>({...f,client:ex.name,phone:ex.phone,address:p.address||ex.address,notes:p.notes||ex.notes,items:{...baseItems,...p.items}}));T(`🎉 ${ex.name}`);}
      else{setForm(f=>({...f,client:p.client||"",phone:p.phone||"",address:p.address||"",notes:p.notes||"",items:{...baseItems,...p.items}}));T("✅ عميل جديد");}
      setParsed(p);
    }catch{T("تعذر التحليل","err");}
    setParsing(false);
  };

  // Search client by name, phone, or member ID
  const searchMember=()=>{
    const q=form.memberSearch.trim();
    if(!q){T("أدخل اسم أو رقم عضوية أو هاتف","err");return;}
    const found=findC(db.clients,q,q,q);
    if(found){
      setMatchedC(found);setMemberHint(found);
      setForm(f=>({...f,client:found.name,phone:found.phone,address:found.address,notes:found.notes}));
      T(`🎉 ${found.name} — ${found.memberId}`);
    }else{T("لم يتم إيجاد العميل","err");}
  };

  const submit=()=>{
    if(!form.client.trim()||!form.phone.trim()||!form.address.trim()){T("ملء الاسم والهاتف والعنوان مطلوب","err");return;}
    if(Object.values(form.items).every(q=>!q||q===0)){T("أضف صنفاً","err");return;}
    const total=tot(form.items);
    mutate(d=>{
      let cl=d.clients;let cid;let memberId;
      const ex=findC(cl,form.client,form.phone);
      if(ex){
        cid=ex.id;memberId=ex.memberId;
        cl=cl.map(c=>c.id===ex.id?{...c,address:form.address,notes:form.notes,totalOrders:(c.totalOrders||0)+1,totalSpent:(c.totalSpent||0)+total}:c);
      }else{
        cid=uid("C");memberId=genMemberId(cl);
        cl=[...cl,{id:cid,memberId,name:form.client,phone:form.phone,address:form.address,notes:form.notes,totalOrders:1,totalSpent:total,joinedAt:Date.now()}];
      }
      const o={id:uid("ORD"),clientId:cid,memberId,...form,total,status:"جديد",createdAt:Date.now(),deliveryDate:form.deliveryDate||null,deliveryService:null,paymentMethod:null,createdBy:ro?.label||""};
      return{...d,clients:cl,orders:[o,...d.orders]};
    });
    setForm(EF);setWaMsg("");setParsed(null);setMatchedC(null);setMemberHint(null);setView("orders");T("✅ تم إنشاء الطلب");
  };

  const setQty=(id,v)=>{const q=Math.max(0,parseInt(v)||0);setForm(f=>({...f,items:{...f.items,[id]:q}}));};

  // Save prices
  const savePrices=()=>{
    const updated={};
    Object.entries(priceEdits).forEach(([id,val])=>{const n=parseFloat(val);if(!isNaN(n)&&n>0)updated[id]=n;});
    const cKey=`cycle-${db.cycle||1}`;
    mutate(d=>({...d,pricesByCycle:{...(d.pricesByCycle||{}),[cKey]:{...(d.pricesByCycle?.[cKey]||{}),...updated}}}));
    setPriceEdits({});setPriceSaved(true);setTimeout(()=>setPriceSaved(false),2000);
    T("✅ تم حفظ أسعار الدورة");
  };

  const currentCycle=db.cycle||1;
  const stats={total:db.orders.length,active:db.orders.filter(o=>!["تم التسليم","تم الدفع"].includes(o.status)).length,revenue,pending,clients:db.clients.length};
  // Role-based order filtering
  const roleOrders=(()=>{
    switch(role){
      case "kitchen":  return db.orders.filter(o=>["جديد","قيد التحضير"].includes(o.status));
      case "delivery": return db.orders.filter(o=>["جاهز","في الطريق"].includes(o.status));
      case "cashier":  return db.orders.filter(o=>o.status==="تم التسليم"&&!o.paymentMethod);
      default:         return db.orders;
    }
  })();
  const filtOrders=fSt==="الكل"?roleOrders:roleOrders.filter(o=>o.status===fSt);
  const filtClients=db.clients.filter(c=>!cSearch||c.name?.includes(cSearch)||c.phone?.includes(cSearch)||c.memberId?.includes(cSearch));
  const tabs=ro?ro.tabs:[];
  const tabMeta={dashboard:["📊","الرئيسية"],new:["💬","طلب"],orders:["📋","الطلبات"],clients:["👥","العملاء"],costs:["💰","التكاليف"],settings:["⚙️","الأسعار"]};

  // Show loading while Firebase loads
  if(!dbLoaded) return(
    <div style={{fontFamily:"'Cairo',sans-serif",background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&display=swap');*{box-sizing:border-box}body{margin:0}`}</style>
      <div style={{fontSize:52}}>🐔</div>
      <div style={{fontWeight:900,fontSize:18,color:"#f59e0b"}}>كاكي</div>
      <div style={{fontSize:13,color:"#64748b"}}>جاري التحميل...</div>
    </div>
  );

  // ── LOGIN ──
  if(pinScr) return(
    <div style={{position:"fixed",inset:0,background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cairo',sans-serif",direction:"rtl"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap');*{box-sizing:border-box}body{margin:0}`}</style>
      {!pinTgt?(
        <div style={{width:"100%",maxWidth:340,padding:20}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:52}}>🐔</div>
            <div style={{fontWeight:900,fontSize:24,color:TXT,marginTop:8}}>إدارة الدواجن</div>
            <div style={{fontSize:13,color:SUB,marginTop:4}}>اختر دورك للدخول</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {Object.entries(ROLES).map(([k,r])=>(
              <button key={k} onClick={()=>pickRole(k)} style={{background:CARD,border:`2px solid ${r.color}44`,borderRadius:16,padding:"18px 10px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,fontFamily:"'Cairo',sans-serif",width:"100%"}}>
                <div style={{fontSize:34}}>{r.emoji}</div>
                <div style={{fontWeight:900,fontSize:15,color:r.color}}>{r.label}</div>
                <div style={{fontSize:10,color:SUB,letterSpacing:3}}>● ● ● ●</div>
              </button>
            ))}
          </div>
        </div>
      ):(
        <div style={{width:"100%",maxWidth:280,padding:20,fontFamily:"'Cairo',sans-serif",direction:"rtl"}}>
          <button onClick={()=>setPinTgt(null)} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,fontFamily:"'Cairo',sans-serif",marginBottom:24}}>← رجوع</button>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:40}}>{ROLES[pinTgt].emoji}</div>
            <div style={{fontWeight:900,fontSize:20,color:ROLES[pinTgt].color,marginTop:8}}>{ROLES[pinTgt].label}</div>
            <div style={{fontSize:12,color:SUB,marginTop:4}}>أدخل رقم PIN</div>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:24}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pinIn.length>i?(pinErr?"#ef4444":ROLES[pinTgt].color):BDR,transition:"background .15s"}}/>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=>(
              <button key={i} onClick={()=>{if(d==="⌫")setPinIn(p=>p.slice(0,-1));else if(d!=="")digitFixed(String(d));}}
                style={{background:d===""?"transparent":CARD,border:`1px solid ${d===""?"transparent":BDR}`,borderRadius:10,padding:"14px",fontSize:18,fontWeight:700,color:TXT,cursor:d===""?"default":"pointer",fontFamily:"'Cairo',sans-serif",opacity:d===""?0:1}}>
                {d}
              </button>
            ))}
          </div>
          {pinErr&&<div style={{textAlign:"center",color:"#ef4444",marginTop:12,fontWeight:700,fontSize:13}}>PIN غلط</div>}
        </div>
      )}
    </div>
  );

  // ── MAIN APP ──
  return(
    <div style={{fontFamily:"'Cairo',sans-serif",minHeight:"100vh",background:BG,color:TXT,direction:"rtl",maxWidth:480,margin:"0 auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box}body{margin:0;background:${BG}}input::placeholder,textarea::placeholder{color:#374151}select{color:${TXT};font-family:'Cairo',sans-serif;background:${BG}}.fd{animation:fd .2s ease}@keyframes fd{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}.pl{animation:pl 1s infinite}@keyframes pl{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

      {toast&&<div style={{position:"fixed",top:12,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?"#dc2626":"#059669",color:"#fff",borderRadius:12,padding:"10px 20px",fontWeight:700,fontSize:14,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,.5)",fontFamily:"'Cairo',sans-serif",whiteSpace:"nowrap"}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#b45309,#d97706 60%,#f59e0b)",padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 20px rgba(217,119,6,.4)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:26}}>🐔</span>
          <div>
            <div style={{fontWeight:900,fontSize:17,color:"#fff"}}>إدارة الدواجن</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.8)"}}>دورة #{currentCycle} · ٥٠٠ طائر</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{background:`${ro.color}22`,border:`1px solid ${ro.color}55`,borderRadius:8,padding:"4px 10px",display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:12}}>{ro.emoji}</span>
            <span style={{fontSize:11,fontWeight:700,color:ro.color}}>{ro.label}</span>
          </div>
          <button onClick={()=>{setSyncing(true);loadDB().then(d=>{setDb(d);setLastSync(Date.now());setSyncing(false);});}} style={{background:"rgba(0,0,0,.25)",border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",color:syncing?"#f59e0b":"#fff",fontSize:16}}>⟳</button>
          <button onClick={()=>{setRole(null);setPinScr(true);setPinTgt(null);}} style={{background:"rgba(0,0,0,.25)",border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",color:"#fff",fontSize:11,fontFamily:"'Cairo',sans-serif"}}>خروج</button>
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex",background:"#0f1420",borderBottom:`1px solid ${BDR}`,position:"sticky",top:0,zIndex:100,overflowX:"auto"}}>
        {tabs.map(v=>{const[ic,lb]=tabMeta[v];return(
          <button key={v} onClick={()=>setView(v)} style={{flex:1,padding:"9px 2px",border:"none",background:"none",color:view===v?ro.color:SUB,fontWeight:view===v?800:400,borderBottom:view===v?`3px solid ${ro.color}`:"3px solid transparent",cursor:"pointer",fontSize:10,fontFamily:"'Cairo',sans-serif",whiteSpace:"nowrap",minWidth:52}}>
            <div style={{fontSize:14}}>{ic}</div><div>{lb}</div>
          </button>
        );})}
      </div>

      <div style={{padding:14,paddingBottom:36}}>

        {/* ══ DASHBOARD ══ */}
        {view==="dashboard"&&(
          <div className="fd">
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <div style={css.stat("#3b82f6")}><div style={{fontSize:20,fontWeight:900,color:"#3b82f6"}}>{stats.total}</div><div style={{fontSize:11,color:MUT}}>📦 طلبات</div></div>
              <div style={css.stat("#f59e0b")}><div style={{fontSize:20,fontWeight:900,color:"#f59e0b"}}>{stats.active}</div><div style={{fontSize:11,color:MUT}}>🔥 نشطة</div></div>
              <div style={css.stat("#a78bfa")}><div style={{fontSize:20,fontWeight:900,color:"#a78bfa"}}>{stats.clients}</div><div style={{fontSize:11,color:MUT}}>👥 عملاء</div></div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <div style={css.stat("#10b981")}><div style={{fontSize:15,fontWeight:900,color:"#10b981"}}>ج.م {stats.revenue}</div><div style={{fontSize:11,color:MUT}}>💰 محصل</div></div>
              <div style={css.stat("#f97316")}><div style={{fontSize:15,fontWeight:900,color:"#f97316"}}>ج.م {stats.pending}</div><div style={{fontSize:11,color:MUT}}>⏳ معلق</div></div>
              <div style={css.stat(profit>=0?"#10b981":"#ef4444")}><div style={{fontSize:15,fontWeight:900,color:profit>=0?"#10b981":"#ef4444"}}>ج.م {profit}</div><div style={{fontSize:11,color:MUT}}>{profit>=0?"📈 ربح":"📉 خسارة"}</div></div>
            </div>
            <div style={css.card}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:10}}>⚡ خط الإنتاج</div>
              {ST_FLOW.slice(0,5).map(st=>{const n=db.orders.filter(o=>o.status===st).length;return(
                <div key={st} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:13}}>{ST_ICON[st]}</span><span style={{fontSize:12,color:"#cbd5e1"}}>{st}</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{height:5,borderRadius:3,background:ST_COLOR[st]+"33",width:70,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,n*30)}%`,background:ST_COLOR[st],borderRadius:3}}/></div>
                    <span style={{fontSize:12,fontWeight:700,color:ST_COLOR[st],minWidth:16,textAlign:"center"}}>{n}</span>
                  </div>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* ══ NEW ORDER ══ */}
        {view==="new"&&(
          <div className="fd">
            {/* Member quick search */}
            <div style={{...css.card,borderColor:"#a78bfa44",marginBottom:12}}>
              <div style={{fontWeight:800,fontSize:13,color:"#a78bfa",marginBottom:8}}>🔍 بحث سريع عن عميل</div>
              <div style={{display:"flex",gap:8}}>
                <input style={{...css.inp,flex:1,marginBottom:0}} placeholder="اسم أو رقم عضوية (MBR-001) أو هاتف"
                  value={form.memberSearch} onChange={e=>setForm(f=>({...f,memberSearch:e.target.value}))}
                  onKeyDown={e=>e.key==="Enter"&&searchMember()}/>
                <button onClick={searchMember} style={{...css.btn("#a78bfa","#fff"),width:"auto",padding:"0 14px",marginTop:0,flexShrink:0}}>بحث</button>
              </div>
              {memberHint&&(
                <div style={{marginTop:8,background:BG,borderRadius:10,padding:"8px 12px",border:"1px solid #a78bfa44"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:13,color:"#a78bfa"}}>{memberHint.name}</div>
                      <div style={{fontSize:11,color:MUT}}>{memberHint.memberId} · {memberHint.phone}</div>
                    </div>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:12,color:"#10b981",fontWeight:700}}>{memberHint.totalOrders} طلبات</div>
                      <div style={{fontSize:12,color:"#f59e0b",fontWeight:700}}>ج.م {memberHint.totalSpent}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{display:"flex",background:CARD,borderRadius:12,padding:4,marginBottom:12,border:`1px solid ${BDR}`}}>
              {[["whatsapp","💬 واتساب"],["manual","✍️ يدوي"]].map(([m,l])=>(
                <button key={m} onClick={()=>setOMode(m)} style={{flex:1,padding:"9px",border:"none",borderRadius:10,background:oMode===m?"#d97706":"transparent",color:oMode===m?"#000":MUT,fontWeight:800,fontSize:13,fontFamily:"'Cairo',sans-serif",cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            {oMode==="whatsapp"&&!parsed&&(
              <div style={{...css.card,borderColor:"#25D36644"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:20}}>💬</span><div style={{fontWeight:800,fontSize:14,color:"#25D366"}}>الصق رسالة واتساب</div></div>
                <textarea style={{...css.inp,minHeight:100,resize:"vertical"}} placeholder={"مثال:\nمحمد، فرخة كاملة واجنحة\nمدينة نصر، 01001234567"} value={waMsg} onChange={e=>setWaMsg(e.target.value)}/>
                <button style={{...css.btn("#25D366","#fff"),opacity:parsing?.7:1}} onClick={handleWA} disabled={parsing}>
                  {parsing?<span className="pl">⏳ جاري التحليل...</span>:"🤖 تحليل الرسالة"}
                </button>
              </div>
            )}
            {oMode==="whatsapp"&&parsed&&(
              <div className="fd">
                <div style={{...css.card,borderColor:matchedC?"#10b981":"#3b82f6",marginBottom:10}}>
                  {matchedC
                    ?<div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:24}}>🎉</span>
                        <div>
                          <div style={{fontWeight:900,fontSize:14,color:"#10b981"}}>عميل معروف!</div>
                          <div style={{fontSize:12,color:MUT}}>{matchedC.name} · {matchedC.memberId||""} · {matchedC.totalOrders} طلبات · ج.م {matchedC.totalSpent}</div>
                        </div>
                      </div>
                    :<div style={{display:"flex",alignItems:"center",gap:8}}><span>🆕</span><div style={{fontWeight:700,color:"#3b82f6",fontSize:13}}>عميل جديد — سيُعطى رقم عضوية تلقائياً</div></div>}
                </div>
                <DeliveryDateField form={form} setForm={setForm} css={css}/>
                <OrderForm form={form} setForm={setForm} setQty={setQty} products={products}/>
                <div style={{display:"flex",gap:8}}>
                  <button style={{...css.btn("#374151","#fff"),flex:1,marginTop:0}} onClick={()=>{setParsed(null);setMatchedC(null);setWaMsg("");setMemberHint(null);}}>↩ رجوع</button>
                  <button style={{...css.btn("#d97706","#000"),flex:2,marginTop:0}} onClick={submit}>✅ تأكيد</button>
                </div>
              </div>
            )}
            {oMode==="manual"&&(
              <div>
                <DeliveryDateField form={form} setForm={setForm} css={css}/>
                <OrderForm form={form} setForm={setForm} setQty={setQty} products={products} showClient/>
                <button style={css.btn("#d97706","#000")} onClick={submit}>✅ تأكيد الطلب</button>
              </div>
            )}
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {view==="orders"&&(
          <div className="fd">
            {/* Role context banner */}
            {role!=="manager"&&(
              <div style={{background:`${ro.color}15`,border:`1px solid ${ro.color}33`,borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{ro.emoji}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:ro.color}}>{ro.label}</div>
                  <div style={{fontSize:11,color:MUT}}>
                    {role==="kitchen"&&"بتشوف: الطلبات الجديدة وقيد التحضير"}
                    {role==="delivery"&&"بتشوف: الطلبات الجاهزة وفي الطريق"}
                    {role==="cashier"&&"بتشوف: الطلبات اللي محتاجة تحصيل"}
                  </div>
                </div>
                <div style={{marginRight:"auto",fontWeight:900,fontSize:18,color:ro.color}}>{roleOrders.length}</div>
              </div>
            )}
            {/* Status filter buttons — role specific */}
            {(()=>{
              const roleStatuses={
                kitchen:  ["الكل","جديد","قيد التحضير"],
                delivery: ["الكل","جاهز","في الطريق"],
                cashier:  ["الكل","تم التسليم"],
                manager:  ["الكل",...ST_FLOW],
              };
              const statuses=roleStatuses[role]||["الكل",...ST_FLOW];
              return(
                <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
                  {statuses.map(st=>(
                    <button key={st} onClick={()=>setFSt(st)} style={{...css.sm(fSt===st?(ST_COLOR[st]||"#d97706"):"#1a2035"),border:`1px solid ${fSt===st?(ST_COLOR[st]||"#d97706"):BDR}`,whiteSpace:"nowrap",flexShrink:0,padding:"5px 10px"}}>
                      {ST_ICON[st]||"📋"} {st}
                    </button>
                  ))}
                </div>
              );
            })()}
            {filtOrders.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:SUB}}><div style={{fontSize:48}}>📭</div><div style={{marginTop:8,fontWeight:600}}>لا توجد طلبات</div></div>}
            {filtOrders.map(order=>(
              <div key={order.id} style={{...css.card,borderColor:expOrder===order.id?ST_COLOR[order.status]:BDR,cursor:"pointer"}} onClick={()=>setExpOrder(expOrder===order.id?null:order.id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontWeight:900,fontSize:14}}>{order.client}</div>
                    <div style={{fontSize:11,color:SUB,marginTop:2}}>{order.id}</div>
                    <div style={{fontSize:11,color:"#3b82f6",marginTop:2,fontWeight:700}}>
                      {(()=>{
                        try{
                          const d=new Date(order.createdAt);
                          return `🕐 ${d.toLocaleDateString("ar-EG",{day:"numeric",month:"short"})} — ${d.toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"})}`;
                        }catch{return `🕐 ${ago(order.createdAt)}`;}
                      })()}
                    </div>
                    {order.memberId
                      ?<div style={{fontSize:12,color:"#a78bfa",marginTop:3,fontWeight:800,letterSpacing:1}}>🎫 {order.memberId}</div>
                      :<div style={{fontSize:11,color:SUB,marginTop:2}}>🎫 بدون عضوية</div>}
                    {order.deliveryDate&&<div style={{fontSize:11,color:"#f59e0b",marginTop:2}}>📅 استلام: {order.deliveryDate}</div>}
                    {order.deliveryService&&<div style={{fontSize:11,color:"#10b981",marginTop:2}}>🛵 {order.deliveryService}</div>}
                  </div>
                  <div style={{textAlign:"left"}}>
                    <span style={css.badge(order.status)}>{ST_ICON[order.status]} {order.status}</span>
                    <div style={{fontSize:15,fontWeight:900,color:"#f59e0b",marginTop:4,textAlign:"center"}}>ج.م {order.total}</div>
                  </div>
                </div>

                {expOrder===order.id&&(
                  <div style={{marginTop:12,borderTop:`1px solid ${BDR}`,paddingTop:12}}>

                    {/* Client & order info */}
                    <div style={{background:BG,borderRadius:10,padding:"10px 12px",marginBottom:10,fontSize:12,lineHeight:2}}>
                      <div style={{display:"flex",justifyContent:"space-between",borderBottom:`1px solid ${BDR}`,paddingBottom:4,marginBottom:4}}>
                        <span style={{color:"#3b82f6",fontWeight:700}}>🕐 وقت الطلب</span>
                        <span style={{color:"#3b82f6",fontWeight:700}}>
                          {(()=>{try{const d=new Date(order.createdAt);return `${d.toLocaleDateString("ar-EG",{day:"numeric",month:"short",year:"numeric"})} ${d.toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"})}`;}catch{return ago(order.createdAt);}})()}
                        </span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",borderBottom:`1px solid ${BDR}`,paddingBottom:4,marginBottom:4}}>
                        <span style={{color:"#a78bfa",fontWeight:700}}>🎫 رقم العضوية</span>
                        <span style={{color:"#a78bfa",fontWeight:900,fontSize:14,letterSpacing:2}}>{order.memberId||"—"}</span>
                      </div>
                      <div style={{color:MUT}}>👤 {order.client}</div>
                      <div style={{color:MUT}}>📞 {order.phone}</div>
                      <div style={{color:MUT}}>📍 {order.address}</div>
                      {order.deliveryDate&&<div style={{color:MUT}}>📅 موعد الاستلام: {order.deliveryDate}</div>}
                      {order.notes&&<div style={{color:MUT}}>📝 {order.notes}</div>}
                    </div>

                    {/* Items */}
                    <div style={{background:BG,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                      {Object.entries(order.items||{}).filter(([,q])=>q>0).map(([id,qty])=>{
                        const p=products.find(x=>x.id===id);
                        const showPrice=role==="manager"||role==="delivery";
                        return p?(<div key={id} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",borderBottom:`1px solid #1a2035`}}>
                          <span>{p.emoji} {p.name} × {qty}</span>
                          {showPrice&&<span style={{color:"#f59e0b",fontWeight:700}}>ج.م {p.price*qty}</span>}
                        </div>):null;
                      })}
                      {(role==="manager"||role==="delivery")&&(
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:6,borderTop:`1px solid ${BDR}`,fontWeight:800}}>
                          <span>الإجمالي</span>
                          <span style={{color:"#f59e0b",fontSize:15}}>ج.م {order.total}</span>
                        </div>
                      )}
                    </div>

                    {/* 📤 Share with delivery person — manager & delivery only */}
                    {order.status!=="تم الدفع"&&(role==="manager"||role==="delivery")&&(
                      <button onClick={e=>{
                        e.stopPropagation();
                        const items=Object.entries(order.items||{}).filter(([,q])=>q>0).map(([id,qty])=>{const p=products.find(x=>x.id===id);return p?`${p.emoji} ${p.name} × ${qty} = ج.م ${p.price*qty}`:null;}).filter(Boolean).join("\n");
                        const msg=`🐔 طلب توصيل\n━━━━━━━━━━━━\n📋 ${order.id}\n👤 ${order.client}\n📞 ${order.phone}\n📍 ${order.address}\n${order.deliveryDate?`📅 موعد الاستلام: ${order.deliveryDate}\n`:""}\n🛒 الأصناف:\n${items}\n\n💰 الإجمالي: ج.م ${order.total}\n━━━━━━━━━━━━`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
                      }} style={{...css.btn("#25D366","#fff"),marginBottom:8}}>
                        📤 إرسال التفاصيل على واتساب
                      </button>
                    )}

                    {/* Advance status — normal flow */}
                    {nxt(order.status)&&ro.canAdvance.includes(nxt(order.status))&&order.status!=="جاهز"&&(
                      <button onClick={e=>{e.stopPropagation();advance(order.id);}} style={css.btn(ST_COLOR[nxt(order.status)],"#fff")}>
                        {ST_ICON[nxt(order.status)]} → {nxt(order.status)}
                      </button>
                    )}

                    {/* Kitchen: جاهز → في الطريق (last kitchen action) */}
                    {order.status==="جاهز"&&role==="kitchen"&&(
                      <button onClick={e=>{e.stopPropagation();advance(order.id);T("🛵 تم إرسال الطلب للتوصيل");}} style={css.btn("#f97316","#fff")}>
                        🛵 إرسال للتوصيل — في الطريق
                      </button>
                    )}

                    {/* Send out for delivery — generates confirmation code */}
                    {order.status==="جاهز"&&ro.canDeliver&&(
                      <button onClick={e=>{
                        e.stopPropagation();
                        const code=String(Math.floor(1000+Math.random()*9000));
                        mutate(d=>({...d,orders:d.orders.map(o=>o.id===order.id?{...o,status:"في الطريق",confirmCode:code}:o)}));
                        // Auto-open WhatsApp with code for client
                        const msg=`🐔 طلبك في الطريق!\n━━━━━━━━━━━━\n📋 ${order.id}\n🔐 كود التأكيد: *${code}*\nأعطِ هذا الكود للمندوب عند الاستلام\n━━━━━━━━━━━━`;
                        setTimeout(()=>window.open(`https://wa.me/${order.phone?.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(msg)}`,"_blank"),300);
                        T("🛵 تم الإرسال وكود التأكيد اتبعت للعميل");
                      }} style={css.btn("#f97316","#fff")}>
                        🛵 إرسال للتوصيل + كود للعميل
                      </button>
                    )}

                    {/* Delivery confirmation with code */}
                    {order.status==="في الطريق"&&ro.canDeliver&&(
                      <div style={{marginTop:8}}>
                        {order.confirmCode&&(
                          <div style={{background:"#f9731611",border:"1px solid #f97316",borderRadius:10,padding:"10px 14px",marginBottom:10}}>
                            <div style={{fontSize:11,color:MUT,marginBottom:4}}>🔐 كود التأكيد المرسل للعميل</div>
                            <div style={{fontSize:28,fontWeight:900,color:"#f97316",textAlign:"center",letterSpacing:8}}>{order.confirmCode}</div>
                            <div style={{fontSize:11,color:MUT,textAlign:"center",marginTop:4}}>اطلب من العميل يقولك الكود</div>
                            {/* Resend code */}
                            <button onClick={e=>{
                              e.stopPropagation();
                              const msg=`🐔 طلبك في الطريق!\n📋 ${order.id}\n🔐 كود التأكيد: *${order.confirmCode}*\nأعطِ هذا الكود للمندوب`;
                              window.open(`https://wa.me/${order.phone?.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
                            }} style={{...css.sm("#25D366"),width:"100%",marginTop:8,display:"block",textAlign:"center"}}>
                              📤 إعادة إرسال الكود للعميل
                            </button>
                          </div>
                        )}
                        {/* Code input for delivery confirmation */}
                        <CodeConfirm order={order} onConfirm={(code)=>{
                          if(code===order.confirmCode){
                            mutate(d=>({...d,orders:d.orders.map(o=>o.id===order.id?{...o,status:"تم التسليم",confirmedAt:Date.now(),confirmedCode:code}:o)}));
                            T("✅ تم تأكيد التسليم من المندوب والعميل!");
                            setExpOrder(null);
                          }else{
                            T("❌ الكود غلط — اطلب من العميل يأكد","err");
                          }
                        }}/>
                      </div>
                    )}

                    {/* Delivery service */}
                    {ro.canDeliver&&!order.deliveryService&&order.status!=="تم الدفع"&&(
                      <div style={{marginTop:8}}>
                        <div style={{fontSize:11,color:MUT,marginBottom:5,fontWeight:700}}>🛵 تعيين خدمة التوصيل</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{DELIVERY.map(sv=><button key={sv.name} onClick={e=>{e.stopPropagation();assignDel(order.id,sv.name);}} style={css.sm("#1e3a5f")}>{sv.logo} {sv.name}</button>)}</div>
                      </div>
                    )}

                    {/* Payment */}
                    {ro.canPay&&order.status==="تم التسليم"&&!order.paymentMethod&&(
                      <div style={{marginTop:8}}>
                        <div style={{fontSize:11,color:MUT,marginBottom:5,fontWeight:700}}>💳 تسجيل الدفع</div>
                        <div style={{display:"flex",gap:6}}>{["كاش","فودافون كاش","انستاباي"].map(m=><button key={m} onClick={e=>{e.stopPropagation();pay(order.id,m);}} style={css.sm("#059669")}>{m}</button>)}</div>
                      </div>
                    )}
                    {order.paymentMethod&&<div style={{marginTop:8,fontSize:13,color:"#10b981",fontWeight:700}}>✅ تم الدفع بـ {order.paymentMethod}</div>}
                    {order.confirmedAt&&<div style={{marginTop:4,fontSize:11,color:"#10b981"}}>✅ تم التأكيد المزدوج — {new Date(order.confirmedAt).toLocaleTimeString("ar-EG")}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ CLIENTS ══ */}
        {view==="clients"&&(
          <div className="fd">
            <input style={{...css.inp,marginBottom:12}} placeholder="🔍 ابحث بالاسم أو رقم العضوية أو الهاتف..." value={cSearch} onChange={e=>setCSearch(e.target.value)}/>
            {filtClients.length===0&&<div style={{textAlign:"center",padding:"30px",color:SUB}}><div style={{fontSize:40}}>👤</div><div style={{marginTop:8}}>لا يوجد عملاء</div></div>}
            {[...filtClients].sort((a,b)=>(b.totalSpent||0)-(a.totalSpent||0)).map(c=>(
              <div key={c.id} style={{...css.card,borderColor:expClient===c.id?"#a78bfa":BDR,cursor:"pointer"}} onClick={()=>setExpClient(expClient===c.id?null:c.id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:"#a78bfa22",border:"2px solid #a78bfa55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#a78bfa"}}>{(c.name||"?").charAt(0)}</div>
                    <div>
                      <div style={{fontWeight:800,fontSize:14}}>{c.name}</div>
                      <div style={{fontSize:11,color:"#a78bfa",fontWeight:700}}>{c.memberId||"—"}</div>
                      <div style={{fontSize:11,color:SUB}}>{c.phone}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:12,color:"#a78bfa",fontWeight:700}}>{c.totalOrders} طلبات</div>
                    <div style={{fontSize:13,color:"#10b981",fontWeight:900}}>ج.م {c.totalSpent}</div>
                    <div style={{fontSize:10,color:MUT}}>معدل: ج.م {c.totalOrders?Math.round(c.totalSpent/c.totalOrders):0}/طلب</div>
                  </div>
                </div>
                {expClient===c.id&&(
                  <div style={{marginTop:10,borderTop:`1px solid ${BDR}`,paddingTop:10}}>
                    {/* Member stats */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                      {[
                        ["🛒 طلبات",c.totalOrders,"#a78bfa"],
                        ["💰 إجمالي",`ج.م ${c.totalSpent}`,"#10b981"],
                        ["📊 معدل",`ج.م ${c.totalOrders?Math.round(c.totalSpent/c.totalOrders):0}`,"#f59e0b"],
                      ].map(([l,v,col])=>(
                        <div key={l} style={{background:BG,borderRadius:8,padding:"7px",textAlign:"center"}}>
                          <div style={{fontSize:12,fontWeight:900,color:col}}>{v}</div>
                          <div style={{fontSize:9,color:MUT,marginTop:1}}>{l}</div>
                        </div>
                      ))}
                    </div>
                    {/* Top ordered products */}
                    {(()=>{
                      const clientOrders=db.orders.filter(o=>o.clientId===c.id);
                      const prodTotals={};
                      clientOrders.forEach(o=>Object.entries(o.items||{}).forEach(([id,q])=>{if(q>0)prodTotals[id]=(prodTotals[id]||0)+q;}));
                      const top=Object.entries(prodTotals).sort(([,a],[,b])=>b-a).slice(0,3);
                      return top.length>0?(
                        <div style={{marginBottom:10}}>
                          <div style={{fontSize:11,color:MUT,marginBottom:5,fontWeight:700}}>🏆 الأصناف المفضلة</div>
                          {top.map(([id,qty])=>{const p=products.find(x=>x.id===id);return p?(<div key={id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:`1px solid ${BDR}`}}><span>{p.emoji} {p.name}</span><span style={{color:"#f59e0b",fontWeight:700}}>× {qty}</span></div>):null;})}
                        </div>
                      ):null;
                    })()}
                    <div style={{fontSize:12,color:MUT,lineHeight:1.8,marginBottom:8}}>📍 {c.address}{c.notes&&<><br/>📝 {c.notes}</>}</div>
                    {tabs.includes("new")&&<button onClick={e=>{e.stopPropagation();setForm(f=>({...f,client:c.name,phone:c.phone,address:c.address,notes:c.notes,memberSearch:""}));setMatchedC(c);setMemberHint(c);setOMode("manual");setView("new");T(`📋 ${c.name}`);}} style={{...css.btn("#d97706","#000"),marginTop:0}}>➕ طلب جديد</button>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ COSTS ══ */}
        {view==="costs"&&(
          <div className="fd">
            {/* Profit summary at top */}
            <div style={{background:"linear-gradient(135deg,#1a2035,#0f1824)",border:`2px solid ${profit>=0?"#10b981":"#ef4444"}44`,borderRadius:16,padding:14,marginBottom:12}}>
              <div style={{fontWeight:900,fontSize:13,marginBottom:10,color:"#f59e0b"}}>📊 ملخص الربح — {costsSel?.name||"الدورة الحالية"}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:8}}>
                {[["💰 إيراد",revenue,"#10b981"],["📉 تكاليف",GRAND,"#ef4444"],["📈 ربح",Math.abs(profit),profit>=0?"#10b981":"#ef4444"],["📦 ربح/كيلو",profitPerKg,profitPerKg>=0?"#10b981":"#ef4444"]].map(([l,v,c])=>(
                  <div key={l} style={{background:BG,borderRadius:9,padding:"8px",textAlign:"center"}}>
                    <div style={{fontSize:15,fontWeight:900,color:c}}>{typeof v==="number"?`ج.م ${isNaN(v)?"0":v.toFixed(0)}`:v}</div>
                    <div style={{fontSize:10,color:MUT,marginTop:1}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:BG,borderRadius:9,padding:"8px 12px"}}>
                <span style={{fontSize:12,color:MUT}}>⚖️ متوسط وزن الطائر (كجم)</span>
                <input type="number" step="0.1" style={{width:50,background:"transparent",border:"none",borderBottom:"1px solid #252d3d",color:"#f59e0b",fontWeight:900,fontSize:14,textAlign:"center",outline:"none",fontFamily:"'Cairo',sans-serif"}}
                  value={db.avgWeight||2} onChange={e=>mutate(d=>({...d,avgWeight:parseFloat(e.target.value)||2}))}/>
              </div>
            </div>

            {/* Costs sub-nav */}
            <div style={{display:"flex",background:"#0f1420",borderRadius:12,marginBottom:12,border:"1px solid #252d3d",overflow:"hidden"}}>
              {[["cycles","📋","الدورات"],["entry","✏️","إدخال التكاليف"],["compare","📊","مقارنة"]].map(([v,ic,lb])=>(
                <button key={v} onClick={()=>setCostsView(v)} style={{flex:1,padding:"9px 2px",border:"none",background:"none",color:costsView===v?"#f59e0b":"#64748b",fontWeight:costsView===v?800:400,borderBottom:costsView===v?"3px solid #f59e0b":"3px solid transparent",cursor:"pointer",fontSize:10,fontFamily:"'Cairo',sans-serif"}}>
                  <div style={{fontSize:13}}>{ic}</div><div>{lb}</div>
                </button>
              ))}
            </div>

            {/* ── Cycles list ── */}
            {costsView==="cycles"&&(
              <div>
                <button style={{...css.btn("#f59e0b","#000"),marginBottom:12}} onClick={()=>setCostsShowNew(!costsShowNew)}>
                  {costsShowNew?"✕ إلغاء":"➕ إنشاء دورة تكاليف جديدة"}
                </button>
                {costsShowNew&&(
                  <div style={{...css.card,border:"2px solid #f59e0b55",marginBottom:12}}>
                    <div style={{fontWeight:900,fontSize:14,color:"#f59e0b",marginBottom:10}}>🐔 دورة جديدة</div>
                    <label style={css.lbl}>اسم الدورة *</label>
                    <input style={css.inp} placeholder="مثال: دورة رمضان" value={costsNf.name} onChange={e=>setCostsNf(f=>({...f,name:e.target.value}))}/>
                    <label style={css.lbl}>عدد الطيور</label>
                    <input style={css.inp} type="number" placeholder="500" value={costsNf.birds} onChange={e=>setCostsNf(f=>({...f,birds:e.target.value}))}/>
                    <div style={{display:"flex",gap:8}}>
                      <div style={{flex:1}}><label style={css.lbl}>تاريخ البداية</label><input style={css.inp} type="date" value={costsNf.startDate} onChange={e=>setCostsNf(f=>({...f,startDate:e.target.value}))}/></div>
                      <div style={{flex:1}}><label style={css.lbl}>تاريخ النهاية</label><input style={css.inp} type="date" value={costsNf.endDate} onChange={e=>setCostsNf(f=>({...f,endDate:e.target.value}))}/></div>
                    </div>
                    <button style={css.btn("#f59e0b","#000")} onClick={addCostCycle}>✅ إنشاء</button>
                  </div>
                )}
                {costsDB.cycles.map(c=>{
                  const tot=calcCostTotal(c.costs);const isSel=c.id===costsSelId;
                  return(
                    <div key={c.id} style={{...css.card,borderColor:isSel?"#f59e0b":BDR,cursor:"pointer"}} onClick={()=>setCostsSelId(c.id)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{fontWeight:900,fontSize:14}}>{c.name}</div>
                            <span style={CTAG(c.status==="active"?"#10b981":"#64748b")}>{c.status==="active"?"🟢 نشطة":"🔒 مغلقة"}</span>
                          </div>
                          <div style={{fontSize:12,color:MUT,marginTop:3}}>🐔 {c.birds} طائر</div>
                          {c.startDate&&<div style={{fontSize:11,color:SUB}}>📅 {c.startDate}{c.endDate&&` ← ${c.endDate}`}</div>}
                        </div>
                        <div style={{textAlign:"left"}}>
                          <div style={{fontWeight:900,fontSize:14,color:"#ef4444"}}>ج.م {CFMT(tot)}</div>
                          {tot>0&&<div style={{fontSize:11,color:MUT}}>ج.م {(tot/(CN(c.birds)||500)).toFixed(1)}/طائر</div>}
                        </div>
                      </div>
                      {isSel&&(
                        <div style={{marginTop:10,borderTop:`1px solid ${BDR}`,paddingTop:10,display:"flex",gap:6}}>
                          <button onClick={e=>{e.stopPropagation();setCostsView("entry");}} style={{...css.btn("#f59e0b","#000"),flex:2,padding:"8px",marginTop:0}}>✏️ إدخال التكاليف</button>
                          {c.status==="active"
                            ?<button onClick={e=>{e.stopPropagation();updCostsCycle({status:"closed"});T("🔒 تم الإغلاق");}} style={{...css.btn("#1e3a5f","#3b82f6"),flex:1,padding:"8px",marginTop:0,fontSize:11}}>🔒 إغلاق</button>
                            :<button onClick={e=>{e.stopPropagation();updCostsCycle({status:"active"});T("🟢 فتح");}} style={{...css.btn("#0d2b1a","#10b981"),flex:1,padding:"8px",marginTop:0,fontSize:11}}>🔓 فتح</button>}
                          <button onClick={e=>{e.stopPropagation();if(window.confirm("حذف الدورة؟"))delCostCycle(c.id);}} style={{...css.btn("#dc262618","#ef4444"),flex:1,padding:"8px",marginTop:0,fontSize:11}}>🗑</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Entry ── */}
            {costsView==="entry"&&costsSel&&(
              <div>
                {/* Cycle header */}
                <div style={{...css.card,border:"2px solid #f59e0b44",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    {costsEditName
                      ?<input style={{...css.inp,marginBottom:0,fontWeight:900,fontSize:14,color:"#f59e0b",flex:1}} value={costsSel.name}
                          onChange={e=>updCostsCycle({name:e.target.value})}
                          onBlur={()=>{setCostsEditName(false);T("✅ تم تغيير الاسم");}} autoFocus/>
                      :<div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontWeight:900,fontSize:14,color:"#f59e0b"}}>{costsSel.name}</span>
                        <button onClick={()=>setCostsEditName(true)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:MUT}}>✏️</button>
                      </div>}
                    <span style={CTAG(costsSel.status==="active"?"#10b981":"#64748b")}>{costsSel.status==="active"?"نشطة":"مغلقة"}</span>
                  </div>
                  <select style={css.inp} value={costsSelId} onChange={e=>setCostsSelId(e.target.value)}>
                    {costsDB.cycles.map(c=><option key={c.id} value={c.id}>{c.name}{c.status==="closed"?" 🔒":""}</option>)}
                  </select>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{flex:1,background:BG,borderRadius:9,padding:"9px",textAlign:"center"}}>
                      <div style={{fontSize:16,fontWeight:900,color:"#ef4444"}}>ج.م {CFMT(GRAND)}</div>
                      <div style={{fontSize:10,color:MUT}}>إجمالي التكاليف</div>
                    </div>
                    <div style={{flex:1,background:BG,borderRadius:9,padding:"9px",textAlign:"center"}}>
                      <div style={{fontSize:16,fontWeight:900,color:"#ef4444"}}>ج.م {(GRAND/costsBirds).toFixed(2)}</div>
                      <div style={{fontSize:10,color:MUT}}>تكلفة / طائر</div>
                    </div>
                  </div>
                </div>

                {/* 1. CHICKS */}
                <CSec id="chicks" icon="🐣" title="الكتاكيت" total={sumC(costsData.chicks)} color="#f59e0b" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.chicks.map(x=>(
                    <CICard key={x.id} canDelete={costsData.chicks.length>1} onDelete={()=>delCostItem("chicks",x.id)}>
                      <label style={CLBl}>النوع</label><input style={{...SI,marginBottom:6}} placeholder="كتاكيت لاحم" value={x.name} onChange={e=>updCostItem("chicks",x.id,{name:e.target.value})}/>
                      <div style={{display:"flex",gap:8}}>
                        <div style={{flex:1}}><label style={CLBl}>العدد</label><input style={SI} type="number" placeholder="500" value={x.count} onChange={e=>updCostItem("chicks",x.id,{count:e.target.value})}/></div>
                        <div style={{flex:1}}><label style={CLBl}>سعر الكتكوت (ج.م)</label><input style={SI} type="number" placeholder="0" value={x.priceEach} onChange={e=>updCostItem("chicks",x.id,{priceEach:e.target.value})}/></div>
                      </div>
                      {CN(x.count)>0&&CN(x.priceEach)>0&&<div style={{fontSize:11,color:"#f59e0b",fontWeight:700,marginTop:4}}>{x.count} × {x.priceEach} = ج.م {CFMT(CN(x.count)*CN(x.priceEach))}</div>}
                    </CICard>
                  ))}
                  {costsAddOpen==="chicks"
                    ?<CAddForm title="إضافة كتاكيت" color="#f59e0b" fields={[{key:"name",label:"النوع",ph:"كتاكيت لاحم"},{key:"count",label:"العدد",ph:"500",type:"number"},{key:"priceEach",label:"سعر الكتكوت",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("chicks",{name:v.name||"كتاكيت",count:v.count,priceEach:v.priceEach})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#f59e0b18","#f59e0b",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("chicks")}>➕ إضافة دفعة</button>}
                  {sumC(costsData.chicks)>0&&<CTRow label="الإجمالي" total={sumC(costsData.chicks)} color="#f59e0b"/>}
                </CSec>

                {/* 2. FEED */}
                <CSec id="feed" icon="🌾" title="العلاف" total={sumF(costsData.feed)} color="#84cc16" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.feed.map(x=>(
                    <CICard key={x.id} canDelete={costsData.feed.length>1} onDelete={()=>delCostItem("feed",x.id)}>
                      <label style={CLBl}>نوع العلاف</label><input style={{...SI,marginBottom:6}} placeholder="علاف بادئ" value={x.name} onChange={e=>updCostItem("feed",x.id,{name:e.target.value})}/>
                      <div style={{display:"flex",gap:8,marginBottom:6}}>
                        <div style={{flex:1}}><label style={CLBl}>عدد الشكاير</label><input style={SI} type="number" placeholder="0" value={x.bags} onChange={e=>updCostItem("feed",x.id,{bags:e.target.value})}/></div>
                        <div style={{flex:1}}><label style={CLBl}>وزن الشكارة (كجم)</label><input style={SI} type="number" placeholder="50" value={x.bagWeight} onChange={e=>updCostItem("feed",x.id,{bagWeight:e.target.value})}/></div>
                      </div>
                      <label style={CLBl}>سعر الشكارة (ج.م)</label><input style={SI} type="number" placeholder="0" value={x.bagPrice} onChange={e=>updCostItem("feed",x.id,{bagPrice:e.target.value})}/>
                      {CN(x.bags)>0&&CN(x.bagWeight)>0&&<div style={{fontSize:11,color:MUT,marginTop:2}}>📦 {CN(x.bags)*CN(x.bagWeight)} كجم إجمالي</div>}
                      {CN(x.bags)>0&&CN(x.bagPrice)>0&&<div style={{fontSize:11,color:"#84cc16",fontWeight:700,marginTop:2}}>{x.bags} × {x.bagPrice} = ج.م {CFMT(CN(x.bags)*CN(x.bagPrice))}</div>}
                    </CICard>
                  ))}
                  {costsAddOpen==="feed"
                    ?<CAddForm title="إضافة نوع علاف" color="#84cc16" fields={[{key:"name",label:"النوع",ph:"علاف بادئ"},{key:"bags",label:"عدد الشكاير",ph:"0",type:"number"},{key:"bagWeight",label:"وزن الشكارة كجم",ph:"50",type:"number"},{key:"bagPrice",label:"سعر الشكارة",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("feed",{name:v.name||"علاف",bags:v.bags,bagWeight:v.bagWeight,bagPrice:v.bagPrice})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#84cc1618","#84cc16",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("feed")}>➕ إضافة نوع علاف</button>}
                  {sumF(costsData.feed)>0&&<CTRow label="إجمالي العلاف" total={sumF(costsData.feed)} color="#84cc16"/>}
                </CSec>

                {/* 3. VITAMINS */}
                <CSec id="vitamins" icon="💉" title="الفيتامينات" total={sumA(costsData.vitamins)} color="#a78bfa" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.vitamins.map(x=>(
                    <div key={x.id} style={{display:"flex",gap:6,marginBottom:7,alignItems:"center"}}>
                      <input style={{...SI,flex:2}} placeholder="اسم الفيتامين" value={x.name} onChange={e=>updCostItem("vitamins",x.id,{name:e.target.value})}/>
                      <input style={{...SI,flex:1,color:"#f59e0b",textAlign:"center"}} type="number" placeholder="ج.م" value={x.amount} onChange={e=>updCostItem("vitamins",x.id,{amount:e.target.value})}/>
                      <button onClick={()=>delCostItem("vitamins",x.id)} style={{background:"#dc262618",border:"none",borderRadius:7,padding:"8px",cursor:"pointer",color:"#ef4444",fontSize:13,flexShrink:0}}>🗑</button>
                    </div>
                  ))}
                  {costsAddOpen==="vitamins"
                    ?<CAddForm title="إضافة فيتامين" color="#a78bfa" fields={[{key:"name",label:"الاسم",ph:"فيتامين د"},{key:"amount",label:"المبلغ (ج.م)",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("vitamins",{name:v.name||"فيتامين",amount:v.amount})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#a78bfa18","#a78bfa",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("vitamins")}>➕ إضافة فيتامين</button>}
                  {sumA(costsData.vitamins)>0&&<CTRow label="الإجمالي" total={sumA(costsData.vitamins)} color="#a78bfa"/>}
                </CSec>

                {/* 4. MEDS */}
                <CSec id="meds" icon="💊" title="الأدوية" total={sumA(costsData.meds)} color="#f472b6" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.meds.map(x=>(
                    <div key={x.id} style={{display:"flex",gap:6,marginBottom:7,alignItems:"center"}}>
                      <input style={{...SI,flex:2}} placeholder="اسم الدواء" value={x.name} onChange={e=>updCostItem("meds",x.id,{name:e.target.value})}/>
                      <input style={{...SI,flex:1,color:"#f59e0b",textAlign:"center"}} type="number" placeholder="ج.م" value={x.amount} onChange={e=>updCostItem("meds",x.id,{amount:e.target.value})}/>
                      <button onClick={()=>delCostItem("meds",x.id)} style={{background:"#dc262618",border:"none",borderRadius:7,padding:"8px",cursor:"pointer",color:"#ef4444",fontSize:13,flexShrink:0}}>🗑</button>
                    </div>
                  ))}
                  {costsAddOpen==="meds"
                    ?<CAddForm title="إضافة دواء" color="#f472b6" fields={[{key:"name",label:"الاسم",ph:"مضاد حيوي"},{key:"amount",label:"المبلغ (ج.م)",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("meds",{name:v.name||"دواء",amount:v.amount})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#f472b618","#f472b6",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("meds")}>➕ إضافة دواء</button>}
                  {sumA(costsData.meds)>0&&<CTRow label="الإجمالي" total={sumA(costsData.meds)} color="#f472b6"/>}
                </CSec>

                {/* 5. ELECTRICITY */}
                <CSec id="electric" icon="⚡" title="الكهرباء" total={sumM(costsData.electric)} color="#fbbf24" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.electric.map(x=>(
                    <CICard key={x.id} canDelete={costsData.electric.length>1} onDelete={()=>delCostItem("electric",x.id)}>
                      <label style={CLBl}>الوصف</label><input style={{...SI,marginBottom:6}} placeholder="عداد المزرعة" value={x.name} onChange={e=>updCostItem("electric",x.id,{name:e.target.value})}/>
                      <div style={{display:"flex",gap:8}}>
                        <div style={{flex:1}}><label style={CLBl}>الاستهلاك (كيلوواط)</label><input style={SI} type="number" placeholder="0" value={x.units} onChange={e=>updCostItem("electric",x.id,{units:e.target.value})}/></div>
                        <div style={{flex:1}}><label style={CLBl}>سعر الكيلوواط</label><input style={SI} type="number" placeholder="0" value={x.pricePerUnit} onChange={e=>updCostItem("electric",x.id,{pricePerUnit:e.target.value})}/></div>
                      </div>
                      {CN(x.units)>0&&CN(x.pricePerUnit)>0&&<div style={{fontSize:11,color:"#fbbf24",fontWeight:700,marginTop:2}}>{x.units} × {x.pricePerUnit} = ج.م {CFMT(CN(x.units)*CN(x.pricePerUnit))}</div>}
                    </CICard>
                  ))}
                  {costsAddOpen==="electric"
                    ?<CAddForm title="إضافة عداد كهرباء" color="#fbbf24" fields={[{key:"name",label:"الوصف",ph:"عداد المزرعة"},{key:"units",label:"الاستهلاك (كيلوواط)",ph:"0",type:"number"},{key:"pricePerUnit",label:"سعر الكيلوواط",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("electric",{name:v.name||"كهرباء",units:v.units,pricePerUnit:v.pricePerUnit})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#fbbf2418","#fbbf24",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("electric")}>➕ إضافة عداد</button>}
                  {sumM(costsData.electric)>0&&<CTRow label="إجمالي الكهرباء" total={sumM(costsData.electric)} color="#fbbf24"/>}
                </CSec>

                {/* 6. WATER */}
                <CSec id="water" icon="💧" title="المياه" total={sumM(costsData.water)} color="#38bdf8" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.water.map(x=>(
                    <CICard key={x.id} canDelete={costsData.water.length>1} onDelete={()=>delCostItem("water",x.id)}>
                      <label style={CLBl}>الوصف</label><input style={{...SI,marginBottom:6}} placeholder="مياه شرب" value={x.name} onChange={e=>updCostItem("water",x.id,{name:e.target.value})}/>
                      <div style={{display:"flex",gap:8}}>
                        <div style={{flex:1}}><label style={CLBl}>الاستهلاك (م³)</label><input style={SI} type="number" placeholder="0" value={x.units} onChange={e=>updCostItem("water",x.id,{units:e.target.value})}/></div>
                        <div style={{flex:1}}><label style={CLBl}>سعر المتر (ج.م)</label><input style={SI} type="number" placeholder="0" value={x.pricePerUnit} onChange={e=>updCostItem("water",x.id,{pricePerUnit:e.target.value})}/></div>
                      </div>
                      {CN(x.units)>0&&CN(x.pricePerUnit)>0&&<div style={{fontSize:11,color:"#38bdf8",fontWeight:700,marginTop:2}}>{x.units} م³ × {x.pricePerUnit} = ج.م {CFMT(CN(x.units)*CN(x.pricePerUnit))}</div>}
                    </CICard>
                  ))}
                  {costsAddOpen==="water"
                    ?<CAddForm title="إضافة عداد مياه" color="#38bdf8" fields={[{key:"name",label:"الوصف",ph:"مياه شرب"},{key:"units",label:"الاستهلاك (م³)",ph:"0",type:"number"},{key:"pricePerUnit",label:"سعر المتر",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("water",{name:v.name||"مياه",units:v.units,pricePerUnit:v.pricePerUnit})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#38bdf818","#38bdf8",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("water")}>➕ إضافة عداد مياه</button>}
                  {sumM(costsData.water)>0&&<CTRow label="إجمالي المياه" total={sumM(costsData.water)} color="#38bdf8"/>}
                </CSec>

                {/* 7. VETS */}
                <CSec id="vets" icon="🩺" title="الأطباء البيطريين" total={sumS(costsData.vets)} color="#34d399" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.vets.map(x=>(
                    <CICard key={x.id} canDelete={costsData.vets.length>1} onDelete={()=>delCostItem("vets",x.id)}>
                      <div style={{display:"flex",gap:8,marginBottom:6}}>
                        <div style={{flex:2}}><label style={CLBl}>الاسم</label><input style={SI} placeholder="اسم الطبيب" value={x.name} onChange={e=>updCostItem("vets",x.id,{name:e.target.value})}/></div>
                        <div style={{flex:1}}><label style={CLBl}>المرتب (ج.م)</label><input style={SI} type="number" placeholder="0" value={x.salary} onChange={e=>updCostItem("vets",x.id,{salary:e.target.value})}/></div>
                      </div>
                      <label style={CLBl}>التخصص</label><input style={SI} placeholder="طبيب بيطري" value={x.role} onChange={e=>updCostItem("vets",x.id,{role:e.target.value})}/>
                    </CICard>
                  ))}
                  {costsAddOpen==="vets"
                    ?<CAddForm title="إضافة طبيب" color="#34d399" fields={[{key:"name",label:"الاسم",ph:"اسم الطبيب"},{key:"role",label:"التخصص",ph:"طبيب بيطري"},{key:"salary",label:"المرتب (ج.م)",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("vets",{name:v.name||"طبيب",role:v.role||"طبيب بيطري",salary:v.salary})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#34d39918","#34d399",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("vets")}>➕ إضافة طبيب</button>}
                  {sumS(costsData.vets)>0&&<CTRow label="إجمالي الأطباء" total={sumS(costsData.vets)} color="#34d399"/>}
                </CSec>

                {/* 8. EMPLOYEES */}
                <CSec id="emp" icon="👷" title="الموظفين" total={sumS(costsData.employees)} color="#fb923c" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.employees.map(x=>(
                    <CICard key={x.id} canDelete={costsData.employees.length>1} onDelete={()=>delCostItem("employees",x.id)}>
                      <div style={{display:"flex",gap:8,marginBottom:6}}>
                        <div style={{flex:2}}><label style={CLBl}>الاسم</label><input style={SI} placeholder="اسم الموظف" value={x.name} onChange={e=>updCostItem("employees",x.id,{name:e.target.value})}/></div>
                        <div style={{flex:1}}><label style={CLBl}>المرتب (ج.م)</label><input style={SI} type="number" placeholder="0" value={x.salary} onChange={e=>updCostItem("employees",x.id,{salary:e.target.value})}/></div>
                      </div>
                      <label style={CLBl}>الوصف الوظيفي</label><input style={SI} placeholder="عامل تنظيف" value={x.role} onChange={e=>updCostItem("employees",x.id,{role:e.target.value})}/>
                    </CICard>
                  ))}
                  {costsAddOpen==="emp"
                    ?<CAddForm title="إضافة موظف" color="#fb923c" fields={[{key:"name",label:"الاسم",ph:"اسم الموظف"},{key:"role",label:"الوظيفة",ph:"عامل"},{key:"salary",label:"المرتب (ج.م)",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("employees",{name:v.name||"موظف",role:v.role||"",salary:v.salary})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#fb923c18","#fb923c",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("emp")}>➕ إضافة موظف</button>}
                  {sumS(costsData.employees)>0&&<CTRow label="إجمالي الموظفين" total={sumS(costsData.employees)} color="#fb923c"/>}
                </CSec>

                {/* 9. CLEANING */}
                <CSec id="cleaning" icon="🧹" title="النظافة" total={sumA(costsData.cleaning)} color="#94a3b8" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.cleaning.map(x=>(
                    <div key={x.id} style={{display:"flex",gap:6,marginBottom:7,alignItems:"center"}}>
                      <input style={{...SI,flex:2}} placeholder="الوصف" value={x.name} onChange={e=>updCostItem("cleaning",x.id,{name:e.target.value})}/>
                      <input style={{...SI,flex:1,color:"#f59e0b",textAlign:"center"}} type="number" placeholder="ج.م" value={x.amount} onChange={e=>updCostItem("cleaning",x.id,{amount:e.target.value})}/>
                      <button onClick={()=>delCostItem("cleaning",x.id)} style={{background:"#dc262618",border:"none",borderRadius:7,padding:"8px",cursor:"pointer",color:"#ef4444",fontSize:13,flexShrink:0}}>🗑</button>
                    </div>
                  ))}
                  {costsAddOpen==="cleaning"
                    ?<CAddForm title="إضافة بند نظافة" color="#94a3b8" fields={[{key:"name",label:"الوصف",ph:"تنظيف أسبوعي"},{key:"amount",label:"المبلغ (ج.م)",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("cleaning",{name:v.name||"نظافة",amount:v.amount})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#94a3b818","#94a3b8",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("cleaning")}>➕ إضافة بند</button>}
                  {sumA(costsData.cleaning)>0&&<CTRow label="إجمالي النظافة" total={sumA(costsData.cleaning)} color="#94a3b8"/>}
                </CSec>

                {/* 10. PACKAGING */}
                <CSec id="packaging" icon="📦" title="التغليف" total={sumP(costsData.packaging)} color="#c084fc" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.packaging.map(pk=>(
                    <CICard key={pk.id} canDelete onDelete={()=>delCostItem("packaging",pk.id)}>
                      <label style={CLBl}>نوع التغليف</label><input style={{...SI,marginBottom:6,color:"#c084fc",fontWeight:700}} value={pk.name} onChange={e=>updCostItem("packaging",pk.id,{name:e.target.value})}/>
                      <div style={{display:"flex",gap:8}}>
                        <div style={{flex:1}}><label style={CLBl}>العدد</label><input style={SI} type="number" placeholder="0" value={pk.count} onChange={e=>updCostItem("packaging",pk.id,{count:e.target.value})}/></div>
                        <div style={{flex:1}}><label style={CLBl}>سعر الوحدة (ج.م)</label><input style={SI} type="number" placeholder="0" value={pk.priceEach} onChange={e=>updCostItem("packaging",pk.id,{priceEach:e.target.value})}/></div>
                      </div>
                      {CN(pk.count)>0&&CN(pk.priceEach)>0&&<div style={{fontSize:11,color:"#c084fc",fontWeight:700,marginTop:2}}>{pk.count} × {pk.priceEach} = ج.م {CFMT(CN(pk.count)*CN(pk.priceEach))}</div>}
                    </CICard>
                  ))}
                  {costsAddOpen==="packaging"
                    ?<CAddForm title="إضافة نوع تغليف" color="#c084fc" fields={[{key:"name",label:"النوع",ph:"كيس صغير"},{key:"count",label:"العدد",ph:"0",type:"number"},{key:"priceEach",label:"سعر الوحدة",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("packaging",{name:v.name||"تغليف",count:v.count,priceEach:v.priceEach})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#c084fc18","#c084fc",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("packaging")}>➕ إضافة نوع تغليف</button>}
                  {sumP(costsData.packaging)>0&&<CTRow label="إجمالي التغليف" total={sumP(costsData.packaging)} color="#c084fc"/>}
                </CSec>

                {/* 11. OTHER */}
                <CSec id="other" icon="📝" title="بنود أخرى" total={sumA(costsData.other)} color="#64748b" openSec={costsOpenSec} onToggle={toggleCostsSec}>
                  {costsData.other.map(x=>(
                    <div key={x.id} style={{display:"flex",gap:6,marginBottom:7,alignItems:"center"}}>
                      <input style={{...SI,flex:2}} placeholder="اسم البند" value={x.name} onChange={e=>updCostItem("other",x.id,{name:e.target.value})}/>
                      <input style={{...SI,flex:1,color:"#f59e0b",textAlign:"center"}} type="number" placeholder="ج.م" value={x.amount} onChange={e=>updCostItem("other",x.id,{amount:e.target.value})}/>
                      <button onClick={()=>delCostItem("other",x.id)} style={{background:"#dc262618",border:"none",borderRadius:7,padding:"8px",cursor:"pointer",color:"#ef4444",fontSize:13,flexShrink:0}}>🗑</button>
                    </div>
                  ))}
                  {costsAddOpen==="other"
                    ?<CAddForm title="إضافة بند" color="#64748b" fields={[{key:"name",label:"الاسم",ph:"صيانة"},{key:"amount",label:"المبلغ (ج.م)",ph:"0",type:"number"}]} onConfirm={v=>addCostItem("other",{name:v.name||"بند",amount:v.amount})} onCancel={()=>setCostsAddOpen(null)}/>
                    :<button style={{...CBTN("#64748b18","#64748b",{width:"100%",marginTop:4})}} onClick={()=>setCostsAddOpen("other")}>➕ إضافة بند</button>}
                  {sumA(costsData.other)>0&&<CTRow label="الإجمالي" total={sumA(costsData.other)} color="#64748b"/>}
                </CSec>

                {/* Grand Total */}
                <div style={{background:"linear-gradient(135deg,#1e1206,#1a2035)",border:"2px solid #ef444444",borderRadius:14,padding:"14px 16px",marginTop:4}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontWeight:900,fontSize:15}}>📊 إجمالي التكاليف</span>
                    <span style={{fontWeight:900,fontSize:20,color:"#ef4444"}}>ج.م {CFMT(GRAND)}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                    {Object.entries(calcCostBD(costsData)).filter(([,v])=>v>0).map(([k,v])=>(
                      <div key={k} style={{background:BG,borderRadius:8,padding:"6px 10px",display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontSize:11,color:MUT}}>{k}</span>
                        <span style={{fontSize:11,fontWeight:700,color:"#f59e0b"}}>ج.م {CFMT(v)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{background:BG,borderRadius:9,padding:"9px 12px",display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,color:MUT}}>🐔 تكلفة الطائر ({costsBirds} طائر)</span>
                    <span style={{fontWeight:900,color:"#ef4444"}}>ج.م {(GRAND/costsBirds).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Compare ── */}
            {costsView==="compare"&&(
              <div>
                <div style={{fontWeight:800,fontSize:14,marginBottom:14,color:"#f59e0b"}}>📊 مقارنة بين الدورات</div>
                {costsDB.cycles.length<=1&&<div style={{textAlign:"center",padding:"30px",color:SUB}}><div style={{fontSize:40}}>📊</div><div style={{marginTop:8}}>أضف دورتين على الأقل</div></div>}
                {costsDB.cycles.length>1&&(()=>{
                  const cmpData=costsDB.cycles.map(c=>{
                    const totalCost=calcCostTotal(c.costs);
                    // Filter paid orders by cycle date range if available
                    const start=c.startDate?new Date(c.startDate).getTime():0;
                    const end=c.endDate?new Date(c.endDate).getTime()+86400000:Date.now();
                    const cycleOrders=db.orders.filter(o=>{
                      if(o.status!=="تم الدفع")return false;
                      if(c.startDate||c.endDate){
                        const t=new Date(o.createdAt).getTime();
                        return t>=start&&t<=end;
                      }
                      return true; // no date range = show all
                    });
                    const cycleRevenue=cycleOrders.reduce((s,o)=>s+o.total,0);
                    const netProfit=cycleRevenue-totalCost;
                    return{id:c.id,name:c.name,birds:CN(c.birds)||500,total:totalCost,status:c.status,breakdown:calcCostBD(c.costs),start:c.startDate,end:c.endDate,revenue:cycleRevenue,netProfit,ordersCount:cycleOrders.length};
                  });
                  const maxT=Math.max(...cmpData.map(x=>x.total),1);
                  const maxR=Math.max(...cmpData.map(x=>x.revenue),1);
                  return(
                    <div>
                      {/* Bar chart */}
                      <div style={css.card}>
                        <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:MUT}}>إجمالي التكاليف</div>
                        {cmpData.map(c=>(
                          <div key={c.id} style={{marginBottom:10,cursor:"pointer"}} onClick={()=>{setCostsSelId(c.id);setCostsView("entry");}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                              <span style={{fontSize:12,fontWeight:700,color:c.id===costsSelId?"#f59e0b":TXT}}>{c.name}</span>
                              <span style={{fontSize:12,fontWeight:700,color:"#ef4444"}}>ج.م {CFMT(c.total)}</span>
                            </div>
                            <div style={{height:8,borderRadius:4,background:BDR,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${(c.total/maxT)*100}%`,background:c.id===costsSelId?"#f59e0b":"#3b82f6",borderRadius:4}}/>
                            </div>
                            <div style={{fontSize:10,color:MUT,marginTop:2}}>ج.م {(c.total/(c.birds||500)).toFixed(2)}/طائر · {c.birds} طائر</div>
                          </div>
                        ))}
                      </div>

                      {/* Detailed cards with revenue + profit */}
                      {cmpData.map(c=>(
                        <div key={c.id} style={{...css.card,borderColor:c.id===costsSelId?"#f59e0b":BDR,cursor:"pointer"}} onClick={()=>{setCostsSelId(c.id);setCostsView("entry");}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                            <div>
                              <div style={{fontWeight:900,fontSize:14}}>{c.name}</div>
                              <div style={{fontSize:11,color:MUT,marginTop:2}}>🐔 {c.birds} طائر · 🛒 {c.ordersCount} طلب{c.start?` · ${c.start}→${c.end||"الآن"}`:""}</div>
                            </div>
                            <span style={CTAG(c.status==="active"?"#10b981":"#64748b")}>{c.status==="active"?"نشطة":"مغلقة"}</span>
                          </div>

                          {/* 3 key numbers */}
                          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
                            {[
                              ["💰 إجمالي المبيعات",c.revenue,"#10b981"],
                              ["📉 إجمالي التكاليف",c.total,"#ef4444"],
                              [c.netProfit>=0?"📈 صافي الربح":"📉 صافي الخسارة",Math.abs(c.netProfit),c.netProfit>=0?"#10b981":"#ef4444"],
                            ].map(([l,v,col])=>(
                              <div key={l} style={{background:BG,borderRadius:9,padding:"8px 6px",textAlign:"center"}}>
                                <div style={{fontSize:13,fontWeight:900,color:col}}>ج.م {CFMT(v)}</div>
                                <div style={{fontSize:9,color:MUT,marginTop:2}}>{l}</div>
                              </div>
                            ))}
                          </div>

                          {/* Profit bar */}
                          {c.revenue>0&&(
                            <div>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:MUT,marginBottom:3}}>
                                <span>نسبة الربح</span>
                                <span style={{color:c.netProfit>=0?"#10b981":"#ef4444",fontWeight:700}}>
                                  {c.revenue>0?((c.netProfit/c.revenue)*100).toFixed(1):0}%
                                </span>
                              </div>
                              <div style={{height:6,borderRadius:3,background:BDR,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${Math.min(100,Math.max(0,(c.netProfit/c.revenue)*100))}%`,background:c.netProfit>=0?"#10b981":"#ef4444",borderRadius:3}}/>
                              </div>
                            </div>
                          )}

                          {/* Cost breakdown mini */}
                          {c.total>0&&(
                            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,marginTop:8}}>
                              {Object.entries(c.breakdown).filter(([,v])=>v>0).slice(0,6).map(([k,v])=>(
                                <div key={k} style={{background:BG,borderRadius:6,padding:"4px 6px",textAlign:"center"}}>
                                  <div style={{fontSize:10,fontWeight:700,color:"#f59e0b"}}>ج.م {CFMT(v)}</div>
                                  <div style={{fontSize:8,color:MUT}}>{k}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Profit per sold item */}
            {GRAND>0&&costsView!=="cycles"&&(()=>{
              const paidOrders=db.orders.filter(o=>o.status==="تم الدفع");
              const soldData={};
              paidOrders.forEach(o=>Object.entries(o.items||{}).forEach(([id,qty])=>{if(qty>0){if(!soldData[id])soldData[id]={qty:0,revenue:0};const p=products.find(x=>x.id===id);soldData[id].qty+=qty;soldData[id].revenue+=(p?p.price:0)*qty;}}));
              const soldItems=Object.entries(soldData).map(([id,data])=>{const p=products.find(x=>x.id===id);const cost=data.qty*costPerKg;return{...p,...data,cost,itemProfit:data.revenue-cost,margin:data.revenue>0?((data.revenue-cost)/data.revenue*100):0};}).filter(x=>x.qty>0).sort((a,b)=>b.itemProfit-a.itemProfit);
              if(!soldItems.length)return null;
              return(
                <div style={{...css.card,marginTop:12}}>
                  <div style={{fontWeight:800,fontSize:13,marginBottom:4,color:"#f59e0b"}}>📊 ربحية الأصناف المباعة فعلاً</div>
                  <div style={{fontSize:11,color:MUT,marginBottom:10}}>التكلفة = ج.م {costPerKg.toFixed(2)}/ك</div>
                  {soldItems.map(p=>(
                    <div key={p.id} style={{background:BG,borderRadius:10,padding:"10px 12px",marginBottom:8,border:`1px solid ${p.itemProfit>=0?"#10b98133":"#ef444433"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{fontWeight:800,fontSize:13}}>{p.emoji} {p.name}</span>
                        <span style={{fontWeight:900,fontSize:14,color:p.itemProfit>=0?"#10b981":"#ef4444"}}>{p.itemProfit>=0?"+":""}ج.م {Math.round(p.itemProfit).toLocaleString()}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:4}}>
                        {[["🛒 كمية","×"+p.qty,"#94a3b8"],["💰 إيراد","ج.م "+Math.round(p.revenue),"#f59e0b"],["📉 تكلفة","ج.م "+Math.round(p.cost),"#ef4444"]].map(([l,v,c])=>(
                          <div key={l} style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:9,color:MUT}}>{l}</div></div>
                        ))}
                      </div>
                      <div style={{height:4,borderRadius:2,background:BDR,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.min(100,Math.max(0,p.margin))}%`,background:p.itemProfit>=0?"#10b981":"#ef4444",borderRadius:2}}/>
                      </div>
                      <div style={{fontSize:10,color:MUT,marginTop:2}}>هامش: {p.margin.toFixed(1)}% · سعر: ج.م {p.price}/ك</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ SETTINGS / PRICES ══ — Manager only */}
        {view==="settings"&&(
          <div className="fd">
            <div style={{...css.card,borderColor:"#f59e0b",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:22}}>⚙️</span>
                <div>
                  <div style={{fontWeight:900,fontSize:15,color:"#f59e0b"}}>أسعار الدورة #{currentCycle}</div>
                  <div style={{fontSize:11,color:MUT}}>الأسعار مرتبطة بكل دورة — تتغير مع كل دورة جديدة</div>
                </div>
              </div>
              {/* Cycle switcher for prices */}
              <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
                {Array.from({length:currentCycle},(_, i)=>(
                  <button key={i+1}
                    onClick={()=>mutate(d=>({...d,cycle:i+1}))}
                    style={{...css.sm(currentCycle===i+1?"#d97706":"#1a2035"),border:`1px solid ${currentCycle===i+1?"#d97706":BDR}`,flexShrink:0,padding:"5px 12px"}}>
                    دورة #{i+1}
                  </button>
                ))}
              </div>
            </div>

            <div style={css.card}>
              {products.map((p,i)=>{
                const edited=priceEdits[p.id]!==undefined?priceEdits[p.id]:p.price;
                const changed=priceEdits[p.id]!==undefined&&parseFloat(priceEdits[p.id])!==p.price;
                return(
                  <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:i<products.length-1?`1px solid ${BDR}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                      <span style={{fontSize:18}}>{p.emoji}</span>
                      <div style={{fontWeight:600,fontSize:13,color:TXT}}>{p.name}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {changed&&<span style={{fontSize:10,color:"#f59e0b",fontWeight:700}}>✏️</span>}
                      <div style={{position:"relative"}}>
                        <input
                          type="number"
                          value={edited}
                          onChange={e=>setPriceEdits(prev=>({...prev,[p.id]:e.target.value}))}
                          style={{...css.inp,width:90,marginBottom:0,textAlign:"center",border:`1px solid ${changed?"#f59e0b":BDR}`,padding:"8px 10px",fontSize:14,fontWeight:700,color:changed?"#f59e0b":TXT}}
                        />
                        <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:MUT,pointerEvents:"none"}}>ج.م</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(priceEdits).length>0&&(
              <div className="fd">
                <div style={{background:"#f59e0b11",border:"1px solid #f59e0b44",borderRadius:12,padding:"10px 14px",marginBottom:10,fontSize:12,color:"#f59e0b",fontWeight:700,textAlign:"center"}}>
                  ✏️ لديك {Object.keys(priceEdits).length} تعديل غير محفوظ
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button style={{...css.btn("#374151","#fff"),flex:1,marginTop:0}} onClick={()=>setPriceEdits({})}>↩ إلغاء</button>
                  <button style={{...css.btn("#d97706","#000"),flex:2,marginTop:0}} onClick={savePrices}>💾 حفظ الأسعار</button>
                </div>
              </div>
            )}

            {priceSaved&&(
              <div style={{textAlign:"center",color:"#10b981",fontWeight:700,fontSize:14,padding:"10px",marginTop:4}}>✅ تم حفظ الأسعار بنجاح!</div>
            )}

            <div style={{...css.card,borderColor:"#3b82f644",marginTop:8}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:8,color:"#3b82f6"}}>📋 الأسعار الحالية</div>
              {products.map(p=>(
                <div key={p.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${BDR}`}}>
                  <span style={{color:MUT}}>{p.emoji} {p.name}</span>
                  <span style={{fontWeight:700,color:"#f59e0b"}}>ج.م {p.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function CodeConfirm({order,onConfirm}){
  const [code,setCode]=useState("");
  return(
    <div style={{background:"#10b98111",border:"1px solid #10b98144",borderRadius:10,padding:"12px 14px"}}>
      <div style={{fontWeight:800,fontSize:13,color:"#10b981",marginBottom:6}}>✅ تأكيد التسليم من العميل</div>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:10}}>أدخل الكود اللي أعطاك إياه العميل</div>
      <div style={{display:"flex",gap:8}}>
        <input
          style={{flex:1,background:"#0d1117",border:"1px solid #252d3d",borderRadius:9,padding:"12px",color:"#f1f5f9",fontSize:22,fontWeight:900,fontFamily:"monospace",textAlign:"center",outline:"none",letterSpacing:8,boxSizing:"border-box"}}
          type="number" placeholder="----"
          value={code} onChange={e=>setCode(e.target.value.slice(0,4))}
          onKeyDown={e=>e.key==="Enter"&&code.length===4&&onConfirm(code)}
        />
        <button
          onClick={()=>onConfirm(code)}
          disabled={code.length!==4}
          style={{background:code.length===4?"#10b981":"#1a2035",color:"#fff",border:"none",borderRadius:9,padding:"0 16px",fontWeight:800,fontSize:13,fontFamily:"'Cairo',sans-serif",cursor:code.length===4?"pointer":"default",flexShrink:0}}>
          ✅ تأكيد
        </button>
      </div>
    </div>
  );
}

function DeliveryDateField({form,setForm,css}){
  return(
    <div style={{background:"#1a2035",borderRadius:14,padding:"12px 16px",marginBottom:10,border:"1px solid #252d3d"}}>
      <div style={{fontWeight:800,fontSize:13,color:"#f59e0b",marginBottom:8}}>📅 تاريخ الاستلام</div>
      <input
        style={{...css.inp,marginBottom:0}}
        type="date"
        value={form.deliveryDate||""}
        onChange={e=>setForm(f=>({...f,deliveryDate:e.target.value}))}
      />
      {form.deliveryDate&&(
        <div style={{fontSize:11,color:"#10b981",marginTop:6,fontWeight:700}}>
          ✅ موعد الاستلام: {new Date(form.deliveryDate).toLocaleDateString("ar-EG",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
        </div>
      )}
    </div>
  );
}

function OrderForm({form,setForm,setQty,products,showClient}){
  const BDR="#252d3d",MUT="#94a3b8",BG="#0d1117",CARD="#1a2035";
  const inp={width:"100%",background:BG,border:`1px solid ${BDR}`,borderRadius:10,padding:"10px 14px",color:"#f1f5f9",fontSize:14,fontFamily:"'Cairo',sans-serif",direction:"rtl",boxSizing:"border-box",outline:"none",marginBottom:8};
  const lbl={display:"block",fontSize:11,color:MUT,marginBottom:3,fontWeight:700};
  const itemTotal=products.reduce((s,p)=>s+(p.price*(form.items[p.id]||0)),0);
  return(
    <div>
      <div style={{background:CARD,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${BDR}`}}>
        <div style={{fontWeight:800,fontSize:13,color:"#f59e0b",marginBottom:10}}>👤 {showClient?"بيانات العميل":"راجع البيانات"}</div>
        {[["client",showClient?"الاسم *":"الاسم"],["phone",showClient?"الهاتف *":"الهاتف"],["address",showClient?"العنوان *":"العنوان"],["notes","ملاحظات"]].map(([k,l])=>(
          <div key={k}><label style={lbl}>{l}</label>
            {k==="address"?<textarea style={{...inp,minHeight:55}} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>:<input style={inp} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>}
          </div>
        ))}
      </div>
      <div style={{background:CARD,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${BDR}`}}>
        <div style={{fontWeight:800,fontSize:13,color:"#f59e0b",marginBottom:10}}>🛒 الأصناف</div>
        {products.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,padding:"9px 12px",background:BG,borderRadius:10,border:(form.items[p.id]||0)>0?"1px solid #d97706":`1px solid ${BDR}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>{p.emoji}</span>
              <div><div style={{fontWeight:700,fontSize:12}}>{p.name}</div><div style={{fontSize:11,color:"#f59e0b"}}>ج.م {p.price}</div></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <button onClick={()=>setQty(p.id,(form.items[p.id]||0)-1)} style={{width:28,height:28,borderRadius:7,border:"none",background:"#374151",color:"#fff",fontSize:16,cursor:"pointer",fontWeight:700}}>−</button>
              <span style={{width:22,textAlign:"center",fontWeight:800,fontSize:14}}>{form.items[p.id]||0}</span>
              <button onClick={()=>setQty(p.id,(form.items[p.id]||0)+1)} style={{width:28,height:28,borderRadius:7,border:"none",background:"#d97706",color:"#fff",fontSize:16,cursor:"pointer",fontWeight:700}}>+</button>
            </div>
          </div>
        ))}
        {itemTotal>0&&(
          <div style={{background:"#d9770622",border:"1px solid #d97706",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700}}>الإجمالي</span>
            <span style={{fontWeight:900,fontSize:17,color:"#f59e0b"}}>ج.م {itemTotal}</span>
          </div>
        )}
      </div>
    </div>
  );
}
