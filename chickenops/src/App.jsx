import { useState, useEffect, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────
const PRODUCTS = [
  { id:"whole", name:"دجاجة كاملة", emoji:"🐔", price:120 },
  { id:"legs",  name:"أرجل",        emoji:"🍗", price:45  },
  { id:"fillet",name:"فيليه / صدر", emoji:"🥩", price:65  },
  { id:"wings", name:"أجنحة",       emoji:"🍖", price:35  },
  { id:"plate", name:"طبق / وجبة",  emoji:"🍽️", price:85  },
];
const ST_FLOW   = ["جديد","قيد التحضير","جاهز","في الطريق","تم التسليم","تم الدفع"];
const ST_COLOR  = {"جديد":"#f59e0b","قيد التحضير":"#3b82f6","جاهز":"#8b5cf6","في الطريق":"#f97316","تم التسليم":"#10b981","تم الدفع":"#059669"};
const ST_ICON   = {"جديد":"🆕","قيد التحضير":"👨‍🍳","جاهز":"✅","في الطريق":"🛵","تم التسليم":"📦","تم الدفع":"💰"};
const DELIVERY  = [{name:"طلبات Go",logo:"🛵"},{name:"Rabbit",logo:"🐇"},{name:"Uber Flash",logo:"⚡"},{name:"سائق خاص",logo:"🏍️"}];

const COST_CATS = [
  { id:"chicks",    name:"كتاكيت / تيجار",   emoji:"🐣", hint:"سعر الكتكوت × العدد" },
  { id:"feed",      name:"العلاف",            emoji:"🌾", hint:"كمية الكيلو × السعر" },
  { id:"meds",      name:"الأدوية",           emoji:"💊", hint:"" },
  { id:"vitamins",  name:"الفيتامينات",       emoji:"💉", hint:"" },
  { id:"vet",       name:"الطبيب البيطري",    emoji:"🩺", hint:"" },
  { id:"water",     name:"المياه",            emoji:"💧", hint:"" },
  { id:"electric",  name:"الكهرباء",          emoji:"⚡", hint:"" },
  { id:"cleaning",  name:"النظافة",           emoji:"🧹", hint:"" },
  { id:"labor",     name:"العمالة",           emoji:"👷", hint:"" },
  { id:"packing",   name:"التعبئة والتغليف",  emoji:"📦", hint:"" },
  { id:"transport", name:"النقل",             emoji:"🚚", hint:"" },
  { id:"other",     name:"أخرى",             emoji:"📝", hint:"" },
];

// ─── Roles ───────────────────────────────────────────────────
const ROLES = {
  manager:  { label:"مدير",  emoji:"👑", pin:"1234", color:"#f59e0b",
               tabs:["dashboard","new","orders","clients","costs"],
               canAdvance:ST_FLOW, canPay:true, canDeliver:true, canCosts:true },
  kitchen:  { label:"مطبخ",  emoji:"👨‍🍳", pin:"1111", color:"#3b82f6",
               tabs:["orders"],
               canAdvance:["قيد التحضير","جاهز"], canPay:false, canDeliver:false, canCosts:false },
  delivery: { label:"توصيل", emoji:"🛵", pin:"2222", color:"#f97316",
               tabs:["orders"],
               canAdvance:["في الطريق","تم التسليم"], canPay:false, canDeliver:true, canCosts:false },
  cashier:  { label:"كاشير", emoji:"💳", pin:"3333", color:"#10b981",
               tabs:["orders","dashboard"],
               canAdvance:[], canPay:true, canDeliver:false, canCosts:false },
};

// ─── Storage ─────────────────────────────────────────────────
const KEY = "chickenops-v4";
const EMPTY = { orders:[], clients:[], costs:[], cycle:1, lastUpdated:0 };

async function loadDB() {
  try { const r=await window.storage.get(KEY,true); if(r?.value) return JSON.parse(r.value); } catch(_){}
  return EMPTY;
}
async function saveDB(d) {
  try { await window.storage.set(KEY, JSON.stringify({...d,lastUpdated:Date.now()}), true); } catch(_){}
}

// ─── Helpers ─────────────────────────────────────────────────
let _n = 200;
const uid  = p => `${p}-${++_n}`;
const tot  = items => Object.entries(items||{}).reduce((s,[id,q])=>{ const p=PRODUCTS.find(x=>x.id===id); return s+(p?p.price*(q||0):0); },0);
const ago  = ts => { const m=Math.floor((Date.now()-ts)/60000); if(m<1)return"الآن"; if(m<60)return`${m}د`; return`${Math.floor(m/60)}س`; };
const nxt  = st => { const i=ST_FLOW.indexOf(st); return i<ST_FLOW.length-1?ST_FLOW[i+1]:null; };
const findC= (cs,name,phone) => {
  const n=s=>(s||"").replace(/\s+/g,"").toLowerCase();
  if(phone){ const c=cs.find(c=>n(c.phone)===n(phone)); if(c)return c; }
  if(name){  const c=cs.find(c=>n(c.name).includes(n(name))||n(name).includes(n(c.name))); if(c)return c; }
  return null;
};

async function parseWA(msg) {
  const sys=`Egyptian chicken business order parser. Extract from Arabic/English WhatsApp messages.
Products: whole=دجاجة كاملة, legs=أرجل, fillet=فيليه/صدر, wings=أجنحة, plate=طبق.
Return ONLY JSON no markdown: {"client":"","phone":"","address":"","notes":"","items":{"whole":0,"legs":0,"fillet":0,"wings":0,"plate":0}}`;
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:sys,messages:[{role:"user",content:msg}]})});
  const d=await r.json();
  return JSON.parse((d.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim());
}

// ─── Design tokens ───────────────────────────────────────────
const BG="#0d1117", SURF="#161b27", CARD="#1a2035", BDR="#252d3d", TXT="#f1f5f9", SUB="#64748b", MUT="#94a3b8";

