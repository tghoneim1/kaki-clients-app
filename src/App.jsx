import { useState, useEffect } from "react";

const PRODUCTS = [
  { id:"shamoort",     name:"فرخة شامورط (أقل من كيلو)", emoji:"🐣", price:150 },
  { id:"whole",        name:"فرخة كاملة",                emoji:"🐔", price:190 },
  { id:"breast_full",  name:"صدور كاملة",                emoji:"🥩", price:250 },
  { id:"breast_deb",   name:"صدور مخلية",                emoji:"🥩", price:390 },
  { id:"fillet",       name:"صدور فيليه (بانيه)",        emoji:"🥓", price:390 },
  { id:"wings",        name:"وراك كاملة",                emoji:"🍗", price:100 },
  { id:"shish",        name:"شيش طاوق",                  emoji:"🍢", price:390 },
  { id:"shawarma",     name:"شاورمة فراخ",               emoji:"🌯", price:390 },
  { id:"minced",       name:"فراخ مفرومة بلا دهون",      emoji:"🫙", price:200 },
  { id:"duck",         name:"بط",                        emoji:"🦆", price:220 },
  { id:"pigeon",       name:"حمام",                      emoji:"🕊️", price:80  },
  { id:"rabbit",       name:"أرانب",                     emoji:"🐇", price:180 },
  { id:"turkey",       name:"ديك رومي",                  emoji:"🦃", price:350 },
];

const AREAS = {
  "القاهرة": [
    "مدينة نصر","هليوبوليس","المعادي","الزيتون",
    "شبرا","النزهة","المنيل","جاردن سيتي",
    "الزمالك","وسط البلد"
  ],
  "الجيزة": [
    "الدقي","المهندسين","العجوزة","الهرم",
    "الشيخ زايد","6 أكتوبر","المنيب"
  ],
  "القاهرة الجديدة": [
    "التجمع الأول","التجمع الثالث","التجمع الخامس","القطامية",
    "الشروق","الرحاب","مدينتي","العاصمة الإدارية",
    "بدر","العبور","المقطم","المعادي الجديدة"
  ],
};

const GOV_COLORS = {
  "القاهرة":"#E8821A",
  "الجيزة":"#2D7A3A",
  "القاهرة الجديدة":"#1A5C9E"
};

const PREFIXES = ["أ.","د.","م.","أستاذة","دكتورة","مهندس","مهندسة"];
const PROP_TYPES = [{id:"apt",label:"شقة",icon:"🏢"},{id:"house",label:"فيلا",icon:"🏠"}];

const WHATSAPP_NUMBER = "201001234567"; // 🔴 غيّر الرقم ده

const FIREBASE_URL="https://kaki-app-6b8ba-default-rtdb.firebaseio.com";
const BG="#FFF8F0",CARD="#FFFFFF",BDR="#F0D9C0",CREAM="#3D1A00",MUT="#8B5E3C",GOLD="#E8821A",LIGHT="#FDE8CC",SUCCESS="#2D7A3A",ERROR="#C0392B",DARK="#3D1A00";

