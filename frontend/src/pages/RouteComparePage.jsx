// RouteComparePage.jsx — fixed layout + proper light/dark theme

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import {
  ArrowLeft, Bus, Train, Loader2, MapPin, Users,
  BarChart2, AlertTriangle, CheckCircle, Info, ChevronDown,
  Zap, Trophy, Minus, GitCompare, Shield, Activity, Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// const API_BASE = "http://localhost:8000"|| " import.meta.env.VITE_API_BASE_URL";
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const days   = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const monthToSeason = {
  January:"Winter",February:"Winter",March:"Spring",April:"Spring",
  May:"Summer",June:"Summer",July:"Monsoon",August:"Monsoon",September:"Monsoon",
  October:"Autumn",November:"Autumn",December:"Winter",
};
const seasonEmoji = { Winter:"❄️", Spring:"🌸", Summer:"☀️", Monsoon:"🌧️", Autumn:"🍂" };
const cities       = ["Hyderabad","Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Kadapa","Tirupati","Rajahmundry","Kakinada","Warangal","Nizamabad","Karimnagar","Khammam","Anantapur","Mumbai","Delhi","Bengaluru","Chennai","Kolkata","Pune","Ahmedabad","Jaipur","Lucknow","Bhopal"];
const busTypes     = ["Express","Super Luxury","Sleeper","Volvo AC","City Ordinary","Metro Express","Ordinary"];
const trainClasses = ["Sleeper (SL)","Third AC (3A)","Second AC (2A)","First AC (1A)","AC Chair Car (CC)","Executive Chair Car (EC)","General (GN)"];
const trainTypes   = ["Express","Superfast","Mail","Passenger","Rajdhani","Shatabdi","Duronto","Jan Shatabdi","Garib Rath"];
const railwayZones = ["SCR","SR","CR","WR","NR","ER","SER","NER","ECR","NCR","NWR","SWR","WCR","ECoR","NFR"];

const levelOrder = ["low","medium","high","very_high"];
const levelCfg = {
  low:      { color:"#22c55e", glow:"rgba(34,197,94,0.3)",   bg:"rgba(34,197,94,0.08)",   label:"Low",       Icon:CheckCircle,   border:"rgba(34,197,94,0.35)"   },
  medium:   { color:"#f59e0b", glow:"rgba(245,158,11,0.3)",  bg:"rgba(245,158,11,0.08)",  label:"Moderate",  Icon:Info,          border:"rgba(245,158,11,0.35)"  },
  high:     { color:"#ef4444", glow:"rgba(239,68,68,0.3)",   bg:"rgba(239,68,68,0.08)",   label:"High",      Icon:AlertTriangle, border:"rgba(239,68,68,0.35)"   },
  very_high:{ color:"#7c3aed", glow:"rgba(124,58,237,0.3)",  bg:"rgba(124,58,237,0.08)",  label:"Very High", Icon:AlertTriangle, border:"rgba(124,58,237,0.35)"  },
};

function mapLevel(l) {
  return { "Low":"low","Moderate":"medium","High":"high","Very High":"very_high" }[l] ?? "medium";
}
const formatHour = h =>
  h===0?"12:00 AM":h===12?"12:00 PM":h<12?`${h}:00 AM`:`${h-12}:00 PM`;

const palette = {
  bus:  { primary:"#F59E0B", dark:"#B45309", mid:"#D97706" },
  train:{ primary:"#0D9488", dark:"#134E4A", mid:"#0F766E" },
};

// ─── AnimatedNumber ──────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, suffix="" }) => {
  const spring  = useSpring(0, { stiffness:60, damping:18 });
  const display = useTransform(spring, v=>`${Math.round(v)}${suffix}`);
  useEffect(()=>{ spring.set(value); },[value]);
  return <motion.span>{display}</motion.span>;
};