const css = {
  card: { background:CARD, borderRadius:16, padding:"14px 16px", marginBottom:12, border:`1px solid ${BDR}` },
  inp:  { width:"100%", background:BG, border:`1px solid ${BDR}`, borderRadius:10, padding:"10px 14px", color:TXT, fontSize:14, fontFamily:"'Cairo',sans-serif", direction:"rtl", boxSizing:"border-box", outline:"none", marginBottom:8 },
  lbl:  { display:"block", fontSize:11, color:MUT, marginBottom:3, fontWeight:700 },
  btn:  (bg="#d97706",fg="#000")=>({ background:bg, color:fg, border:"none", borderRadius:10, padding:"11px 16px", fontWeight:800, fontSize:14, fontFamily:"'Cairo',sans-serif", cursor:"pointer", width:"100%", marginTop:4 }),
  sm:   bg=>({ background:bg, color:"#fff", border:"none", borderRadius:8, padding:"6px 11px", fontSize:12, fontFamily:"'Cairo',sans-serif", fontWeight:700, cursor:"pointer", margin:2 }),
  badge:st=>({ background:ST_COLOR[st]+"22", color:ST_COLOR[st], border:`1px solid ${ST_COLOR[st]}44`, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, display:"inline-flex", alignItems:"center", gap:4 }),
  stat: c=>({ background:`linear-gradient(135deg,${c}18,${c}05)`, border:`1px solid ${c}28`, borderRadius:14, padding:"12px", flex:1, minWidth:0 }),
};