export default function ClientOrderForm(){
  const [step,setStep]=useState(1); // 1=info, 2=address, 3=items, 4=confirm
  const [prefix,setPrefix]=useState("");
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [delivery,setDelivery]=useState(null);
  const [gov,setGov]=useState("");
  const [area,setArea]=useState("");
  const [propType,setPropType]=useState("apt");
  const [building,setBuilding]=useState("");
  const [aptNum,setAptNum]=useState("");
  const [floor,setFloor]=useState("");
  const [street,setStreet]=useState("");
  const [extra,setExtra]=useState("");
  const [mapOpen,setMapOpen]=useState(false);
  const [locSet,setLocSet]=useState(false);
  const [lat,setLat]=useState(null);
  const [lng,setLng]=useState(null);
  const [items,setItems]=useState({});
  const [mapsLink,setMapsLink]=useState("");
  const [isCompound,setIsCompound]=useState(false);
  const [notes,setNotes]=useState("");
  const [errors,setErrors]=useState({});
  const [sent,setSent]=useState(false);

  useEffect(()=>{
    if(mapOpen){
      if(!window.L){
        const link=document.createElement('link');
        link.rel='stylesheet';
        link.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(link);
        const script=document.createElement('script');
        script.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload=initMap;
        document.head.appendChild(script);
      } else { initMap(); }
    }
    if(!mapOpen&&window._cMap){window._cMap.remove();window._cMap=null;}
    if(mapOpen&&window._cMap) setTimeout(()=>window._cMap.invalidateSize(),200);
  },[mapOpen]);

  const initMap=()=>{
    setTimeout(()=>{
      const el=document.getElementById('client-map');
      if(!el||window._cMap) return;
      window._cMap=window.L.map('client-map').setView([30.0444,31.2357],13);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(window._cMap);
      const icon=window.L.divIcon({html:'<div style="font-size:32px;margin-top:-32px;margin-left:-10px">📍</div>',iconSize:[20,32],className:''});
      window._cMarker=window.L.marker([30.0444,31.2357],{draggable:true,icon}).addTo(window._cMap);
      window._cMap.on('click',e=>{window._cMarker.setLatLng(e.latlng);setLat(e.latlng.lat);setLng(e.latlng.lng);setLocSet(true);});
      window._cMarker.on('dragend',e=>{const ll=e.target.getLatLng();setLat(ll.lat);setLng(ll.lng);setLocSet(true);});
    },300);
  };

  const getUserLoc=()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        setLat(pos.coords.latitude);setLng(pos.coords.longitude);setLocSet(true);
        if(window._cMap){window._cMap.setView([pos.coords.latitude,pos.coords.longitude],16);window._cMarker.setLatLng([pos.coords.latitude,pos.coords.longitude]);}
      },()=>{});
    }
  };

  const add=id=>setItems(p=>({...p,[id]:(p[id]||0)+1}));
  const rem=id=>setItems(p=>{const n={...p};if(n[id]>1)n[id]--;else delete n[id];return n;});
  const total=Object.entries(items).reduce((s,[id,q])=>{const p=PRODUCTS.find(x=>x.id===id);return s+(p?p.price*q:0);},0);
  const hasItems=Object.values(items).some(q=>q>0);

  const inp=(field)=>({width:"100%",background:CARD,border:`1.5px solid ${errors[field]?ERROR:BDR}`,borderRadius:12,padding:"13px 14px",color:CREAM,fontSize:14,fontFamily:"'Cairo',sans-serif",direction:"rtl",boxSizing:"border-box",outline:"none",boxShadow:errors[field]?`0 0 0 3px rgba(192,57,43,.1)`:"none"});
  const lbl={display:"block",fontSize:12,color:GOLD,marginBottom:5,fontWeight:800};

  const validatePhone=phone=>{
    const cleaned=phone.replace(/\s/g,"");
    return /^01[0125][0-9]{8}$/.test(cleaned);
  };

  const validateStep1=()=>{
    const e={};
    if(!name.trim())e.name=true;
    if(!phone.trim()||!validatePhone(phone))e.phone=true;
    if(!delivery)e.delivery=true;
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const validateStep2=()=>{
    if(delivery==="pickup") return true;
    const e={};
    if(!gov)e.gov=true;
    if(!area)e.area=true;
    if(!building.trim())e.building=true;
    if(!aptNum.trim())e.aptNum=true;
    if(!street.trim()&&!isCompound)e.street=true;
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const validateStep3=()=>{
    if(!hasItems){setErrors({items:true});return false;}
    return true;
  };

  const [sending,setSending]=useState(false);

  const sendOrder=async()=>{
    setSending(true);
    const fullName=`${prefix?prefix+" ":""}${name}`.trim();
    const fullAddress=delivery==="pickup"?"استلام شخصي":`${gov} — ${area}${street?" — "+street:""}${building?" — رقم "+building:""}${aptNum?" ش"+aptNum:""}${floor?" د"+floor:""}${extra?" — "+extra:""}`;
    const orderId="ORD-"+Date.now();
    const order={
      id:orderId,client:fullName,phone,address:fullAddress,
      gov,area,street,building,aptNum,floor,delivery,items,total,
      notes:"",mapsLink:mapsLink||null,lat:lat||null,lng:lng||null,
      status:"جديد",createdAt:Date.now(),source:"client-app",
    };

    let saved=false;
    try{
      const res=await fetch(`${FIREBASE_URL}/orders/${orderId}.json`,{
        method:"PUT",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(order)
      });
      if(res.ok) saved=true;
    }catch(e){ saved=false; }

    if(!saved){
      // WhatsApp fallback
      const lines=Object.entries(items).filter(([,q])=>q>0).map(([id,q])=>{
        const p=PRODUCTS.find(x=>x.id===id);
        return p?`${p.name} × ${q} = ج.م ${p.price*q}`:"";
      }).filter(Boolean).join("\n");
      const msg=`🐔 طلب جديد — دواجن كاكي\n━━━━━━━━━━━━\n👤 ${fullName}\n📞 ${phone}\n📍 ${fullAddress}\n━━━━━━━━━━━━\n${lines}\n━━━━━━━━━━━━\n💰 الإجمالي: ج.م ${total}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,"_blank");
    }

    setSending(false);
    setSent(true);
  };

  if(sent) return(
    <div style={{fontFamily:"'Cairo',sans-serif",background:BG,minHeight:"100vh",color:CREAM,direction:"rtl",maxWidth:400,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#FFF8F0}`}</style>
      <div style={{fontSize:80,marginBottom:16}}>✅</div>
      <div style={{fontWeight:900,fontSize:22,color:GOLD,marginBottom:8}}>تم إرسال طلبك!</div>
      <div style={{fontSize:14,color:MUT,lineHeight:1.8,marginBottom:24}}>سيتواصل معك فريقنا قريباً لتأكيد الطلب</div>
      <button onClick={()=>{setSent(false);setItems({});setNotes("");setStep(1);}}
        style={{background:GOLD,color:"#000",border:"none",borderRadius:14,padding:"13px 32px",fontWeight:800,fontSize:15,fontFamily:"'Cairo',sans-serif",cursor:"pointer"}}>
        🛒 طلب جديد
      </button>
    </div>
  );

  return(
    <div style={{fontFamily:"'Cairo',sans-serif",background:BG,minHeight:"100vh",color:CREAM,direction:"rtl",maxWidth:400,margin:"0 auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#FFF8F0}input::placeholder,textarea::placeholder{color:#C4956A}select{font-family:'Cairo',sans-serif}select option{background:#fff;color:#3D1A00}::-webkit-scrollbar{display:none}`}</style>

      {/* Header */}
      <div style={{background:CARD,padding:"16px 18px",textAlign:"center",borderBottom:`2px solid ${GOLD}`,position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 12px rgba(232,130,26,.12)"}}>
        <div style={{fontSize:28,marginBottom:2}}>🐔</div>
        <div style={{fontWeight:900,fontSize:18,color:GOLD}}>دواجن كاكي</div>
        <div style={{fontSize:11,color:MUT,marginTop:2}}>طازج يومياً — مباشرة من المزرعة</div>
      </div>

      {/* Progress */}
      <div style={{display:"flex",padding:"10px 16px",gap:4,background:CARD,borderBottom:`1px solid ${BDR}`}}>
        {[["١","بياناتك"],["٢","العنوان"],["٣","طلبك"],["٤","تأكيد"]].map(([n,l],i)=>(
          <div key={i} style={{flex:1,textAlign:"center"}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:step>i+1?GOLD:step===i+1?GOLD:BDR,color:step>=i+1?"#fff":MUT,fontWeight:800,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 3px"}}>
              {step>i+1?"✓":n}
            </div>
            <div style={{fontSize:9,color:step===i+1?GOLD:MUT,fontWeight:step===i+1?700:400}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{padding:16,paddingBottom:100}}>

        {/* ══ STEP 1 — Personal info ══ */}
        {step===1&&(
          <div>
            <div style={{fontWeight:800,fontSize:16,color:GOLD,marginBottom:4}}>👤 بياناتك الشخصية</div>
            <div style={{fontSize:12,color:MUT,marginBottom:16}}>نحتاجها للتواصل معك</div>

            {/* Prefix dropdown */}
            <label style={lbl}>اللقب (اختياري)</label>
            <select style={{...inp(),marginBottom:10,cursor:"pointer"}} value={prefix} onChange={e=>setPrefix(e.target.value)}>
              <option value="">— اختر اللقب —</option>
              {PREFIXES.map(p=><option key={p} value={p}>{p}</option>)}
            </select>

            {/* Name */}
            <label style={lbl}>الاسم *</label>
            <input style={{...inp("name"),marginBottom:10}} placeholder="اسمك الكريم" value={name} onChange={e=>{setName(e.target.value);setErrors(r=>({...r,name:false}));}}/>
            {errors.name&&<div style={{fontSize:11,color:"#f87171",marginBottom:8}}>⚠️ الاسم مطلوب</div>}

            {/* Phone */}
            <label style={lbl}>رقم الهاتف *</label>
            <input style={{...inp("phone"),marginBottom:4}} placeholder="01XXXXXXXXX" type="tel" value={phone}
              onChange={e=>{
                setPhone(e.target.value);
                setErrors(r=>({...r,phone:e.target.value&&!validatePhone(e.target.value)}));
              }}/>
            {errors.phone&&phone&&<div style={{fontSize:11,color:"#f87171",marginBottom:6}}>⚠️ رقم الهاتف غير صحيح — يجب أن يبدأ بـ 01 ويكون ١١ رقم</div>}
            {errors.phone&&!phone&&<div style={{fontSize:11,color:"#f87171",marginBottom:6}}>⚠️ رقم الهاتف مطلوب</div>}
            {phone&&validatePhone(phone)&&<div style={{fontSize:11,color:"#10b981",marginBottom:6}}>✅ رقم صحيح</div>}

            {/* Delivery or Pickup */}
            <label style={lbl}>طريقة الاستلام *</label>
            <div style={{display:"flex",gap:10,marginBottom:errors.delivery?6:16}}>
              {[["pickup","🏪","استلام شخصي","احضر طلبك بنفسك"],["delivery","🛵","توصيل","نوصلك لبيتك"]].map(([v,ic,lb,sub])=>(
                <button key={v} onClick={()=>{setDelivery(v);setErrors(r=>({...r,delivery:false}));}}
                  style={{flex:1,background:delivery===v?"#2D7A3A":CARD,color:delivery===v?"#fff":DARK,border:`2px solid ${errors.delivery?"#C0392B":delivery===v?"#2D7A3A":BDR}`,borderRadius:14,padding:"16px 8px",fontFamily:"'Cairo',sans-serif",cursor:"pointer",textAlign:"center",boxShadow:delivery===v?"0 6px 20px rgba(45,122,58,.25)":"none",transition:"all .2s"}}>
                  <div style={{fontSize:36,marginBottom:6}}>{ic}</div>
                  <div style={{fontWeight:800,fontSize:14}}>{lb}</div>
                  <div style={{fontSize:10,color:delivery===v?"rgba(255,255,255,.7)":MUT,marginTop:3}}>{sub}</div>
                </button>
              ))}
            </div>
            {errors.delivery&&<div style={{fontSize:11,color:"#f87171",marginBottom:12}}>⚠️ اختر طريقة الاستلام</div>}

            <button onClick={()=>{if(validateStep1())setStep(delivery==="pickup"?3:2);}}
              style={{width:"100%",background:GOLD,color:"#000",border:"none",borderRadius:14,padding:"15px",fontWeight:900,fontSize:16,fontFamily:"'Cairo',sans-serif",cursor:"pointer",boxShadow:`0 8px 24px ${GOLD}44`}}>
              التالي ←
            </button>
          </div>
        )}

        {/* ══ STEP 2 — Address ══ */}
        {step===2&&(
          <div>
            <div style={{fontWeight:800,fontSize:16,color:GOLD,marginBottom:4}}>📍 عنوان التوصيل</div>
            <div style={{fontSize:12,color:MUT,marginBottom:16}}>حدد موقعك بدقة</div>

            {/* Location options */}
            <label style={lbl}>📍 الموقع (اختياري — اختر طريقة)</label>

            {/* Google Maps paste */}
            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
              <div style={{fontSize:12,color:MUT,marginBottom:6,fontWeight:700}}>📎 الصق رابط Google Maps</div>
              <div style={{display:"flex",gap:6}}>
                <input
                  style={{...inp(),marginBottom:0,flex:1,fontSize:12}}
                  placeholder="https://maps.google.com/..."
                  value={mapsLink}
                  onChange={e=>setMapsLink(e.target.value)}
                />
                {mapsLink&&(
                  <button onClick={()=>setMapsLink("")}
                    style={{background:LIGHT,border:"none",borderRadius:8,padding:"0 10px",color:MUT,cursor:"pointer",fontSize:13,flexShrink:0}}>✕</button>
                )}
              </div>
              {mapsLink&&<div style={{fontSize:11,color:"#10b981",marginTop:5,fontWeight:700}}>✅ تم إضافة رابط الموقع</div>}
            </div>

            {/* Map toggle */}
            <button onClick={()=>setMapOpen(o=>!o)}
              style={{width:"100%",background:locSet?`${SUCCESS}15`:CARD,border:`1.5px solid ${locSet?SUCCESS:BDR}`,borderRadius:12,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",marginBottom:10,fontFamily:"'Cairo',sans-serif",color:CREAM}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>🗺️</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700,fontSize:13,color:locSet?SUCCESS:DARK}}>{locSet?"✅ تم تحديد الموقع على الخريطة":"تحديد الموقع على الخريطة"}</div>
                  <div style={{fontSize:10,color:MUT}}>اضغط لفتح الخريطة</div>
                </div>
              </div>
              <span style={{color:MUT}}>{mapOpen?"▲":"▼"}</span>
            </button>

            {/* Map */}
            {mapOpen&&(
              <div style={{marginBottom:10,borderRadius:12,overflow:"hidden",border:`1px solid ${BDR}`}}>
                <div id="client-map" style={{width:"100%",height:220}}/>
                <div style={{padding:"8px 10px",background:LIGHT,display:"flex",gap:8}}>
                  <button onClick={getUserLoc}
                    style={{flex:1,background:CARD,color:GOLD,border:`1px solid ${GOLD}`,borderRadius:8,padding:"9px",fontWeight:700,fontSize:12,fontFamily:"'Cairo',sans-serif",cursor:"pointer"}}>
                    📍 موقعي الحالي
                  </button>
                  {locSet&&(
                    <button onClick={()=>setMapOpen(false)}
                      style={{flex:1,background:SUCCESS,color:"#fff",border:"none",borderRadius:8,padding:"9px",fontWeight:800,fontSize:12,fontFamily:"'Cairo',sans-serif",cursor:"pointer"}}>
                      📍 هذا موقعي ✅
                    </button>
                  )}
                </div>
                <div style={{fontSize:10,color:MUT,textAlign:"center",padding:5,background:LIGHT}}>اضغط على الخريطة أو اسحب الـ Pin</div>
              </div>
            )}

            {/* Gov */}
            <label style={lbl}>المحافظة *</label>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              {Object.keys(AREAS).map(g=>(
                <button key={g} onClick={()=>{setGov(g===gov?"":g);setArea("");setErrors(r=>({...r,gov:false}));}}
                  style={{flex:1,background:gov===g?(GOV_COLORS[g]||GOLD):CARD,color:gov===g?"#fff":DARK,border:`1.5px solid ${errors.gov?ERROR:gov===g?(GOV_COLORS[g]||GOLD):BDR}`,borderRadius:10,padding:"10px 4px",fontWeight:700,fontSize:10,fontFamily:"'Cairo',sans-serif",cursor:"pointer"}}>
                  {g} {gov===g?"▲":"▼"}
                </button>
              ))}
            </div>

            {/* Area */}
            {gov&&!area&&(
              <>
                <label style={lbl}>المنطقة / الحي *</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,maxHeight:200,overflowY:"auto",marginBottom:10}}>
                  {AREAS[gov].map(a=>(
                    <button key={a} onClick={()=>{setArea(a);setErrors(r=>({...r,area:false}));}}
                      style={{background:CARD,color:CREAM,border:`1px solid ${errors.area?"#ef4444":BDR}`,borderRadius:9,padding:"9px 8px",fontSize:12,fontFamily:"'Cairo',sans-serif",cursor:"pointer",textAlign:"center"}}>
                      {a}
                    </button>
                  ))}
                </div>
              </>
            )}
            {gov&&area&&(
              <button onClick={()=>setArea("")}
                style={{width:"100%",background:GOV_COLORS[gov]||GOLD,color:"#000",border:"none",borderRadius:10,padding:"11px 14px",fontWeight:800,fontSize:13,fontFamily:"'Cairo',sans-serif",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span>📍 {gov} — {area}</span>
                <span style={{fontSize:11,fontWeight:400}}>تغيير ▼</span>
              </button>
            )}

            {/* Property type */}
            {area&&(
              <>
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  {PROP_TYPES.map(t=>(
                    <button key={t.id} onClick={()=>{setPropType(t.id);setIsCompound(false);}}
                      style={{flex:1,background:propType===t.id?GOLD:CARD,color:propType===t.id?"#fff":DARK,border:`1.5px solid ${propType===t.id?GOLD:BDR}`,borderRadius:24,padding:"10px 6px",fontWeight:propType===t.id?800:400,fontSize:12,fontFamily:"'Cairo',sans-serif",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                {/* Compound checkbox */}
                <button onClick={()=>setIsCompound(c=>!c)}
                  style={{width:"100%",background:isCompound?`${GOLD}15`:CARD,border:`1.5px solid ${isCompound?GOLD:BDR}`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:10,cursor:"pointer",fontFamily:"'Cairo',sans-serif"}}>
                  <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${isCompound?GOLD:BDR}`,background:isCompound?GOLD:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {isCompound&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,fontSize:13,color:isCompound?GOLD:DARK}}>كومباوند</div>
                    <div style={{fontSize:10,color:MUT}}>لو في كومباوند — الشارع اختياري</div>
                  </div>
                </button>

                <label style={lbl}>رقم العمارة *</label>
                <input style={{...inp("building"),marginBottom:10}} placeholder="مثال: ٥" value={building} onChange={e=>{setBuilding(e.target.value);setErrors(r=>({...r,building:false}));}}/>

                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  <div style={{flex:1}}>
                    <label style={lbl}>{propType==="house"?"رقم الفيلا *":"رقم الشقة *"}</label>
                    <input style={inp("aptNum")} placeholder="٣" value={aptNum} onChange={e=>{setAptNum(e.target.value);setErrors(r=>({...r,aptNum:false}));}}/>
                  </div>
                  {propType==="apt"&&(
                    <div style={{flex:1}}>
                      <label style={lbl}>الدور (اختياري)</label>
                      <select style={{...inp(),marginBottom:0,cursor:"pointer"}} value={floor} onChange={e=>setFloor(e.target.value)}>
                        <option value="">اختر</option>
                        {["أرضي","١","٢","٣","٤","٥","٦","٧","٨","٩","١٠","١١","١٢","١٣","١٤","١٥","١٦","١٧","١٨","١٩","٢٠"].map(f=>(
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <label style={lbl}>الشارع {isCompound?"(اختياري)":"*"}</label>
                <input style={{...inp(isCompound?"":  "street"),marginBottom:10}} placeholder="مثال: شارع الجمهورية" value={street} onChange={e=>{setStreet(e.target.value);setErrors(r=>({...r,street:false}));}}/>
                {/* Delivery notes */}
                <label style={lbl}>📝 ملاحظات التوصيل (اختياري)</label>
                <input style={{...inp(),marginBottom:10}} placeholder="مثال: بوابة ٤ — جنب المسجد — أمام المدرسة" value={extra} onChange={e=>setExtra(e.target.value)}/>
              </>
            )}

            {/* Validation errors */}
            {(errors.gov||errors.area||errors.building||errors.aptNum||errors.street)&&(
              <div style={{background:"#ef444422",border:"1px solid #ef444466",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#f87171",fontWeight:700}}>
                ⚠️ من فضلك اكمل الحقول المطلوبة
              </div>
            )}

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(1)}
                style={{flex:1,background:LIGHT,color:CREAM,border:"none",borderRadius:14,padding:"14px",fontWeight:700,fontSize:14,fontFamily:"'Cairo',sans-serif",cursor:"pointer"}}>
                ← رجوع
              </button>
              <button onClick={()=>{if(validateStep2())setStep(3);}}
                style={{flex:2,background:GOLD,color:"#000",border:"none",borderRadius:14,padding:"14px",fontWeight:900,fontSize:15,fontFamily:"'Cairo',sans-serif",cursor:"pointer"}}>
                التالي ←
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — Items ══ */}
        {step===3&&(
          <div>
            <div style={{fontWeight:800,fontSize:16,color:GOLD,marginBottom:4}}>🛒 اختر طلبك</div>
            <div style={{fontSize:12,color:MUT,marginBottom:16}}>اضغط + لإضافة الكمية بالكيلو</div>

            {errors.items&&(
              <div style={{background:"#ef444422",border:"1px solid #ef444466",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#f87171",fontWeight:700}}>
                ⚠️ اختر صنفاً واحداً على الأقل
              </div>
            )}

            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {PRODUCTS.map(p=>{
                const qty=items[p.id]||0;
                return(
                  <div key={p.id} style={{background:CARD,borderRadius:14,padding:"12px 14px",border:`1px solid ${qty>0?GOLD:BDR}`,display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:32,flexShrink:0}}>{p.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
                      <div style={{fontSize:12,color:GOLD,fontWeight:700,marginTop:2}}>ج.م {p.price}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                      {qty>0&&<button onClick={()=>rem(p.id)} style={{width:32,height:32,borderRadius:9,border:"none",background:LIGHT,color:CREAM,fontSize:18,cursor:"pointer",fontWeight:700}}>−</button>}
                      {qty>0&&<span style={{fontWeight:900,fontSize:16,color:GOLD,minWidth:20,textAlign:"center"}}>{qty}</span>}
                      <button onClick={()=>{add(p.id);setErrors(r=>({...r,items:false}));}} style={{width:32,height:32,borderRadius:9,border:"none",background:qty>0?GOLD:LIGHT,color:qty>0?"#fff":DARK,fontSize:18,cursor:"pointer",fontWeight:700}}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            {total>0&&(
              <div style={{background:LIGHT,borderRadius:12,padding:"12px 16px",marginBottom:14,border:`1px solid ${BDR}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,fontSize:14}}>الإجمالي التقريبي</span>
                <span style={{fontWeight:900,fontSize:20,color:GOLD}}>ج.م {total}</span>
              </div>
            )}

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(delivery==="pickup"?1:2)}
                style={{flex:1,background:LIGHT,color:CREAM,border:"none",borderRadius:14,padding:"14px",fontWeight:700,fontSize:14,fontFamily:"'Cairo',sans-serif",cursor:"pointer"}}>
                ← رجوع
              </button>
              <button onClick={()=>{if(validateStep3())setStep(4);}}
                style={{flex:2,background:GOLD,color:"#000",border:"none",borderRadius:14,padding:"14px",fontWeight:900,fontSize:15,fontFamily:"'Cairo',sans-serif",cursor:"pointer"}}>
                مراجعة الطلب ←
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 4 — Confirm ══ */}
        {step===4&&(
          <div>
            <div style={{fontWeight:800,fontSize:16,color:GOLD,marginBottom:4}}>✅ مراجعة طلبك</div>
            <div style={{fontSize:12,color:MUT,marginBottom:16}}>تأكد من البيانات قبل الإرسال</div>

            {/* Summary */}
            <div style={{background:CARD,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${BDR}`}}>
              <div style={{fontWeight:700,fontSize:13,color:GOLD,marginBottom:10}}>👤 بياناتك</div>
              <div style={{fontSize:13,color:CREAM,lineHeight:2}}>
                <div>👤 {prefix?prefix+" ":""}{name}</div>
                <div>📞 {phone}</div>
                <div>{delivery==="pickup"?"🏪 استلام شخصي":`🛵 توصيل — ${gov} — ${area}`}</div>
                {delivery==="delivery"&&<div style={{fontSize:12,color:MUT}}>{street} — {building} ش{aptNum}{floor?" د"+floor:""}</div>}
                {extra&&<div style={{fontSize:12,color:MUT}}>📝 {extra}</div>}
                {mapsLink&&<div style={{fontSize:11,color:"#10b981"}}>🔗 رابط Google Maps مضاف ✅</div>}
                {locSet&&<div style={{fontSize:11,color:"#10b981"}}>📍 الموقع محدد على الخريطة ✅</div>}
              </div>
              <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:GOLD,fontSize:12,fontFamily:"'Cairo',sans-serif",cursor:"pointer",marginTop:6}}>✏️ تعديل</button>
            </div>

            <div style={{background:CARD,borderRadius:14,padding:"14px 16px",marginBottom:14,border:`1px solid ${BDR}`}}>
              <div style={{fontWeight:700,fontSize:13,color:GOLD,marginBottom:10}}>🛒 الأصناف</div>
              {PRODUCTS.filter(p=>items[p.id]>0).map(p=>(
                <div key={p.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:`1px solid ${BDR}`}}>
                  <span>{p.emoji} {p.name} × {items[p.id]}</span>
                  <span style={{color:GOLD,fontWeight:700}}>ج.م {p.price*items[p.id]}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:10,fontWeight:900,fontSize:16}}>
                <span>الإجمالي</span>
                <span style={{color:GOLD}}>ج.م {total}</span>
              </div>
              <button onClick={()=>setStep(3)} style={{background:"none",border:"none",color:GOLD,fontSize:12,fontFamily:"'Cairo',sans-serif",cursor:"pointer",marginTop:6}}>✏️ تعديل</button>
            </div>

            {notes&&(
              <div style={{background:CARD,borderRadius:12,padding:"10px 14px",marginBottom:14,border:`1px solid ${BDR}`,fontSize:12,color:MUT}}>
                📝 {notes}
              </div>
            )}

            <button onClick={sendOrder} disabled={sending}
              style={{width:"100%",background:sending?"#C8A060":GOLD,color:"#fff",border:"none",borderRadius:16,padding:"16px",fontWeight:900,fontSize:16,fontFamily:"'Cairo',sans-serif",cursor:sending?"not-allowed":"pointer",boxShadow:`0 8px 32px ${GOLD}44`,marginBottom:8}}>
              {sending?"⏳ جاري الإرسال...":"✅ إرسال الطلب"}
            </button>
            <button onClick={()=>setStep(3)}
              style={{width:"100%",background:LIGHT,color:DARK,border:`1px solid ${BDR}`,borderRadius:14,padding:"12px",fontWeight:600,fontSize:13,fontFamily:"'Cairo',sans-serif",cursor:"pointer"}}>
              ← رجوع
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