// ─── PortalDropdown ──────────────────────────────────────────────────────────
const PortalDropdown = ({ anchorRef, open, options, value, onChange, onClose, accentColor }) => {
  const [rect, setRect] = useState(null);
  useEffect(()=>{ if(open&&anchorRef.current) setRect(anchorRef.current.getBoundingClientRect()); },[open]);
  useEffect(()=>{
    if(!open) return;
    const upd=()=>{ if(anchorRef.current) setRect(anchorRef.current.getBoundingClientRect()); };
    window.addEventListener("scroll",upd,true); window.addEventListener("resize",upd);
    return ()=>{ window.removeEventListener("scroll",upd,true); window.removeEventListener("resize",upd); };
  },[open]);
  useEffect(()=>{
    if(!open) return;
    const h=(e)=>{ if(anchorRef.current&&!anchorRef.current.contains(e.target)) onClose(); };
    const t=setTimeout(()=>document.addEventListener("mousedown",h),10);
    return ()=>{ clearTimeout(t); document.removeEventListener("mousedown",h); };
  },[open]);
  if(!open||!rect) return null;
  const spaceBelow=window.innerHeight-rect.bottom;
  const up=spaceBelow<220&&rect.top>220;
  const top=up?rect.top+window.scrollY-8:rect.bottom+window.scrollY+6;
  return createPortal(
    <AnimatePresence>
      {open&&(
        <motion.div
          initial={{opacity:0,y:up?8:-8,scaleY:.94}} animate={{opacity:1,y:0,scaleY:1}}
          exit={{opacity:0,y:up?8:-8,scaleY:.94}} transition={{duration:.18}}
          style={{ position:"absolute",top,left:rect.left+window.scrollX,width:rect.width,
            transformOrigin:up?"bottom":"top",zIndex:99999,borderRadius:12,overflow:"hidden",
            boxShadow:"0 16px 48px rgba(0,0,0,0.18)",
            background:"hsl(var(--card))",border:"1.5px solid hsl(var(--border))" }}>
          <div style={{maxHeight:200,overflowY:"auto"}} className="py-1">
            {options.map(opt=>(
              <button key={opt} type="button"
                onMouseDown={e=>{e.preventDefault();onChange(opt);onClose();}}
                style={{ display:"block",width:"100%",textAlign:"left",padding:"10px 16px",fontSize:13,
                  cursor:"pointer",color:value===opt?accentColor:"hsl(var(--foreground))",
                  fontWeight:value===opt?600:400,background:"transparent",border:"none",transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=`${accentColor}14`}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// ─── CustomSelect ────────────────────────────────────────────────────────────
const CustomSelect = ({ label, value, onChange, options, placeholder, icon:Icon, accentColor }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  return (
    <div className="space-y-1.5">
      {label&&(
        <label style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",
          color:"hsl(var(--muted-foreground))"}}>
          {label}
        </label>
      )}
      <button ref={ref} type="button" onClick={()=>setOpen(o=>!o)}
        style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"10px 14px",borderRadius:12,fontSize:13,fontWeight:500,cursor:"pointer",
          background:"hsl(var(--background))",
          border:`1.5px solid ${open?accentColor:"hsl(var(--border))"}`,
          color:value?"hsl(var(--foreground))":"hsl(var(--muted-foreground))",
          boxShadow:open?`0 0 0 3px ${accentColor}20`:"none",
          transition:"border-color .2s, box-shadow .2s" }}>
        <span style={{display:"flex",alignItems:"center",gap:8,overflow:"hidden",
          textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"85%"}}>
          {Icon&&<Icon style={{width:14,height:14,color:accentColor,flexShrink:0}}/>}
          {value||placeholder}
        </span>
        <motion.div animate={{rotate:open?180:0}} transition={{duration:.2}} style={{flexShrink:0}}>
          <ChevronDown style={{width:14,height:14,color:"hsl(var(--muted-foreground))"}}/>
        </motion.div>
      </button>
      <PortalDropdown anchorRef={ref} open={open} options={options} value={value}
        onChange={onChange} onClose={()=>setOpen(false)} accentColor={accentColor}/>
    </div>
  );
};

// ─── Gauge ───────────────────────────────────────────────────────────────────
const GaugeChart = ({ pct, color, glow }) => {
  const r=58, cx=76, cy=76;
  const circ=2*Math.PI*r, arc=circ*0.75;
  const [animPct, setAnimPct]=useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setAnimPct(pct),120); return ()=>clearTimeout(t); },[pct]);
  const dash=(animPct/100)*arc;
  return (
    <svg viewBox="0 0 152 130" style={{width:"100%",maxWidth:160,overflow:"visible",display:"block",margin:"0 auto"}}>
      <defs>
        <filter id="gf4">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={11}
        strokeDasharray={`${arc} ${circ-arc}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
      {[0,25,50,75,100].map(tick=>{
        const angle=135+(tick/100)*270, rad=angle*Math.PI/180;
        return <line key={tick}
          x1={cx+(r-16)*Math.cos(rad)} y1={cy+(r-16)*Math.sin(rad)}
          x2={cx+(r-9)*Math.cos(rad)}  y2={cy+(r-9)*Math.sin(rad)}
          stroke="currentColor" strokeOpacity={0.2} strokeWidth={1.5}/>;
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={11} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ-dash}`} transform={`rotate(135 ${cx} ${cy})`} filter="url(#gf4)"
        style={{transition:"stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)"}}/>
      <text x={cx} y={cy-6} textAnchor="middle" fontSize={24} fontWeight={800} fill={color}
        style={{filter:`drop-shadow(0 0 6px ${glow})`}}>{animPct}%</text>
      <text x={cx} y={cy+12} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.45} letterSpacing={2}>OCCUPANCY</text>
      <text x={12}  y={118} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.35}>0%</text>
      <text x={140} y={118} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.35}>100%</text>
    </svg>
  );
};