// ═════════════════════════════════════════════════════════════
export default function App() {
  const [role,setRole]         = useState(null);
  const [pinScreen,setPinScr]  = useState(true);
  const [pinTarget,setPinTgt]  = useState(null);
  const [pinInput,setPinIn]    = useState("");
  const [pinError,setPinErr]   = useState(false);

  const [db,setDb]             = useState(EMPTY);
  const [view,setView]         = useState("orders");
  const [toast,setToast]       = useState(null);
  const [syncing,setSyncing]   = useState(false);
  const [lastSync,setLastSync] = useState(null);

  // Order form
  const EF = { client:"", phone:"", address:"", notes:"", items:{whole:0,legs:0,fillet:0,wings:0,plate:0} };
  const [form,setForm]         = useState(EF);
  const [waMsg,setWaMsg]       = useState("");
  const [parsing,setParsing]   = useState(false);
  const [parsed,setParsed]     = useState(null);
  const [matchedC,setMatchedC] = useState(null);
  const [oMode,setOMode]       = useState("whatsapp");

  // Cost form
  const EC = { cat:"chicks", label:"", amount:"", qty:"", unitPrice:"", notes:"" };
  const [costForm,setCostForm] = useState(EC);
  const [showCostForm,setShowCostForm] = useState(false);
  const [costFilter,setCostFilter]     = useState("all");

  const [expOrder,setExpOrder]   = useState(null);
  const [expClient,setExpClient] = useState(null);
  const [fSt,setFSt]             = useState("الكل");
  const [cSearch,setCSearch]     = useState("");

  const ro = role ? ROLES[role] : null;
  const T  = (msg,type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  // Sync
  const sync = useCallback(async (silent=false) => {
    if(!silent) setSyncing(true);
    const d=await loadDB(); setDb(d); setLastSync(Date.now());
    if(!silent) setSyncing(false);
  },[]);

  useEffect(()=>{ sync(); },[]);
  useEffect(()=>{ const id=setInterval(()=>sync(true),10000); return()=>clearInterval(id); },[sync]);

  const mutate = async fn => {
    const fresh=await loadDB(), next=fn(fresh);
    setDb(next); await saveDB(next);
  };

  // ── PIN ──
  const pickRole = rk => { setPinTgt(rk); setPinIn(""); setPinErr(false); };
  const digit    = d  => {
    const p=pinInput+d; setPinIn(p);
    if(p.length===4){
      if(p===ROLES[pinTarget].pin){ setRole(pinTarget); setPinScr(false); setView(ROLES[pinTarget].tabs[0]); }
      else { setPinErr(true); setTimeout(()=>{ setPinIn(""); setPinErr(false); },700); }
    }
  };

  // ── Orders ──
  const advance = async id => {
    await mutate(d=>({...d,orders:d.orders.map(o=>{ if(o.id!==id)return o; const i=ST_FLOW.indexOf(o.status); return i<ST_FLOW.length-1?{...o,status:ST_FLOW[i+1]}:o; })}));
    T("✅ تم التحديث");
  };
  const assignDel = async (id,svc) => { await mutate(d=>({...d,orders:d.orders.map(o=>o.id===id?{...o,deliveryService:svc}:o)})); T(`🛵 ${svc}`); };
  const pay       = async (id,m)   => { await mutate(d=>({...d,orders:d.orders.map(o=>o.id===id?{...o,paymentMethod:m,status:"تم الدفع"}:o)})); setExpOrder(null); T("💰 تم الدفع"); };

  const handleWA = async () => {
    if(!waMsg.trim()){ T("الصق رسالة أولاً","err"); return; }
    setParsing(true); setMatchedC(null); setParsed(null);
    try {
      const p=await parseWA(waMsg);
      const ex=findC(db.clients,p.client,p.phone);
      if(ex){ setMatchedC(ex); setForm({client:ex.name,phone:ex.phone,address:p.address||ex.address,notes:p.notes||ex.notes,items:{whole:0,legs:0,fillet:0,wings:0,plate:0,...p.items}}); T(`🎉 عميل معروف: ${ex.name}`); }
      else { setForm({client:p.client||"",phone:p.phone||"",address:p.address||"",notes:p.notes||"",items:{whole:0,legs:0,fillet:0,wings:0,plate:0,...p.items}}); T("✅ عميل جديد"); }
      setParsed(p);
    } catch(e){ T("تعذر التحليل","err"); }
    setParsing(false);
  };

  const submit = async () => {
    if(!form.client.trim()||!form.phone.trim()||!form.address.trim()){ T("ملء الاسم والهاتف والعنوان مطلوب","err"); return; }
    if(Object.values(form.items).every(q=>!q||q===0)){ T("أضف صنفاً واحداً","err"); return; }
    const total=tot(form.items);
    await mutate(d=>{
      let cl=d.clients; let cid;
      const ex=findC(cl,form.client,form.phone);
      if(ex){ cid=ex.id; cl=cl.map(c=>c.id===ex.id?{...c,address:form.address,notes:form.notes,totalOrders:(c.totalOrders||0)+1,totalSpent:(c.totalSpent||0)+total}:c); }
      else { cid=uid("C"); cl=[...cl,{id:cid,name:form.client,phone:form.phone,address:form.address,notes:form.notes,totalOrders:1,totalSpent:total}]; }
      const o={id:uid("ORD"),clientId:cid,...form,total,status:"جديد",createdAt:Date.now(),deliveryService:null,paymentMethod:null,createdBy:ro?.label||""};
      return {...d,clients:cl,orders:[o,...d.orders]};
    });
    setForm(EF); setWaMsg(""); setParsed(null); setMatchedC(null);
    setView("orders"); T("✅ تم إنشاء الطلب");
  };

  const setQty = (id,v) => { const q=Math.max(0,parseInt(v)||0); setForm(f=>({...f,items:{...f.items,[id]:q}})); };

  // ── Costs ──
  const costTotal = c => {
    if(c.qty && c.unitPrice) return (parseFloat(c.qty)||0)*(parseFloat(c.unitPrice)||0);
    return parseFloat(c.amount)||0;
  };

  const submitCost = async () => {
    const amount = costTotal(costForm);
    if(!amount||amount<=0){ T("أدخل المبلغ","err"); return; }
    const catObj = COST_CATS.find(x=>x.id===costForm.cat);
    await mutate(d=>({
      ...d,
      costs:[...( d.costs||[]),{
        id:uid("CST"), cat:costForm.cat, catName:catObj?.name||costForm.cat,
        catEmoji:catObj?.emoji||"📝",
        label:costForm.label, amount, qty:costForm.qty, unitPrice:costForm.unitPrice,
        notes:costForm.notes, date:Date.now(), cycle:d.cycle||1,
      }]
    }));
    setCostForm(EC); setShowCostForm(false); T("✅ تم تسجيل التكلفة");
  };

  // ── Finance calculations ──
  const currentCycle = db.cycle||1;
  const cycleCosts   = (db.costs||[]).filter(c=>(costFilter==="all"||c.cycle===parseInt(costFilter)));
  const totalCosts   = cycleCosts.reduce((s,c)=>s+(c.amount||0),0);
  const revenue      = db.orders.filter(o=>o.status==="تم الدفع").reduce((s,o)=>s+o.total,0);
  const pending      = db.orders.filter(o=>o.status!=="تم الدفع").reduce((s,o)=>s+o.total,0);
  const profit       = revenue - totalCosts;
  const profitPerBird= profit/500;

  // Cost breakdown by category
  const costByCat = COST_CATS.map(cat=>({
    ...cat,
    total: cycleCosts.filter(c=>c.cat===cat.id).reduce((s,c)=>s+(c.amount||0),0),
    entries: cycleCosts.filter(c=>c.cat===cat.id),
  })).filter(c=>c.total>0);

  const stats = {
    total: db.orders.length,
    active: db.orders.filter(o=>!["تم التسليم","تم الدفع"].includes(o.status)).length,
    revenue, pending,
    clients: db.clients.length,
  };

  // ── Login screen ──
  if(pinScreen) return (
    <div style={{ position:"fixed",inset:0,background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cairo',sans-serif",direction:"rtl" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box}body{margin:0}`}</style>
      {!pinTarget ? (
        <div style={{ width:"100%",maxWidth:360,padding:24 }}>
          <div style={{ textAlign:"center",marginBottom:32 }}>
            <div style={{ fontSize:56,marginBottom:8 }}>🐔</div>
            <div style={{ fontWeight:900,fontSize:26,color:TXT }}>إدارة الدواجن</div>
            <div style={{ fontSize:13,color:SUB,marginTop:6 }}>اختر دورك للدخول</div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            {Object.entries(ROLES).map(([k,r])=>(
              <button key={k} onClick={()=>pickRole(k)} style={{ background:CARD,border:`2px solid ${r.color}33`,borderRadius:18,padding:"22px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:10,fontFamily:"'Cairo',sans-serif" }}>
                <div style={{ fontSize:38 }}>{r.emoji}</div>
                <div style={{ fontWeight:900,fontSize:16,color:r.color }}>{r.label}</div>
                <div style={{ fontSize:10,color:SUB,letterSpacing:4 }}>● ● ● ●</div>
              </button>
            ))}
          </div>
        </div>
      ):(
        <div style={{ width:"100%",maxWidth:300,padding:24,fontFamily:"'Cairo',sans-serif",direction:"rtl" }}>
          <button onClick={()=>setPinTgt(null)} style={{ background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,fontFamily:"'Cairo',sans-serif",marginBottom:28 }}>← رجوع</button>
          <div style={{ textAlign:"center",marginBottom:28 }}>
            <div style={{ fontSize:44 }}>{ROLES[pinTarget].emoji}</div>
            <div style={{ fontWeight:900,fontSize:22,color:ROLES[pinTarget].color,marginTop:10 }}>{ROLES[pinTarget].label}</div>
            <div style={{ fontSize:13,color:SUB,marginTop:6 }}>أدخل رقم PIN</div>
          </div>
          <div style={{ display:"flex",justifyContent:"center",gap:14,marginBottom:30 }}>
            {[0,1,2,3].map(i=>(
              <div key={i} style={{ width:16,height:16,borderRadius:"50%",background:pinInput.length>i?(pinError?"#ef4444":ROLES[pinTarget].color):BDR,transition:"background .15s" }}/>
            ))}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
            {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=>(
              <button key={i} onClick={()=>{ if(d==="⌫")setPinIn(p=>p.slice(0,-1)); else if(d!=="")digit(String(d)); }}
                style={{ background:d===""?"transparent":CARD,border:`1px solid ${d===""?"transparent":BDR}`,borderRadius:12,padding:"16px",fontSize:20,fontWeight:700,color:TXT,cursor:d===""?"default":"pointer",fontFamily:"'Cairo',sans-serif",opacity:d===""?0:1 }}>
                {d}
              </button>
            ))}
          </div>
          {pinError&&<div style={{ textAlign:"center",color:"#ef4444",marginTop:14,fontWeight:700,fontSize:13 }}>PIN غلط</div>}
        </div>
      )}
    </div>
  );

  // ── Main app ──
  const tabs = ro.tabs;
  const tabMeta = { dashboard:["📊","الرئيسية"], new:["💬","طلب جديد"], orders:["📋","الطلبات"], clients:["👥","العملاء"], costs:["💰","التكاليف"] };
  const filtOrders  = fSt==="الكل"?db.orders:db.orders.filter(o=>o.status===fSt);
  const filtClients = db.clients.filter(c=>!cSearch||c.name?.includes(cSearch)||c.phone?.includes(cSearch));

  return (
    <div style={{ fontFamily:"'Cairo',sans-serif",minHeight:"100vh",background:BG,color:TXT,direction:"rtl",maxWidth:480,margin:"0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box}body{margin:0;background:${BG}}input::placeholder,textarea::placeholder{color:#374151}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#374151;border-radius:4px}.fd{animation:fd .25s ease}@keyframes fd{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.pl{animation:pl 1.2s infinite}@keyframes pl{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {toast&&<div style={{ position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?"#dc2626":"#059669",color:"#fff",borderRadius:12,padding:"10px 22px",fontWeight:700,fontSize:14,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,.5)",fontFamily:"'Cairo',sans-serif",whiteSpace:"nowrap" }}>{toast.msg}</div>}

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#b45309,#d97706 60%,#f59e0b)",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 24px rgba(217,119,6,.5)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <span style={{ fontSize:28 }}>🐔</span>
          <div>
            <div style={{ fontWeight:900,fontSize:18,color:"#fff" }}>إدارة الدواجن</div>
            <div style={{ fontSize:11,color:"rgba(255,255,255,.8)" }}>دورة #{currentCycle} · ٥٠٠ طائر</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <div style={{ background:`${ro.color}22`,border:`1px solid ${ro.color}55`,borderRadius:8,padding:"4px 10px",display:"flex",alignItems:"center",gap:5 }}>
            <span style={{ fontSize:13 }}>{ro.emoji}</span>
            <span style={{ fontSize:12,fontWeight:700,color:ro.color }}>{ro.label}</span>
          </div>
          <button onClick={()=>sync()} style={{ background:"rgba(0,0,0,.25)",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#fff",fontSize:16 }}>{syncing?"⟳":"⟳"}</button>
          <button onClick={()=>{setRole(null);setPinScr(true);setPinTgt(null);}} style={{ background:"rgba(0,0,0,.25)",border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer",color:"#fff",fontSize:12,fontFamily:"'Cairo',sans-serif" }}>خروج</button>
        </div>
      </div>

      {lastSync&&<div style={{ background:SURF,padding:"3px 16px",fontSize:10,color:SUB,display:"flex",justifyContent:"space-between" }}><span>آخر مزامنة: {ago(lastSync)}</span><span>📱 مزامنة تلقائية كل ١٠ث</span></div>}

      {/* Nav */}
      <div style={{ display:"flex",background:"#0f1420",borderBottom:`1px solid ${BDR}`,position:"sticky",top:0,zIndex:100 }}>
        {tabs.map(v=>{
          const [ic,lb]=tabMeta[v];
          return <button key={v} onClick={()=>setView(v)} style={{ flex:1,padding:"9px 2px",border:"none",background:"none",color:view===v?ro.color:SUB,fontWeight:view===v?800:400,borderBottom:view===v?`3px solid ${ro.color}`:"3px solid transparent",cursor:"pointer",fontSize:10,fontFamily:"'Cairo',sans-serif" }}><div style={{ fontSize:14 }}>{ic}</div><div>{lb}</div></button>;
        })}
      </div>

      <div style={{ padding:16,paddingBottom:40 }}>

        {/* ══ DASHBOARD ══ */}
        {view==="dashboard"&&(
          <div className="fd">
            <div style={{ display:"flex",gap:8,marginBottom:10 }}>
              <div style={css.stat("#3b82f6")}><div style={{ fontSize:20,fontWeight:900,color:"#3b82f6" }}>{stats.total}</div><div style={{ fontSize:11,color:MUT }}>📦 طلبات</div></div>
              <div style={css.stat("#f59e0b")}><div style={{ fontSize:20,fontWeight:900,color:"#f59e0b" }}>{stats.active}</div><div style={{ fontSize:11,color:MUT }}>🔥 نشطة</div></div>
              <div style={css.stat("#a78bfa")}><div style={{ fontSize:20,fontWeight:900,color:"#a78bfa" }}>{stats.clients}</div><div style={{ fontSize:11,color:MUT }}>👥 عملاء</div></div>
            </div>
            {(role==="manager"||role==="cashier")&&(
              <div style={{ display:"flex",gap:8,marginBottom:10 }}>
                <div style={css.stat("#10b981")}><div style={{ fontSize:15,fontWeight:900,color:"#10b981" }}>ج.م {stats.revenue}</div><div style={{ fontSize:11,color:MUT }}>💰 إيراد</div></div>
                <div style={css.stat("#f97316")}><div style={{ fontSize:15,fontWeight:900,color:"#f97316" }}>ج.م {stats.pending}</div><div style={{ fontSize:11,color:MUT }}>⏳ معلق</div></div>
                <div style={css.stat(profit>=0?"#10b981":"#ef4444")}><div style={{ fontSize:15,fontWeight:900,color:profit>=0?"#10b981":"#ef4444" }}>ج.م {profit}</div><div style={{ fontSize:11,color:MUT }}>{profit>=0?"📈 ربح":"📉 خسارة"}</div></div>
              </div>
            )}
            <div style={css.card}>
              <div style={{ fontWeight:800,fontSize:13,marginBottom:10 }}>⚡ خط الإنتاج</div>
              {ST_FLOW.slice(0,5).map(st=>{ const n=db.orders.filter(o=>o.status===st).length; return(
                <div key={st} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:7 }}><span style={{ fontSize:13 }}>{ST_ICON[st]}</span><span style={{ fontSize:12,color:"#cbd5e1" }}>{st}</span></div>
                  <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                    <div style={{ height:5,borderRadius:3,background:ST_COLOR[st]+"33",width:70,overflow:"hidden" }}><div style={{ height:"100%",width:`${Math.min(100,n*30)}%`,background:ST_COLOR[st],borderRadius:3 }}/></div>
                    <span style={{ fontSize:12,fontWeight:700,color:ST_COLOR[st],minWidth:16,textAlign:"center" }}>{n}</span>
                  </div>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* ══ NEW ORDER ══ */}
        {view==="new"&&(
          <div className="fd">
            <div style={{ display:"flex",background:CARD,borderRadius:12,padding:4,marginBottom:12,border:`1px solid ${BDR}` }}>
              {[["whatsapp","💬 واتساب"],["manual","✍️ يدوي"]].map(([m,l])=>(
                <button key={m} onClick={()=>setOMode(m)} style={{ flex:1,padding:"9px",border:"none",borderRadius:10,background:oMode===m?"#d97706":"transparent",color:oMode===m?"#000":MUT,fontWeight:800,fontSize:13,fontFamily:"'Cairo',sans-serif",cursor:"pointer" }}>{l}</button>
              ))}
            </div>

            {oMode==="whatsapp"&&!parsed&&(
              <div style={{ ...css.card,borderColor:"#25D36644" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}><span style={{ fontSize:22 }}>💬</span><div style={{ fontWeight:800,fontSize:14,color:"#25D366" }}>الصق رسالة واتساب</div></div>
                <textarea style={{ ...css.inp,minHeight:100,resize:"vertical",borderColor:"#25D36644" }} placeholder={"مثال:\nمحمد علي، دجاجتين وأجنحة\nمدينة نصر، 01001234567"} value={waMsg} onChange={e=>setWaMsg(e.target.value)}/>
                <button style={{ ...css.btn("#25D366","#fff"),opacity:parsing?.7:1 }} onClick={handleWA} disabled={parsing}>
                  {parsing?<span className="pl">⏳ جاري التحليل...</span>:"🤖 تحليل الرسالة"}
                </button>
              </div>
            )}

            {oMode==="whatsapp"&&parsed&&(
              <div className="fd">
                <div style={{ ...css.card,borderColor:matchedC?"#10b981":"#3b82f6",marginBottom:10 }}>
                  {matchedC
                    ?<div style={{ display:"flex",alignItems:"center",gap:10 }}><span style={{ fontSize:26 }}>🎉</span><div><div style={{ fontWeight:900,fontSize:14,color:"#10b981" }}>عميل معروف!</div><div style={{ fontSize:12,color:MUT }}>{matchedC.name} — {matchedC.totalOrders} طلبات</div></div></div>
                    :<div style={{ display:"flex",alignItems:"center",gap:8 }}><span>🆕</span><div style={{ fontWeight:700,color:"#3b82f6",fontSize:13 }}>عميل جديد — سيُحفظ تلقائياً</div></div>
                  }
                </div>
                <OrderForm form={form} setForm={setForm} setQty={setQty} css={css}/>
                <div style={{ display:"flex",gap:8 }}>
                  <button style={{ ...css.btn("#374151","#fff"),flex:1,marginTop:0 }} onClick={()=>{setParsed(null);setMatchedC(null);setWaMsg("");}}>↩ رجوع</button>
                  <button style={{ ...css.btn("#d97706","#000"),flex:2,marginTop:0 }} onClick={submit}>✅ تأكيد</button>
                </div>
              </div>
            )}

            {oMode==="manual"&&(
              <div>
                <OrderForm form={form} setForm={setForm} setQty={setQty} css={css} showClient/>
                <button style={css.btn("#d97706","#000")} onClick={submit}>✅ تأكيد الطلب</button>
              </div>
            )}
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {view==="orders"&&(
          <div className="fd">
            <div style={{ display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:4 }}>
              {["الكل",...ST_FLOW].map(st=>(
                <button key={st} onClick={()=>setFSt(st)} style={{ ...css.sm(fSt===st?(ST_COLOR[st]||"#d97706"):"#1a2035"),border:`1px solid ${fSt===st?(ST_COLOR[st]||"#d97706"):BDR}`,whiteSpace:"nowrap",flexShrink:0,padding:"5px 12px" }}>
                  {ST_ICON[st]||"📋"} {st}
                </button>
              ))}
            </div>
            {filtOrders.length===0&&<div style={{ textAlign:"center",padding:"40px 20px",color:SUB }}><div style={{ fontSize:48 }}>📭</div><div style={{ marginTop:8,fontWeight:600 }}>لا توجد طلبات</div></div>}
            {filtOrders.map(order=>(
              <div key={order.id} style={{ ...css.card,borderColor:expOrder===order.id?ST_COLOR[order.status]:BDR,cursor:"pointer" }} onClick={()=>setExpOrder(expOrder===order.id?null:order.id)}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontWeight:900,fontSize:14 }}>{order.client}</div>
                    <div style={{ fontSize:11,color:SUB,marginTop:2 }}>{order.id} · {ago(order.createdAt)}</div>
                    {order.deliveryService&&<div style={{ fontSize:11,color:"#10b981",marginTop:2 }}>🛵 {order.deliveryService}</div>}
                    {order.createdBy&&<div style={{ fontSize:10,color:SUB,marginTop:1 }}>بواسطة: {order.createdBy}</div>}
                  </div>
                  <div style={{ textAlign:"left" }}>
                    <span style={css.badge(order.status)}>{ST_ICON[order.status]} {order.status}</span>
                    <div style={{ fontSize:15,fontWeight:900,color:"#f59e0b",marginTop:4,textAlign:"center" }}>ج.م {order.total}</div>
                  </div>
                </div>
                {expOrder===order.id&&(
                  <div style={{ marginTop:12,borderTop:`1px solid ${BDR}`,paddingTop:12 }}>
                    <div style={{ fontSize:12,color:MUT,lineHeight:1.9,marginBottom:10 }}>📞 {order.phone}<br/>📍 {order.address}{order.notes&&<><br/>📝 {order.notes}</>}</div>
                    <div style={{ background:BG,borderRadius:10,padding:"10px 12px",marginBottom:12 }}>
                      {Object.entries(order.items||{}).filter(([,q])=>q>0).map(([id,qty])=>{ const p=PRODUCTS.find(x=>x.id===id); return p?(<div key={id} style={{ display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",borderBottom:`1px solid ${SURF}` }}><span>{p.emoji} {p.name} × {qty}</span><span style={{ color:"#f59e0b",fontWeight:700 }}>ج.م {p.price*qty}</span></div>):null; })}
                    </div>
                    {nxt(order.status)&&ro.canAdvance.includes(nxt(order.status))&&order.status!=="تم الدفع"&&(
                      <button onClick={e=>{e.stopPropagation();advance(order.id);}} style={css.btn(ST_COLOR[nxt(order.status)],"#fff")}>{ST_ICON[nxt(order.status)]} تحديث إلى: {nxt(order.status)}</button>
                    )}
                    {ro.canDeliver&&!order.deliveryService&&order.status!=="تم الدفع"&&(
                      <div style={{ marginTop:10 }}>
                        <div style={{ fontSize:11,color:MUT,marginBottom:6,fontWeight:700 }}>🛵 تعيين التوصيل</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{DELIVERY.map(sv=>(<button key={sv.name} onClick={e=>{e.stopPropagation();assignDel(order.id,sv.name);}} style={css.sm("#1e3a5f")}>{sv.logo} {sv.name}</button>))}</div>
                      </div>
                    )}
                    {ro.canPay&&order.status==="تم التسليم"&&!order.paymentMethod&&(
                      <div style={{ marginTop:10 }}>
                        <div style={{ fontSize:11,color:MUT,marginBottom:6,fontWeight:700 }}>💳 تسجيل الدفع</div>
                        <div style={{ display:"flex",gap:6 }}>{["كاش","فودافون كاش","انستاباي"].map(m=>(<button key={m} onClick={e=>{e.stopPropagation();pay(order.id,m);}} style={css.sm("#059669")}>{m}</button>))}</div>
                      </div>
                    )}
                    {order.paymentMethod&&<div style={{ marginTop:8,fontSize:13,color:"#10b981",fontWeight:700 }}>✅ تم الدفع بـ {order.paymentMethod}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ CLIENTS ══ */}
        {view==="clients"&&(
          <div className="fd">
            <input style={{ ...css.inp,marginBottom:12 }} placeholder="🔍 ابحث بالاسم أو الرقم..." value={cSearch} onChange={e=>setCSearch(e.target.value)}/>
            {filtClients.map(c=>(
              <div key={c.id} style={{ ...css.card,borderColor:expClient===c.id?"#a78bfa":BDR,cursor:"pointer" }} onClick={()=>setExpClient(expClient===c.id?null:c.id)}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:"50%",background:"#a78bfa22",border:"2px solid #a78bfa55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#a78bfa" }}>{(c.name||"?").charAt(0)}</div>
                    <div><div style={{ fontWeight:800,fontSize:14 }}>{c.name}</div><div style={{ fontSize:12,color:SUB }}>{c.phone}</div></div>
                  </div>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:12,color:"#a78bfa",fontWeight:700 }}>{c.totalOrders} طلبات</div>
                    <div style={{ fontSize:12,color:"#10b981",fontWeight:700 }}>ج.م {c.totalSpent}</div>
                  </div>
                </div>
                {expClient===c.id&&(
                  <div style={{ marginTop:12,borderTop:`1px solid ${BDR}`,paddingTop:12 }}>
                    <div style={{ fontSize:13,color:MUT,lineHeight:1.8,marginBottom:10 }}>📍 {c.address}{c.notes&&<><br/>📝 {c.notes}</>}</div>
                    {tabs.includes("new")&&<button onClick={e=>{e.stopPropagation();setForm(f=>({...f,client:c.name,phone:c.phone,address:c.address,notes:c.notes}));setMatchedC(c);setOMode("manual");setView("new");T(`📋 ${c.name}`);}} style={{ ...css.btn("#d97706","#000"),marginTop:0 }}>➕ طلب جديد</button>}
                    <div style={{ marginTop:10 }}>
                      <div style={{ fontSize:11,color:SUB,marginBottom:6,fontWeight:700 }}>آخر الطلبات</div>
                      {db.orders.filter(o=>o.clientId===c.id).slice(0,3).map(o=>(
                        <div key={o.id} style={{ display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${SURF}` }}>
                          <span style={{ color:SUB }}>{o.id} · {ago(o.createdAt)}</span>
                          <span style={css.badge(o.status)}>{o.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ COSTS ══ — Manager only ══ */}
        {view==="costs"&&(
          <div className="fd">

            {/* Profit summary card */}
            <div style={{ background:"linear-gradient(135deg,#1a2035,#0f1824)",border:`2px solid ${profit>=0?"#10b981":"#ef4444"}44`,borderRadius:18,padding:18,marginBottom:14 }}>
              <div style={{ fontWeight:900,fontSize:15,marginBottom:14,color:TXT }}>📊 ملخص الدورة #{currentCycle}</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
                {[
                  ["💰 إيراد محصل", revenue, "#10b981"],
                  ["⏳ إيراد متوقع", pending, "#f59e0b"],
                  ["📉 إجمالي التكاليف", totalCosts, "#ef4444"],
                  [profit>=0?"📈 صافي الربح":"📉 صافي الخسارة", Math.abs(profit), profit>=0?"#10b981":"#ef4444"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:BG,borderRadius:12,padding:"12px 10px",textAlign:"center" }}>
                    <div style={{ fontSize:18,fontWeight:900,color:c }}>ج.م {v.toLocaleString()}</div>
                    <div style={{ fontSize:11,color:MUT,marginTop:3 }}>{l}</div>
                  </div>
                ))}
              </div>
              {/* Profit per bird */}
              <div style={{ background:BG,borderRadius:12,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:13,color:MUT }}>🐔 ربح / خسارة لكل طائر (٥٠٠ طائر)</span>
                <span style={{ fontWeight:900,fontSize:16,color:profitPerBird>=0?"#10b981":"#ef4444" }}>ج.م {profitPerBird.toFixed(2)}</span>
              </div>
              {/* Progress bar */}
              {totalCosts>0&&revenue>0&&(
                <div style={{ marginTop:12 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:MUT,marginBottom:4 }}>
                    <span>تغطية التكاليف</span>
                    <span>{Math.round((revenue/totalCosts)*100)}%</span>
                  </div>
                  <div style={{ height:8,borderRadius:4,background:BDR,overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${Math.min(100,(revenue/totalCosts)*100)}%`,background:revenue>=totalCosts?"#10b981":"#f59e0b",borderRadius:4,transition:"width .5s" }}/>
                  </div>
                </div>
              )}
            </div>

            {/* Add cost button */}
            {!showCostForm&&(
              <button style={css.btn("#d97706","#000")} onClick={()=>setShowCostForm(true)}>➕ تسجيل تكلفة جديدة</button>
            )}

            {/* Cost form */}
            {showCostForm&&(
              <div style={{ ...css.card,borderColor:"#d97706",marginBottom:14 }}>
                <div style={{ fontWeight:800,fontSize:14,color:"#f59e0b",marginBottom:12 }}>📝 تسجيل تكلفة</div>

                <label style={css.lbl}>نوع التكلفة</label>
                <select style={{ ...css.inp,marginBottom:10 }} value={costForm.cat} onChange={e=>setCostForm(f=>({...f,cat:e.target.value}))}>
                  {COST_CATS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>

                <label style={css.lbl}>وصف (اختياري)</label>
                <input style={css.inp} placeholder="مثال: علاف أسبوع ٣" value={costForm.label} onChange={e=>setCostForm(f=>({...f,label:e.target.value}))}/>

                {/* For feed & chicks: qty × price */}
                {(costForm.cat==="feed"||costForm.cat==="chicks")&&(
                  <div style={{ display:"flex",gap:8 }}>
                    <div style={{ flex:1 }}>
                      <label style={css.lbl}>{costForm.cat==="feed"?"الكمية (كجم)":"عدد الكتاكيت"}</label>
                      <input style={css.inp} type="number" placeholder="0" value={costForm.qty} onChange={e=>setCostForm(f=>({...f,qty:e.target.value}))}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <label style={css.lbl}>{costForm.cat==="feed"?"سعر الكيلو":"سعر الكتكوت"}</label>
                      <input style={css.inp} type="number" placeholder="0" value={costForm.unitPrice} onChange={e=>setCostForm(f=>({...f,unitPrice:e.target.value}))}/>
                    </div>
                  </div>
                )}
                {costForm.cat==="feed"&&costForm.qty&&costForm.unitPrice&&(
                  <div style={{ background:BG,borderRadius:8,padding:"8px 12px",marginBottom:8,fontSize:13,color:"#f59e0b",fontWeight:700 }}>
                    الإجمالي: ج.م {(parseFloat(costForm.qty||0)*parseFloat(costForm.unitPrice||0)).toLocaleString()}
                  </div>
                )}

                {(costForm.cat!=="feed"&&costForm.cat!=="chicks")&&(
                  <>
                    <label style={css.lbl}>المبلغ (ج.م)</label>
                    <input style={css.inp} type="number" placeholder="0" value={costForm.amount} onChange={e=>setCostForm(f=>({...f,amount:e.target.value}))}/>
                  </>
                )}

                <label style={css.lbl}>ملاحظات</label>
                <input style={css.inp} placeholder="..." value={costForm.notes} onChange={e=>setCostForm(f=>({...f,notes:e.target.value}))}/>

                <div style={{ display:"flex",gap:8 }}>
                  <button style={{ ...css.btn("#374151","#fff"),flex:1,marginTop:0 }} onClick={()=>{setShowCostForm(false);setCostForm(EC);}}>إلغاء</button>
                  <button style={{ ...css.btn("#d97706","#000"),flex:2,marginTop:0 }} onClick={submitCost}>✅ حفظ التكلفة</button>
                </div>
              </div>
            )}

            {/* Cost breakdown */}
            {costByCat.length>0&&(
              <div style={css.card}>
                <div style={{ fontWeight:800,fontSize:13,marginBottom:12 }}>📋 تفصيل التكاليف</div>
                {costByCat.map(cat=>(
                  <div key={cat.id} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <span style={{ fontSize:18 }}>{cat.emoji}</span>
                        <span style={{ fontWeight:700,fontSize:13 }}>{cat.name}</span>
                      </div>
                      <span style={{ fontWeight:900,fontSize:14,color:"#ef4444" }}>ج.م {cat.total.toLocaleString()}</span>
                    </div>
                    {/* % of total */}
                    <div style={{ height:5,borderRadius:3,background:BDR,overflow:"hidden",marginBottom:6 }}>
                      <div style={{ height:"100%",width:`${totalCosts>0?(cat.total/totalCosts*100):0}%`,background:"#ef4444",borderRadius:3 }}/>
                    </div>
                    {/* Entries */}
                    {cat.entries.map(e=>(
                      <div key={e.id} style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:MUT,padding:"3px 8px" }}>
                        <span>{e.label||cat.name}{e.qty?` · ${e.qty}${cat.id==="feed"?"كجم":""}×${e.unitPrice}ج.م`:""}</span>
                        <span style={{ color:"#f87171",fontWeight:700 }}>ج.م {e.amount}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ borderTop:`1px solid ${BDR}`,paddingTop:10,display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:14 }}>
                  <span>إجمالي التكاليف</span>
                  <span style={{ color:"#ef4444" }}>ج.م {totalCosts.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* New cycle button */}
            <div style={{ ...css.card,borderColor:"#f59e0b44",marginTop:8 }}>
              <div style={{ fontWeight:800,fontSize:13,marginBottom:8 }}>🔄 إدارة الدورة</div>
              <div style={{ fontSize:12,color:MUT,marginBottom:10 }}>بدء دورة جديدة يحتفظ بسجل العملاء والطلبات ويصفر تكاليف الدورة الجديدة</div>
              <button style={css.btn("#374151","#fff")} onClick={async()=>{
                if(!window.confirm(`بدء دورة جديدة؟ (الدورة الحالية #${currentCycle})`))return;
                await mutate(d=>({...d,cycle:(d.cycle||1)+1}));
                T(`✅ تم بدء الدورة #${currentCycle+1}`);
              }}>🔄 بدء دورة جديدة #{currentCycle+1}</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Order Form ───────────────────────────────────────────────
function OrderForm({ form, setForm, setQty, css, showClient }) {
  const BDR="#252d3d", MUT="#94a3b8", BG="#0d1117", CARD="#1a2035";
  return (
    <div>
      {showClient&&(
        <div style={{ background:CARD,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${BDR}` }}>
          <div style={{ fontWeight:800,fontSize:14,color:"#f59e0b",marginBottom:10 }}>👤 بيانات العميل</div>
          {[["client","الاسم *"],["phone","الهاتف *"],["address","العنوان *"],["notes","ملاحظات"]].map(([k,l])=>(
            <div key={k}><label style={css.lbl}>{l}</label>
              {k==="address"?<textarea style={{ ...css.inp,minHeight:55 }} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                :<input style={css.inp} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>}
            </div>
          ))}
        </div>
      )}
      {!showClient&&(
        <div style={{ background:CARD,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${BDR}` }}>
          <div style={{ fontWeight:700,fontSize:13,color:"#f59e0b",marginBottom:10 }}>👤 راجع البيانات</div>
          {[["client","الاسم"],["phone","الهاتف"],["address","العنوان"],["notes","ملاحظات"]].map(([k,l])=>(
            <div key={k}><label style={css.lbl}>{l}</label>
              {k==="address"?<textarea style={{ ...css.inp,minHeight:50 }} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                :<input style={css.inp} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>}
            </div>
          ))}
        </div>
      )}
      <div style={{ background:CARD,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${BDR}` }}>
        <div style={{ fontWeight:800,fontSize:13,color:"#f59e0b",marginBottom:10 }}>🛒 الأصناف</div>
        {[{id:"whole",name:"دجاجة كاملة",emoji:"🐔",price:120},{id:"legs",name:"أرجل",emoji:"🍗",price:45},{id:"fillet",name:"فيليه / صدر",emoji:"🥩",price:65},{id:"wings",name:"أجنحة",emoji:"🍖",price:35},{id:"plate",name:"طبق / وجبة",emoji:"🍽️",price:85}].map(p=>(
          <div key={p.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9,padding:"9px 12px",background:BG,borderRadius:10,border:(form.items[p.id]||0)>0?"1px solid #d97706":`1px solid ${BDR}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:20 }}>{p.emoji}</span>
              <div><div style={{ fontWeight:700,fontSize:13 }}>{p.name}</div><div style={{ fontSize:11,color:"#f59e0b" }}>ج.م {p.price}</div></div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <button onClick={()=>setQty(p.id,(form.items[p.id]||0)-1)} style={{ width:29,height:29,borderRadius:8,border:"none",background:"#374151",color:"#fff",fontSize:16,cursor:"pointer",fontWeight:700 }}>−</button>
              <span style={{ width:24,textAlign:"center",fontWeight:800,fontSize:15 }}>{form.items[p.id]||0}</span>
              <button onClick={()=>setQty(p.id,(form.items[p.id]||0)+1)} style={{ width:29,height:29,borderRadius:8,border:"none",background:"#d97706",color:"#fff",fontSize:16,cursor:"pointer",fontWeight:700 }}>+</button>
            </div>
          </div>
        ))}
        {Object.entries(form.items).reduce((s,[id,q])=>{ const p=[{id:"whole",price:120},{id:"legs",price:45},{id:"fillet",price:65},{id:"wings",price:35},{id:"plate",price:85}].find(x=>x.id===id); return s+(p?p.price*(q||0):0); },0)>0&&(
          <div style={{ background:"#d9770622",border:"1px solid #d97706",borderRadius:10,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontWeight:700 }}>الإجمالي</span>
            <span style={{ fontWeight:900,fontSize:18,color:"#f59e0b" }}>ج.م {Object.entries(form.items).reduce((s,[id,q])=>{ const p=[{id:"whole",price:120},{id:"legs",price:45},{id:"fillet",price:65},{id:"wings",price:35},{id:"plate",price:85}].find(x=>x.id===id); return s+(p?p.price*(q||0):0); },0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