// ─── Mini bar chart ───────────────────────────────────────────────────────────
const MiniBarChart = ({ data, color, labels }) => {
  const [go, setGo]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setGo(true),200); return ()=>clearTimeout(t); },[]);
  const max=Math.max(...data,1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:5,height:80}}>
      {data.map((v,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <span style={{fontSize:9,fontWeight:700,color,opacity:go?1:0,transition:`opacity .3s ${i*.05}s`}}>{v}%</span>
          <div style={{width:"100%",height:56,borderRadius:"4px 4px 0 0",
            background:"hsl(var(--muted)/0.5)",position:"relative",overflow:"hidden"}}>
            <motion.div initial={{height:"0%"}} animate={{height:go?`${(v/max)*100}%`:"0%"}}
              transition={{duration:.7,delay:i*.06,ease:[.34,1.56,.64,1]}}
              style={{position:"absolute",bottom:0,left:0,right:0,borderRadius:"4px 4px 0 0",
                background:`linear-gradient(to top,${color},${color}88)`,
                boxShadow:`0 -2px 8px ${color}40`}}/>
          </div>
          <span style={{fontSize:9,color:"hsl(var(--muted-foreground))",textAlign:"center"}}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Route Card ──────────────────────────────────────────────────────────────
const RouteCard = ({ label, route, vehicle, result, pal, isWinner }) => {
  const cfg = levelCfg[result.level];
  const hourly = result.hourlyData ||
    [22,58,78,62,45,28].map(v=>Math.min(98,Math.max(5,Math.round(v*(0.7+result.percentage/160)))));
  return (
    <motion.div initial={{opacity:0,y:20,scale:.97}} animate={{opacity:1,y:0,scale:1}}
      transition={{duration:.45,ease:[.34,1.56,.64,1]}}
      className="glass-card rounded-2xl overflow-hidden"
      style={{ position:"relative",
        border:`1.5px solid ${isWinner?cfg.color:"hsl(var(--border))"}`,
        boxShadow:isWinner?`0 8px 32px ${cfg.glow}`:"0 2px 16px rgba(0,0,0,0.06)" }}>

      {isWinner&&(
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:.35}}
          style={{ position:"absolute",top:0,right:0,zIndex:2,
            background:`linear-gradient(135deg,${cfg.color},${cfg.color}cc)`,
            padding:"5px 13px",borderRadius:"0 16px 0 10px",
            display:"flex",alignItems:"center",gap:4 }}>
          <Trophy style={{width:10,height:10,color:"#fff"}}/>
          <span style={{fontSize:10,fontWeight:800,color:"#fff",letterSpacing:"0.07em"}}>WINNER</span>
        </motion.div>
      )}

      {/* Card header with gradient matching prediction pages */}
      <div style={{ padding:"14px 18px",
        background:`linear-gradient(135deg,${pal.dark},${pal.mid})`,
        borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{ width:30,height:30,borderRadius:9,flexShrink:0,
            background:"rgba(255,255,255,0.15)",
            display:"flex",alignItems:"center",justifyContent:"center" }}>
            <span style={{fontSize:13,fontWeight:800,color:"#fff"}}>{label}</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff",
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{route}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:1}}>{vehicle}</div>
          </div>
        </div>
        <div style={{ display:"inline-flex",alignItems:"center",gap:5,
          padding:"3px 10px",borderRadius:999,background:"rgba(255,255,255,0.12)",
          border:"1px solid rgba(255,255,255,0.2)" }}>
          <cfg.Icon style={{width:11,height:11,color:cfg.color}}/>
          <span style={{fontSize:10,fontWeight:700,color:"#fff"}}>{cfg.label} Occupancy</span>
        </div>
      </div>

      {/* Gauge */}
      <div style={{padding:"16px 12px 8px",borderBottom:"1px solid hsl(var(--border))"}}>
        <GaugeChart pct={result.percentage} color={cfg.color} glow={cfg.glow}/>
      </div>

      {/* Stats */}
      <div style={{padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,
        borderBottom:"1px solid hsl(var(--border))"}}>
        {[
          {icon:Users,    label:"Passengers", value:<AnimatedNumber value={result.estimatedPassengers}/>},
          {icon:Gauge,    label:"Fill Rate",  value:<AnimatedNumber value={result.percentage} suffix="%"/>},
          {icon:Activity, label:"Status",     value:cfg.label},
        ].map(({icon:Ic,label:lbl,value})=>(
          <div key={lbl} style={{borderRadius:10,padding:"9px 6px",textAlign:"center",
            background:cfg.bg,border:`1px solid ${cfg.border}`}}>
            <Ic style={{width:12,height:12,color:cfg.color,margin:"0 auto 3px"}}/>
            <div style={{fontSize:9,color:"hsl(var(--muted-foreground))",marginBottom:2}}>{lbl}</div>
            <div style={{fontSize:11,fontWeight:700,color:"hsl(var(--foreground))"}}>{value}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{padding:"12px 16px",borderBottom:"1px solid hsl(var(--border))"}}>
        <div style={{fontSize:9,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",
          color:"hsl(var(--muted-foreground))",marginBottom:8}}>Hourly Pattern</div>
        <MiniBarChart data={hourly} color={cfg.color} labels={["0–4","4–8","8–12","12–16","16–20","20–24"]}/>
      </div>

      {/* Suggestion */}
      <div style={{padding:"12px 16px"}}>
        <div style={{padding:"9px 12px",borderRadius:9,background:cfg.bg,
          border:`1px solid ${cfg.border}`,fontSize:12,color:"hsl(var(--muted-foreground))",
          display:"flex",alignItems:"flex-start",gap:7,lineHeight:1.5}}>
          <Info style={{width:12,height:12,flexShrink:0,marginTop:1,color:cfg.color}}/>
          {result.suggestion}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Route B Form ─────────────────────────────────────────────────────────────
const RouteForm = ({ isTrain, pal, baseRoute, onResult }) => {
  const [srcB,setSrcB]=useState("");
  const [dstB,setDstB]=useState("");
  const [travelDate,setTravelDate]=useState("");
  const [dateErr,setDateErr]=useState("");
  const [dayB,setDayB]=useState(baseRoute.day);
  const [monthB,setMonthB]=useState(baseRoute.month);
  const [seasonB,setSeasonB]=useState(baseRoute.season);
  const [hourB,setHourB]=useState(baseRoute.hourOfDep);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);
  const [vehicleClassB,setVehicleClassB]=useState(baseRoute.vehicleClass||"");
  const [trainTypeB,setTrainTypeB]=useState(baseRoute.trainType||"");
  const [railwayZoneB,setRailwayZoneB]=useState(baseRoute.railwayZone||"");
  const [capacityB,setCapacityB]=useState(String(baseRoute.capacity||72));
  const [distanceB,setDistanceB]=useState(String(baseRoute.routeDistance||200));
  const [busTypeB,setBusTypeB]=useState(baseRoute.busType||"");
  const [busCapB,setBusCapB]=useState(String(baseRoute.capacity||50));
  const todayStr=new Date().toISOString().split("T")[0];

  const handleDate=val=>{
    setTravelDate(val); setDateErr("");
    if(!val){setDayB(baseRoute.day);setMonthB(baseRoute.month);setSeasonB(baseRoute.season);return;}
    if(val<todayStr){setDateErr("Select today or a future date.");return;}
    const d=new Date(val+"T00:00:00");
    if(isNaN(d.getTime())) return;
    const dd=days[d.getDay()===0?6:d.getDay()-1];
    const mm=months[d.getMonth()];
    setDayB(dd); setMonthB(mm); setSeasonB(monthToSeason[mm]);
  };

  const valid = isTrain
    ? !!(srcB&&dstB&&srcB!==dstB&&vehicleClassB&&trainTypeB&&railwayZoneB&&capacityB&&distanceB)
    : !!(srcB&&dstB&&srcB!==dstB&&busTypeB&&busCapB);

  const predict = async () => {
    setLoading(true); setErr(null);
    try {
      const body = isTrain
        ? { day_of_week:dayB,month:monthB,season:seasonB,departure_hour:hourB,
            source_station:srcB,destination_station:dstB,travel_class:vehicleClassB,
            train_type:trainTypeB,railway_zone:railwayZoneB,seat_capacity:Number(capacityB),
            route_distance_km:Number(distanceB),is_holiday:0,
            is_weekend:["Saturday","Sunday"].includes(dayB)?1:0,
            is_peak_hour:(hourB>=7&&hourB<=10)||(hourB>=17&&hourB<=20)?1:0 }
        : { day_of_week:dayB,month:monthB,season:seasonB,hour_of_departure:hourB,
            source_city:srcB,destination_city:dstB,bus_type:busTypeB,
            bus_capacity:Number(busCapB),is_holiday:0 };

      const res = await fetch(`${API_BASE}/predict/${isTrain?"train":"bus"}`,
        {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const level=mapLevel(data.occupancy_level);
      const pct=Math.round(data.occupancy_percentage);
      const cap=isTrain?Number(capacityB):Number(busCapB);
      const suggestions={
        high:"Peak period — book immediately!",
        very_high:"Extremely busy! Consider alternate.",
        medium:"Moderate crowd expected.",
        low:"Great time to travel!"
      };
      const seed=pct/100;
      const hourlyData=[22,58,78,62,45,28].map(v=>Math.min(98,Math.max(5,Math.round(v*(0.7+seed*0.6)))));
      onResult({
        routeLabel:`${srcB} → ${dstB}`,
        vehicleLabel:isTrain?`${vehicleClassB} · ${trainTypeB}`:`${busTypeB} · ${busCapB} seats`,
        result:{level,percentage:pct,
          estimatedPassengers:data.estimated_passengers??Math.round((pct/100)*cap),
          suggestion:suggestions[level],hourlyData}
      });
    } catch(e){ setErr(e.message||"Prediction failed."); }
    finally{ setLoading(false); }
  };

  // Use hsl(var(--background)) so it adapts to light/dark theme
  const iStyle = {
    width:"100%",padding:"10px 14px",borderRadius:10,fontSize:13,
    background:"hsl(var(--background))",
    border:"1.5px solid hsl(var(--border))",
    color:"hsl(var(--foreground))",outline:"none",
    boxSizing:"border-box",transition:"border-color .2s",
  };
  const labelCls = {
    fontSize:11,fontWeight:600,letterSpacing:"0.08em",
    textTransform:"uppercase",color:"hsl(var(--muted-foreground))",
  };

  return (
    <div className="space-y-4">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <CustomSelect label="From" value={srcB} onChange={setSrcB} options={cities}
          placeholder="Source city" accentColor={pal.primary} icon={MapPin}/>
        <CustomSelect label="To" value={dstB} onChange={setDstB}
          options={cities.filter(c=>c!==srcB)} placeholder="Dest city"
          accentColor={pal.primary} icon={MapPin}/>
      </div>

      {/* Date */}
      <div>
        <label style={{...labelCls,display:"flex",alignItems:"center",gap:4}}>
          Travel Date
          <span style={{opacity:.5,fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional)</span>
        </label>
        <input type="date" min={todayStr} value={travelDate} onChange={e=>handleDate(e.target.value)}
          style={{...iStyle,marginTop:6,
            border:`1.5px solid ${dateErr?"#ef4444":travelDate&&!dateErr?pal.primary:"hsl(var(--border))"}`,
            colorScheme:"light dark"}}/>
        {dateErr&&(
          <p style={{fontSize:11,color:"#ef4444",marginTop:4,display:"flex",alignItems:"center",gap:4}}>
            <AlertTriangle style={{width:11,height:11}}/>{dateErr}
          </p>
        )}
        {dayB&&!dateErr&&(
          <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
            {[`📅 ${dayB}`,`🗓️ ${monthB}`,`${seasonEmoji[seasonB]||""} ${seasonB}`].map((t,i)=>(
              <span key={i} style={{fontSize:11,padding:"3px 10px",borderRadius:999,
                background:i===2?`${pal.primary}14`:"hsl(var(--muted))",
                color:i===2?pal.dark:"hsl(var(--foreground))",
                fontWeight:600,border:i===2?`1px solid ${pal.primary}40`:"none"}}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Hour slider */}
      <div>
        <label style={labelCls}>Departure Hour</label>
        <div className="glass-card rounded-xl p-4 mt-1.5"
          style={{border:"1.5px solid hsl(var(--border))"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"baseline"}}>
            <span className="font-display text-lg font-bold" style={{color:pal.dark}}>{formatHour(hourB)}</span>
            <span style={{fontSize:10,color:"hsl(var(--muted-foreground))"}}>same as Route A by default</span>
          </div>
          <input type="range" min={0} max={23} value={hourB}
            onChange={e=>setHourB(Number(e.target.value))}
            className="w-full cursor-pointer" style={{accentColor:pal.primary}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,
            color:"hsl(var(--muted-foreground))",marginTop:4}}>
            {["12AM","6AM","12PM","6PM","11PM"].map(t=><span key={t}>{t}</span>)}
          </div>
        </div>
      </div>

      {/* Vehicle fields */}
      {isTrain ? (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <CustomSelect label="Train Class" value={vehicleClassB} onChange={setVehicleClassB}
              options={trainClasses} placeholder="Class" accentColor={pal.primary}/>
            <CustomSelect label="Train Type" value={trainTypeB} onChange={setTrainTypeB}
              options={trainTypes} placeholder="Type" accentColor={pal.primary}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <CustomSelect label="Zone" value={railwayZoneB} onChange={setRailwayZoneB}
              options={railwayZones} placeholder="Zone" accentColor={pal.primary}/>
            <div>
              <label style={labelCls}>Capacity</label>
              <input type="number" value={capacityB} onChange={e=>setCapacityB(e.target.value)}
                placeholder="72" min={18} max={120} style={{...iStyle,marginTop:6}}/>
            </div>
            <div>
              <label style={labelCls}>Dist KM</label>
              <input type="number" value={distanceB} onChange={e=>setDistanceB(e.target.value)}
                placeholder="200" min={10} max={3000} style={{...iStyle,marginTop:6}}/>
            </div>
          </div>
        </>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <CustomSelect label="Bus Type" value={busTypeB} onChange={setBusTypeB}
            options={busTypes} placeholder="Bus type" accentColor={pal.primary}/>
          <div>
            <label style={labelCls}>Capacity</label>
            <input type="number" value={busCapB} onChange={e=>setBusCapB(e.target.value)}
              placeholder="50" min={10} max={120} style={{...iStyle,marginTop:6}}/>
          </div>
        </div>
      )}

      {err&&(
        <div style={{borderRadius:10,padding:"10px 14px",background:"rgba(239,68,68,0.08)",
          border:"1.5px solid rgba(239,68,68,0.35)",display:"flex",alignItems:"center",gap:8}}>
          <AlertTriangle style={{width:14,height:14,color:"#ef4444",flexShrink:0}}/>
          <span style={{fontSize:12,color:"#ef4444"}}>{err}</span>
        </div>
      )}

      <Button onClick={predict} disabled={!valid||loading}
        className="w-full rounded-xl font-semibold"
        style={{ height:44,
          background:valid&&!loading?`linear-gradient(135deg,${pal.primary},${pal.dark})`:"hsl(var(--muted))",
          border:"none",
          color:valid&&!loading?"#fff":"hsl(var(--muted-foreground))",
          boxShadow:valid&&!loading?`0 4px 14px ${pal.primary}40`:"none" }}>
        {loading
          ? <><Loader2 className="mr-2 w-4 h-4 animate-spin"/>Predicting Route B…</>
          : <>{isTrain?<Train className="mr-2 w-4 h-4"/>:<Bus className="mr-2 w-4 h-4"/>}Predict Route B</>}
      </Button>
    </div>
  );
};

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ value, color, label, icon:Icon }) => {
  const r=28, circ=2*Math.PI*r;
  const [a,setA]=useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setA(value/100),400); return ()=>clearTimeout(t); },[value]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:64,height:64}}>
        <svg viewBox="0 0 72 72" style={{width:64,height:64,transform:"rotate(-90deg)"}}>
          <circle cx={36} cy={36} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={6}/>
          <motion.circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeLinecap="round" strokeDasharray={circ}
            initial={{strokeDashoffset:circ}} animate={{strokeDashoffset:circ-(a*circ)}}
            transition={{duration:1.2,ease:[.34,1.56,.64,1]}}
            style={{filter:`drop-shadow(0 0 5px ${color}70)`}}/>
        </svg>
        {Icon&&<Icon style={{position:"absolute",top:"50%",left:"50%",
          transform:"translate(-50%,-50%)",width:16,height:16,color}}/>}
      </div>
      <span style={{fontSize:10,color:"hsl(var(--muted-foreground))",fontWeight:600,
        letterSpacing:"0.04em",textAlign:"center",maxWidth:72}}>{label}</span>
    </div>
  );
};

// ─── Verdict Banner ───────────────────────────────────────────────────────────
const VerdictBanner = ({ winner, resultA, resultB, routeALabel, routeBLabel }) => {
  const cfgA=levelCfg[resultA.level];
  const cfgB=levelCfg[resultB.level];
  const isTie=winner==="tie";
  const winColor=isTie?"#94a3b8":winner==="A"?cfgA.color:cfgB.color;
  const winBg   =isTie?"rgba(148,163,184,0.06)":winner==="A"?cfgA.bg:cfgB.bg;
  const winBorder=isTie?"rgba(148,163,184,0.25)":winner==="A"?cfgA.border:cfgB.border;

  return (
    <motion.div initial={{opacity:0,scale:.97,y:12}} animate={{opacity:1,scale:1,y:0}}
      transition={{duration:.45,ease:[.34,1.56,.64,1]}}
      className="glass-card rounded-2xl overflow-hidden"
      style={{border:`1.5px solid ${winBorder}`,boxShadow:`0 8px 32px ${winColor}18`}}>

      <div style={{padding:"18px 22px",borderBottom:"1px solid hsl(var(--border))",background:winBg}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:isTie?0:14}}>
          <div style={{width:40,height:40,borderRadius:12,background:winColor,flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 4px 14px ${winColor}40`}}>
            {isTie?<Minus style={{width:18,height:18,color:"#fff"}}/>
                  :<Trophy style={{width:18,height:18,color:"#fff"}}/>}
          </div>
          <div>
            <div className="font-display font-bold" style={{fontSize:15,color:winColor}}>
              {isTie?"It's a tie — equally crowded"
               :winner==="A"?`Route A wins — ${routeALabel}`
               :`Route B wins — ${routeBLabel}`}
            </div>
            <div style={{fontSize:12,color:"hsl(var(--muted-foreground))",marginTop:3}}>
              {isTie?"Same occupancy level. Compare time, comfort, or fare."
               :`${Math.abs(resultA.percentage-resultB.percentage)}% occupancy difference`}
            </div>
          </div>
        </div>
        {!isTie&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",
              fontSize:11,color:"hsl(var(--muted-foreground))",marginBottom:6}}>
              <span>Route A — {resultA.percentage}%</span>
              <span>Route B — {resultB.percentage}%</span>
            </div>
            <div style={{display:"flex",height:7,borderRadius:4,overflow:"hidden",gap:2}}>
              <motion.div initial={{flex:0}} animate={{flex:resultA.percentage}}
                transition={{duration:1,ease:"easeOut"}}
                style={{background:cfgA.color,borderRadius:4,boxShadow:`0 0 6px ${cfgA.glow}`}}/>
              <motion.div initial={{flex:0}} animate={{flex:resultB.percentage}}
                transition={{duration:1,ease:"easeOut"}}
                style={{background:cfgB.color,borderRadius:4,boxShadow:`0 0 6px ${cfgB.glow}`}}/>
            </div>
          </div>
        )}
      </div>

      <div style={{padding:"18px 22px",display:"flex",justifyContent:"center",gap:28,
        borderBottom:"1px solid hsl(var(--border))"}}>
        <ScoreRing value={100-resultA.percentage} color={cfgA.color} label="Route A Comfort" icon={Shield}/>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:1,height:52,background:"hsl(var(--border))"}}/>
          <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.12em",
            color:"hsl(var(--muted-foreground))"}}>VS</span>
          <div style={{width:1,height:52,background:"hsl(var(--border))"}}/>
        </div>
        <ScoreRing value={100-resultB.percentage} color={cfgB.color} label="Route B Comfort" icon={Shield}/>
      </div>

      <div style={{padding:"14px 22px"}}>
        <div style={{padding:"12px 14px",borderRadius:10,background:"hsl(var(--muted)/0.4)",
          border:"1px solid hsl(var(--border))",fontSize:13,
          color:"hsl(var(--muted-foreground))",lineHeight:1.6}}>
          {isTie
            ?"Both routes have same crowd level. Compare departure times, fare class, or amenities."
            :winner==="A"
            ?`Route A has lower occupancy. ${resultA.suggestion}`
            :`Route B has lower occupancy. ${resultB.suggestion}`}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RouteComparePage() {
  const { mode }    = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();
  const isTrain     = mode==="train";
  const pal         = isTrain ? palette.train : palette.bus;
  const VehicleIcon = isTrain ? Train : Bus;

  const { baseResult, baseRoute } = location.state || {};
  const [routeBData, setRouteBData] = useState(null);

  const winner = routeBData
    ? levelOrder.indexOf(baseResult.level)<levelOrder.indexOf(routeBData.result.level)?"A"
      : levelOrder.indexOf(baseResult.level)>levelOrder.indexOf(routeBData.result.level)?"B"
      : baseResult.percentage<routeBData.result.percentage?"A"
      : baseResult.percentage>routeBData.result.percentage?"B":"tie"
    : null;

  if(!baseResult||!baseRoute) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No comparison data found.</p>
          <Button onClick={()=>navigate(-1)} className="rounded-xl"
            style={{background:`linear-gradient(135deg,${pal.primary},${pal.dark})`,
              border:"none",color:"#fff"}}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const routeAResult = {
    ...baseResult,
    hourlyData:[22,58,78,62,45,28].map(v=>
      Math.min(98,Math.max(5,Math.round(v*(0.7+baseResult.percentage/160))))),
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Header — same pattern as PredictionPage */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <motion.div whileHover={{scale:1.1}} whileTap={{scale:.95}}>
            <Button variant="ghost" size="icon" onClick={()=>navigate(-1)}
              className="rounded-xl hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5"/>
            </Button>
          </motion.div>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{background:`linear-gradient(135deg,${pal.primary},${pal.dark})`}}>
              <GitCompare className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground leading-none">
                Route Comparison
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isTrain?"Train":"Bus"} occupancy · ML-powered forecast
              </p>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:999,
            background:`${pal.primary}14`,border:`1.5px solid ${pal.primary}40`}}>
            <VehicleIcon style={{width:14,height:14,color:pal.primary}}/>
            <span style={{fontSize:12,fontWeight:700,color:pal.dark}}>
              {isTrain?"Train":"Bus"} Mode
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">

        {/* Section label */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.08}}
          style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{height:1,flex:1,background:`linear-gradient(to right,transparent,${pal.primary}45)`}}/>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:999,
            background:`${pal.primary}10`,border:`1px solid ${pal.primary}28`}}>
            <Activity style={{width:12,height:12,color:pal.primary}}/>
            <span style={{fontSize:11,fontWeight:700,color:pal.dark,letterSpacing:"0.07em"}}>
              LIVE COMPARISON
            </span>
          </div>
          <div style={{height:1,flex:1,background:`linear-gradient(to left,transparent,${pal.primary}45)`}}/>
        </motion.div>

        {/* Three-column: A | VS | B */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 48px 1fr",gap:16,alignItems:"start"}}>

          {/* A */}
          <div>
            <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
              color:"hsl(var(--muted-foreground))",marginBottom:10,
              display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:pal.primary,display:"inline-block"}}/>
              YOUR ROUTE (A)
            </p>
            <RouteCard label="A"
              route={`${baseRoute.sourceCity} → ${baseRoute.destCity}`}
              vehicle={isTrain
                ?`${baseRoute.vehicleClass} · ${baseRoute.trainType}`
                :`${baseRoute.busType} · ${baseRoute.capacity} seats`}
              result={routeAResult} pal={pal} isWinner={winner==="A"}/>
          </div>

          {/* VS */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",
            paddingTop:42,gap:8,height:"100%"}}>
            <div style={{width:1,height:80,background:"hsl(var(--border))"}}/>
            <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
              background:`linear-gradient(135deg,${pal.dark},${pal.primary})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 4px 14px ${pal.primary}30`,
              fontSize:11,fontWeight:800,color:"#fff",letterSpacing:"0.05em"}}>
              VS
            </div>
            <div style={{width:1,flex:1,minHeight:40,background:"hsl(var(--border))"}}/>
          </div>

          {/* B */}
          <div>
            <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
              color:"hsl(var(--muted-foreground))",marginBottom:10,
              display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",
                background:"hsl(var(--muted-foreground))",display:"inline-block"}}/>
              COMPARE ROUTE (B)
            </p>

            <AnimatePresence mode="wait">
              {routeBData ? (
                <motion.div key="res" initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>
                  <RouteCard label="B"
                    route={routeBData.routeLabel}
                    vehicle={routeBData.vehicleLabel}
                    result={routeBData.result} pal={pal} isWinner={winner==="B"}/>
                  <Button variant="outline" onClick={()=>setRouteBData(null)}
                    className="w-full mt-3 rounded-xl text-sm" style={{height:38}}>
                    ↩ Try a different route
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  className="glass-card rounded-2xl overflow-hidden"
                  style={{border:"1.5px solid hsl(var(--border))",
                    boxShadow:`0 8px 32px ${pal.primary}08`}}>
                  <div className="px-6 py-4 flex items-center gap-3"
                    style={{background:`linear-gradient(135deg,${pal.dark},${pal.mid})`,
                      borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                    <Zap className="w-4 h-4 text-white opacity-80"/>
                    <div>
                      <p className="font-display font-bold text-sm text-white leading-none">New Route</p>
                      <p style={{fontSize:11,color:"rgba(255,255,255,0.55)",marginTop:2}}>
                        Enter Route B details to compare
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <RouteForm isTrain={isTrain} pal={pal} baseRoute={baseRoute}
                      onResult={d=>setRouteBData(d)}/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Verdict */}
        <AnimatePresence>
          {routeBData&&winner&&(
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}
              exit={{opacity:0}} transition={{delay:.1}}>
              <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                color:"hsl(var(--muted-foreground))",marginBottom:10,
                display:"flex",alignItems:"center",gap:7}}>
                <Zap style={{width:11,height:11,color:pal.primary}}/>
                VERDICT
              </p>
              <VerdictBanner
                winner={winner}
                resultA={routeAResult}
                resultB={routeBData.result}
                routeALabel={`${baseRoute.sourceCity} → ${baseRoute.destCity}`}
                routeBLabel={routeBData.routeLabel}/>
            </motion.div>
          )}
        </AnimatePresence>

        {!routeBData&&(
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.35}}
            className="text-center text-sm text-muted-foreground pb-6">
            Fill in Route B details above to see a side-by-side comparison
          </motion.p>
        )}
      </div>
    </div>
  );
}