import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useHistory } from "@/contexts/HistoryContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { HistoryPanel } from "@/components/HistoryPanel";
import { NotificationPanel } from "@/components/NotificationPanel";
import { SaveToCalendarButton } from "@/components/SaveToCalendarButton";
import {
  ArrowLeft, Bus, Train, Loader2, MapPin, TrendingUp,
  Users, Clock, BarChart2, AlertTriangle, CheckCircle,
  Info, ChevronDown, Zap, Calendar, Sparkles, History, Bell,
  GitCompare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// const API_BASE = "http://localhost:8000" || " import.meta.env.VITE_API_BASE_URL";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const days   = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const monthToSeason: Record<string, string> = {
  January:"Winter", February:"Winter",
  March:"Spring",   April:"Spring",
  May:"Summer",     June:"Summer",
  July:"Monsoon",   August:"Monsoon", September:"Monsoon",
  October:"Autumn", November:"Autumn",
  December:"Winter",
};

const seasonEmoji: Record<string, string> = {
  Winter:"❄️", Spring:"🌸", Summer:"☀️", Monsoon:"🌧️", Autumn:"🍂",
};

const cities       = ["Hyderabad","Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Kadapa","Tirupati","Rajahmundry","Kakinada","Warangal","Nizamabad","Karimnagar","Khammam","Anantapur","Mumbai","Delhi","Bengaluru","Chennai","Kolkata","Pune","Ahmedabad","Jaipur","Lucknow","Bhopal"];
const trainClasses = ["Sleeper (SL)","Third AC (3A)","Second AC (2A)","First AC (1A)","AC Chair Car (CC)","Executive Chair Car (EC)","General (GN)"];
const trainTypes   = ["Express","Superfast","Mail","Passenger","Rajdhani","Shatabdi","Duronto","Jan Shatabdi","Garib Rath"];
const railwayZones = ["SCR","SR","CR","WR","NR","ER","SER","NER","ECR","NCR","NWR","SWR","WCR","ECoR","NFR"];

const TEAL      = "#0D9488";
const TEAL_DARK = "#134E4A";
const TEAL_MID  = "#0F766E";

type OccupancyLevel = "low" | "medium" | "high" | "very_high";

interface PredictionData {
  level: OccupancyLevel;
  percentage: number;
  suggestion: string;
  hourlyData: number[];
  weeklyData: number[];
  peakHour: number;
  estimatedPassengers: number;
  probabilities?: Record<string, number>;
  modelAccuracy?: number;
}

const levelCfg = {
  low:       { color:"#22c55e", glow:"rgba(34,197,94,0.3)",   bg:"rgba(34,197,94,0.08)",   label:"Low",       Icon:CheckCircle,   border:"rgba(34,197,94,0.35)"   },
  medium:    { color:"#f59e0b", glow:"rgba(245,158,11,0.3)",  bg:"rgba(245,158,11,0.08)",  label:"Moderate",  Icon:Info,          border:"rgba(245,158,11,0.35)"  },
  high:      { color:"#ef4444", glow:"rgba(239,68,68,0.3)",   bg:"rgba(239,68,68,0.08)",   label:"High",      Icon:AlertTriangle, border:"rgba(239,68,68,0.35)"   },
  very_high: { color:"#7c3aed", glow:"rgba(124,58,237,0.3)",  bg:"rgba(124,58,237,0.08)",  label:"Very High", Icon:AlertTriangle, border:"rgba(124,58,237,0.35)"  },
};

function mapLevel(apiLevel: string): OccupancyLevel {
  switch (apiLevel) {
    case "Low":       return "low";
    case "Moderate":  return "medium";
    case "High":      return "high";
    case "Very High": return "very_high";
    default:          return "medium";
  }
}

const formatHour = (h: number) =>
  h === 0 ? "12:00 AM" : h === 12 ? "12:00 PM" : h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const spring  = useSpring(0, { stiffness: 60, damping: 18 });
  const display = useTransform(spring, v => `${Math.round(v)}${suffix}`);
  useEffect(() => { spring.set(value); }, [value]);
  return <motion.span>{display}</motion.span>;
};

const SeasonBadge = ({ season }: { season: string }) => (
  <AnimatePresence mode="wait">
    <motion.div key={season}
      initial={{ opacity:0, scale:0.8, y:4 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.8 }}
      transition={{ duration:0.25 }}
      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:999,
        background:"rgba(13,148,136,0.12)", border:"1px solid rgba(13,148,136,0.3)",
        fontSize:12, fontWeight:600, color:TEAL_DARK }}>
      <Sparkles style={{ width:12, height:12 }}/>
      {seasonEmoji[season]} {season}
    </motion.div>
  </AnimatePresence>
);

const PortalDropdown = ({ anchorRef, open, options, value, onChange, onClose, accentColor = TEAL }: {
  anchorRef: React.RefObject<HTMLButtonElement>;
  open: boolean; options: string[]; value: string;
  onChange: (v: string) => void; onClose: () => void;
  accentColor?: string;
}) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => { if (open && anchorRef.current) setRect(anchorRef.current.getBoundingClientRect()); }, [open]);
  useEffect(() => {
    if (!open) return;
    const update = () => { if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect()); };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose(); };
    const tid = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => { clearTimeout(tid); document.removeEventListener("mousedown", handler); };
  }, [open]);
  if (!open || !rect) return null;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp = spaceBelow < 220 && rect.top > 220;
  const top = openUp ? rect.top + window.scrollY - 8 : rect.bottom + window.scrollY + 6;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity:0, y:openUp?8:-8, scaleY:0.94 }} animate={{ opacity:1, y:0, scaleY:1 }}
          exit={{ opacity:0, y:openUp?8:-8, scaleY:0.94 }} transition={{ duration:0.18 }}
          style={{ position:"absolute", top, left:rect.left+window.scrollX, width:rect.width,
            transformOrigin:openUp?"bottom":"top", zIndex:99999, borderRadius:"12px", overflow:"hidden",
            boxShadow:"0 16px 48px rgba(0,0,0,0.18)", background:"hsl(var(--card))", border:"1.5px solid hsl(var(--border))" }}>
          <div style={{ maxHeight:"200px", overflowY:"auto" }} className="py-1">
            {options.map(opt => (
              <button key={opt} type="button"
                onMouseDown={e => { e.preventDefault(); onChange(opt); onClose(); }}
                style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 16px", fontSize:"13px",
                  cursor:"pointer", color:value===opt ? accentColor : "hsl(var(--foreground))",
                  fontWeight:value===opt?600:400, background:"transparent", border:"none", transition:"background 0.12s" }}
                onMouseEnter={e => (e.currentTarget.style.background="rgba(13,148,136,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background="transparent")}>
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

const CustomSelect = ({ label, value, onChange, options, placeholder, icon: Icon, accentColor = TEAL, fontSize = "13px", padding = "11px 16px" }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; icon?: React.ElementType;
  accentColor?: string; fontSize?: string; padding?: string;
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="space-y-1.5">
      <label style={{ fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"hsl(var(--muted-foreground))" }}>
        {label}
      </label>
      <button ref={btnRef} type="button" onClick={() => setOpen(o => !o)}
        style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
          padding, borderRadius:"12px", fontSize, fontWeight:500, cursor:"pointer",
          background:"hsl(var(--card))",
          border:`1.5px solid ${open ? accentColor : "hsl(var(--border))"}`,
          color:value?"hsl(var(--foreground))":"hsl(var(--muted-foreground))",
          boxShadow:open?`0 0 0 3px ${accentColor}25`:"none",
          transition:"border-color 0.2s, box-shadow 0.2s" }}>
        <span style={{ display:"flex", alignItems:"center", gap:"8px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"85%" }}>
          {Icon && <Icon style={{ width:15, height:15, color:accentColor, flexShrink:0 }}/>}
          {value || placeholder}
        </span>
        <motion.div animate={{ rotate:open?180:0 }} transition={{ duration:0.2 }} style={{ flexShrink:0 }}>
          <ChevronDown style={{ width:15, height:15, color:"hsl(var(--muted-foreground))" }}/>
        </motion.div>
      </button>
      <PortalDropdown anchorRef={btnRef} open={open} options={options} value={value} onChange={onChange} onClose={() => setOpen(false)} accentColor={accentColor}/>
    </div>
  );
};

const GaugeChart = ({ pct, color, glow }: { pct: number; color: string; glow: string }) => {
  const r = 72, cx = 96, cy = 96;
  const circ = 2 * Math.PI * r, arc = circ * 0.75;
  const [animPct, setAnimPct] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimPct(pct), 120); return () => clearTimeout(t); }, [pct]);
  const dash = (animPct / 100) * arc;
  return (
    <svg viewBox="0 0 192 160" className="w-full max-w-[200px] mx-auto" style={{ overflow:"visible" }}>
      <defs><filter id="glowF"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={13}
        strokeDasharray={`${arc} ${circ-arc}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
      {[0,25,50,75,100].map(tick => {
        const angle = 135+(tick/100)*270, rad = angle*Math.PI/180;
        return <line key={tick} x1={cx+(r-18)*Math.cos(rad)} y1={cy+(r-18)*Math.sin(rad)}
          x2={cx+(r-10)*Math.cos(rad)} y2={cy+(r-10)*Math.sin(rad)} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.5}/>;
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={13} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ-dash}`} transform={`rotate(135 ${cx} ${cy})`} filter="url(#glowF)"
        style={{ transition:"stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}/>
      <text x={cx} y={cy-8} textAnchor="middle" fontSize={30} fontWeight={800} fill={color}
        style={{ filter:`drop-shadow(0 0 8px ${glow})` }}>{animPct}%</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.5} letterSpacing={2}>OCCUPANCY</text>
      <text x={18} y={148} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.4}>0%</text>
      <text x={174} y={148} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.4}>100%</text>
    </svg>
  );
};

const AnimatedBarChart = ({ data, color, labels, title }: { data: number[]; color: string; labels: string[]; title: string }) => {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 200); return () => clearTimeout(t); }, []);
  const max = Math.max(...data, 1);
  return (
    <div>
      <p style={{ fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"hsl(var(--muted-foreground))", marginBottom:14 }}>{title}</p>
      <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:128 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11, fontWeight:700, color, opacity:go?1:0, transition:`opacity 0.3s ${i*0.05}s` }}>{v}%</span>
            <div style={{ width:"100%", height:96, borderRadius:"6px 6px 0 0", background:"rgba(255,255,255,0.06)", position:"relative", overflow:"hidden" }}>
              <motion.div initial={{ height:"0%" }} animate={{ height:go?`${(v/max)*100}%`:"0%" }}
                transition={{ duration:0.7, delay:i*0.06, ease:[0.34,1.56,0.64,1] }}
                style={{ position:"absolute", bottom:0, left:0, right:0, borderRadius:"6px 6px 0 0",
                  background:`linear-gradient(to top, ${color}, ${color}88)`, boxShadow:`0 -2px 10px ${color}40` }}/>
            </div>
            <span style={{ fontSize:10, color:"hsl(var(--muted-foreground))", textAlign:"center", width:"100%" }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const steps = ["Route", "Schedule", "Details"];

const TrainPredictionPage = () => {
  const { type }    = useParams<{ type: string }>();
  const navigate    = useNavigate();
  const isBus       = type === "bus";
  const VehicleIcon = isBus ? Bus : Train;

  const { saveEntry, entries }            = useHistory();
  const { sendNotification, unreadCount } = useNotifications();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [histFlash, setHistFlash]     = useState(false);
  const [notifFlash, setNotifFlash]   = useState(false);

  const [step, setStep]             = useState(0);
  const [sourceCity, setSourceCity] = useState("");
  const [destCity, setDestCity]     = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [dateError, setDateError]   = useState("");
  const [day, setDay]               = useState("");
  const [month, setMonth]           = useState("");
  const [season, setSeason]         = useState("");
  const [hourOfDep, setHourOfDep]   = useState(8);
  const [vehicleClass, setVehicleClass]   = useState("");
  const [capacity, setCapacity]           = useState("72");
  const [trainType, setTrainType]         = useState("");
  const [railwayZone, setRailwayZone]     = useState("");
  const [routeDistance, setRouteDistance] = useState("200");

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<PredictionData | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleDateChange = (val: string) => {
    setTravelDate(val); setDateError(""); setDay(""); setMonth(""); setSeason("");
    if (!val) return;
    if (val < todayStr) { setDateError("Please select today or a future date."); return; }
    const d = new Date(val + "T00:00:00");
    if (isNaN(d.getTime())) return;
    const derivedDay   = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
    const derivedMonth = months[d.getMonth()];
    setDay(derivedDay); setMonth(derivedMonth); setSeason(monthToSeason[derivedMonth]);
  };

  const stepValid = [
    sourceCity && destCity && sourceCity !== destCity,
    travelDate && !dateError && day && month && season,
    vehicleClass && capacity && trainType && railwayZone && routeDistance,
  ];

  const handlePredict = async () => {
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch(`${API_BASE}/predict/train`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          day_of_week: day, month, season,
          departure_hour: hourOfDep,
          source_station: sourceCity, destination_station: destCity,
          travel_class: vehicleClass, train_type: trainType,
          railway_zone: railwayZone, seat_capacity: Number(capacity),
          route_distance_km: Number(routeDistance), is_holiday: 0,
          is_weekend: ["Saturday","Sunday"].includes(day) ? 1 : 0,
          is_peak_hour: (hourOfDep>=7&&hourOfDep<=10)||(hourOfDep>=17&&hourOfDep<=20) ? 1 : 0,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      const level    = mapLevel(data.occupancy_level);
      const apiLevel = data.occupancy_level as string;
      const pct      = Math.round(data.occupancy_percentage);

      const suggestions: Record<OccupancyLevel, string> = {
        high:"Peak period — book your ticket immediately!",
        very_high:"Extremely busy! Book Tatkal or consider alternate train.",
        medium:"Moderate crowd expected. Comfortable travel likely.",
        low:"Great time to travel. Plenty of room available!",
      };

      const seed       = pct / 100;
      const hourlyData = [22,58,78,62,45,28].map(v => Math.min(98, Math.max(5, Math.round(v*(0.7+seed*0.6)))));
      const weeklyData = [65,80,55,72,88,42,35].map(v => Math.min(98, Math.max(5, Math.round(v*(0.7+seed*0.6)))));

      setResult({
        level, percentage:pct, suggestion:suggestions[level],
        hourlyData, weeklyData,
        peakHour: hourlyData.indexOf(Math.max(...hourlyData)) * 4,
        estimatedPassengers: data.estimated_passengers ?? Math.round((pct/100)*Number(capacity)),
        probabilities: data.probabilities,
        modelAccuracy: data.model_accuracy,
      });

      saveEntry({ type:"train", sourceCity, destCity, travelDate, day, month, season, hourOfDep,
        vehicleClass, capacity:Number(capacity),
        occupancyLevel:apiLevel, occupancyPercentage:pct,
        estimatedPassengers: data.estimated_passengers ?? Math.round((pct/100)*Number(capacity)),
        suggestion:suggestions[level] });

      setHistFlash(true); setTimeout(() => setHistFlash(false), 2000);

      if (level === "high" || level === "very_high") {
        sendNotification({
          title: level==="very_high" ? `🚨 Very High Occupancy — ${trainType} Train` : `⚠️ High Occupancy — ${trainType} Train`,
          body: level==="very_high"
            ? `${sourceCity} → ${destCity} (${vehicleClass}) on ${day} at ${formatHour(hourOfDep)} is extremely crowded (${pct}%). Book Tatkal or find alternate!`
            : `${sourceCity} → ${destCity} (${vehicleClass}) on ${day} at ${formatHour(hourOfDep)} is ${pct}% full. Book your ticket soon!`,
          type:"train", level:apiLevel, route:`${sourceCity} → ${destCity}`,
        });
        setNotifFlash(true); setTimeout(() => setNotifFlash(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to get prediction. Is the API server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompare = () => {
    if (!result) return;
    navigate("/compare/train", {
      state: {
        baseResult: {
          level: result.level,
          percentage: result.percentage,
          estimatedPassengers: result.estimatedPassengers,
          suggestion: result.suggestion,
        },
        baseRoute: {
          sourceCity, destCity, day, month, season, hourOfDep,
          vehicleClass, trainType, railwayZone, capacity, routeDistance,
        },
      },
    });
  };

  const cfg = result ? levelCfg[result.level] : null;

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <motion.div whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}>
            <Button variant="ghost" size="icon" onClick={() => navigate("/select")} className="rounded-xl hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5"/>
            </Button>
          </motion.div>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background:`linear-gradient(135deg,${TEAL},${TEAL_DARK})` }}>
              <VehicleIcon className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground leading-none">Train Occupancy Prediction</h1>
              <p className="text-xs text-muted-foreground mt-0.5">ML-powered crowd forecasting</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              onClick={() => { setNotifOpen(o => !o); setHistoryOpen(false); }}
              style={{ position:"relative", display:"flex", alignItems:"center", gap:6,
                padding:"8px 12px", borderRadius:12,
                background: notifOpen ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)",
                border:`1.5px solid ${notifFlash||notifOpen ? "#ef4444" : "rgba(239,68,68,0.3)"}`,
                color: notifFlash||notifOpen ? "#ef4444" : "hsl(var(--muted-foreground))",
                cursor:"pointer", transition:"all 0.2s" }}>
              <motion.div animate={notifFlash ? { rotate:[0,-15,15,-10,10,0], scale:[1,1.2,1] } : {}} transition={{ duration:0.5 }}>
                <Bell style={{ width:15, height:15 }}/>
              </motion.div>
              {unreadCount > 0 && (
                <motion.span initial={{ scale:0 }} animate={{ scale:1 }}
                  style={{ position:"absolute", top:-5, right:-5, minWidth:16, height:16, borderRadius:8,
                    background:"#ef4444", color:"white", fontSize:10, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px",
                    boxShadow:"0 0 0 2px hsl(var(--background))" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </motion.button>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              onClick={() => { setHistoryOpen(o => !o); setNotifOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: historyOpen ? `rgba(13,148,136,0.15)` : `rgba(13,148,136,0.08)`,
                border:`1.5px solid ${histFlash||historyOpen ? TEAL : "rgba(13,148,136,0.3)"}`,
                color: histFlash||historyOpen ? TEAL_DARK : "hsl(var(--muted-foreground))",
                cursor:"pointer", transition:"all 0.2s" }}>
              <History style={{ width:15, height:15 }}/>
              <span className="hidden sm:inline">History</span>
              {entries.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                  style={{ background:TEAL, fontSize:10 }}>
                  {entries.length > 9 ? "9+" : entries.length}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)}/>
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)}/>

      <div className="transition-all duration-300" style={{ marginRight:(historyOpen||notifOpen) ? 288 : 0 }}>
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">

          {/* Step Indicator */}
          <div style={{ display:"flex", alignItems:"center" }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display:"flex", alignItems:"center", flex:1 }}>
                <button onClick={() => i < step && setStep(i)}
                  style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none",
                    cursor:i<step?"pointer":"default", padding:0 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0,
                    background: i<=step ? TEAL : "#3f3f46",
                    color: i<=step ? "#fff" : "#a1a1aa",
                    transform: i===step ? "scale(1.15)" : "scale(1)", transition:"background 0.3s, transform 0.3s" }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize:12, fontWeight:600,
                    color: i===step ? TEAL_DARK : "hsl(var(--muted-foreground))", transition:"color 0.3s" }}>{s}</span>
                </button>
                {i < steps.length - 1 && (
                  <div style={{ flex:1, height:1, margin:"0 12px",
                    background: i<step ? TEAL : "hsl(var(--border))", transition:"background 0.4s" }}/>
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl overflow-hidden"
            style={{ border:"1.5px solid hsl(var(--border))", boxShadow:`0 8px 40px rgba(13,148,136,0.06)` }}>
            <div className="px-8 py-5 flex items-center gap-3"
              style={{ background:`linear-gradient(135deg,${TEAL_DARK},${TEAL_MID})` }}>
              <Zap className="w-5 h-5 opacity-90 text-white"/>
              <div>
                <p className="font-display font-bold text-base leading-none text-white">{steps[step]}</p>
                <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.55)" }}>
                  {step===0 && "Where are you travelling?"}
                  {step===1 && "When are you travelling?"}
                  {step===2 && "Train details"}
                </p>
              </div>
            </div>

            <div className="p-7">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.28 }} className="space-y-5">
                    <CustomSelect label="Source City" value={sourceCity} onChange={setSourceCity} options={cities} placeholder="From where?" icon={MapPin}/>
                    <AnimatePresence>
                      {sourceCity && (
                        <motion.div initial={{ opacity:0, scaleX:0 }} animate={{ opacity:1, scaleX:1 }}
                          style={{ display:"flex", alignItems:"center", gap:12, padding:"0 4px" }}>
                          <div style={{ flex:1, height:1, background:`linear-gradient(to right, rgba(13,148,136,0.2), ${TEAL})` }}/>
                          <Train style={{ width:18, height:18, color:TEAL }}/>
                          <div style={{ flex:1, height:1, background:`linear-gradient(to right, ${TEAL}, rgba(13,148,136,0.2))` }}/>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <CustomSelect label="Destination City" value={destCity} onChange={setDestCity}
                      options={cities.filter(c => c !== sourceCity)} placeholder="Going to?" icon={MapPin}/>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.28 }} className="space-y-5">
                    <div className="space-y-1.5">
                      <label style={{ fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase",
                        color:"hsl(var(--muted-foreground))", display:"flex", alignItems:"center", gap:6 }}>
                        <Calendar style={{ width:13, height:13, color:TEAL }}/> Travel Date
                      </label>
                      <input type="date" min={todayStr} value={travelDate}
                        onChange={e => handleDateChange(e.target.value)}
                        style={{ width:"100%", padding:"11px 16px", borderRadius:"12px", fontSize:"13px", fontWeight:500,
                          cursor:"pointer", background:"hsl(var(--card))",
                          border:`1.5px solid ${dateError ? "#ef4444" : travelDate && !dateError ? TEAL : "hsl(var(--border))"}`,
                          color: travelDate ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                          boxShadow: dateError ? "0 0 0 3px rgba(239,68,68,0.12)" : travelDate && !dateError ? "0 0 0 3px rgba(13,148,136,0.15)" : "none",
                          outline:"none", transition:"border-color 0.2s, box-shadow 0.2s", colorScheme:"dark" }}/>
                      <AnimatePresence>
                        {dateError && (
                          <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
                            style={{ fontSize:12, color:"#ef4444", display:"flex", alignItems:"center", gap:5, marginTop:4 }}>
                            <AlertTriangle style={{ width:12, height:12, flexShrink:0 }}/> {dateError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {travelDate && !dateError && day && (
                        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
                          style={{ display:"flex", flexWrap:"wrap", gap:8, padding:"12px 16px", borderRadius:12,
                            background:"rgba(13,148,136,0.05)", border:"1px dashed rgba(13,148,136,0.3)" }}>
                          <div style={{ fontSize:11, fontWeight:600, color:"hsl(var(--muted-foreground))", width:"100%",
                            letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4 }}>Auto-detected from date</div>
                          <motion.span key={day} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
                            style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:999,
                              background:"hsl(var(--muted) / 0.5)", fontSize:12, fontWeight:600, color:"hsl(var(--foreground))" }}>
                            📅 {day}
                          </motion.span>
                          <motion.span key={month} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.05 }}
                            style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:999,
                              background:"hsl(var(--muted) / 0.5)", fontSize:12, fontWeight:600, color:"hsl(var(--foreground))" }}>
                            🗓️ {month}
                          </motion.span>
                          {season && <SeasonBadge season={season}/>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="space-y-2">
                      <label style={{ fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase",
                        color:"hsl(var(--muted-foreground))", display:"flex", alignItems:"center", gap:6 }}>
                        <Clock style={{ width:13, height:13, color:TEAL }}/> Hour of Departure
                      </label>
                      <div className="glass-card rounded-xl p-4" style={{ border:"1.5px solid hsl(var(--border))" }}>
                        <div style={{ textAlign:"center", marginBottom:10 }}>
                          <span className="font-display text-2xl font-bold" style={{ color:TEAL_DARK }}>{formatHour(hourOfDep)}</span>
                        </div>
                        <input type="range" min={0} max={23} value={hourOfDep}
                          onChange={e => setHourOfDep(Number(e.target.value))}
                          className="w-full cursor-pointer" style={{ accentColor:TEAL }}/>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"hsl(var(--muted-foreground))", marginTop:6 }}>
                          {["12AM","6AM","12PM","6PM","11PM"].map(t => <span key={t}>{t}</span>)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.28 }} className="space-y-5">
                    <CustomSelect label="Train Class" value={vehicleClass} onChange={setVehicleClass} options={trainClasses} placeholder="Select train class"/>
                    <CustomSelect label="Train Type" value={trainType} onChange={setTrainType} options={trainTypes} placeholder="Select train type"/>
                    <CustomSelect label="Railway Zone" value={railwayZone} onChange={setRailwayZone} options={railwayZones} placeholder="Select zone e.g. SCR"/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div className="space-y-1.5">
                        <label style={{ fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase",
                          color:"hsl(var(--muted-foreground))", display:"flex", alignItems:"center", gap:6 }}>
                          <Users style={{ width:13, height:13, color:TEAL }}/> Coach Capacity
                        </label>
                        <Input type="number" placeholder="e.g. 72" min={18} max={120} value={capacity}
                          onChange={e => setCapacity(e.target.value)} className="rounded-xl"
                          style={{ border:"1.5px solid hsl(var(--border))", background:"hsl(var(--card))", padding:"11px 16px", fontSize:13 }}/>
                        <p style={{ fontSize:10, color:"hsl(var(--muted-foreground))" }}>SL/3A=72, 2A=46, 1A=18</p>
                      </div>
                      <div className="space-y-1.5">
                        <label style={{ fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase",
                          color:"hsl(var(--muted-foreground))", display:"flex", alignItems:"center", gap:6 }}>
                          <MapPin style={{ width:13, height:13, color:TEAL }}/> Distance (KM)
                        </label>
                        <Input type="number" placeholder="e.g. 200" min={10} max={3000} value={routeDistance}
                          onChange={e => setRouteDistance(e.target.value)} className="rounded-xl"
                          style={{ border:"1.5px solid hsl(var(--border))", background:"hsl(var(--card))", padding:"11px 16px", fontSize:13 }}/>
                      </div>
                    </div>
                    <AnimatePresence>
                      {vehicleClass && (
                        <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                          style={{ padding:"10px 14px", borderRadius:10, background:"rgba(13,148,136,0.06)",
                            border:`1px solid rgba(13,148,136,0.25)`, fontSize:12, color:"hsl(var(--muted-foreground))",
                            display:"flex", alignItems:"center", gap:8 }}>
                          <Train style={{ width:14, height:14, color:TEAL, flexShrink:0 }}/>
                          <span>
                            {vehicleClass==="Sleeper (SL)"             && "Non-AC berths. High demand on weekends & holidays."}
                            {vehicleClass==="Third AC (3A)"            && "AC 3-tier berths. Most popular class for long-distance travel."}
                            {vehicleClass==="Second AC (2A)"           && "AC 2-tier berths. Comfortable with privacy curtains."}
                            {vehicleClass==="First AC (1A)"            && "Premium AC cabin. Lowest occupancy, premium fares."}
                            {vehicleClass==="AC Chair Car (CC)"        && "Reserved AC seats. Popular for day intercity routes."}
                            {vehicleClass==="Executive Chair Car (EC)" && "Business-class seating on premium trains like Shatabdi."}
                            {vehicleClass==="General (GN)"             && "Unreserved. Very high crowd during peak travel periods."}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div style={{ borderRadius:12, padding:16, background:"rgba(13,148,136,0.06)", border:"1px dashed rgba(13,148,136,0.4)" }}>
                      <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:TEAL_DARK, marginBottom:10 }}>Trip Summary</p>
                      {[
                        ["Route",    `${sourceCity} → ${destCity}`],
                        ["Date",     travelDate ? new Date(travelDate+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "—"],
                        ["Day",      day || "—"],
                        ["Season",   season ? `${seasonEmoji[season]??""} ${season}` : "—"],
                        ["Departure",formatHour(hourOfDep)],
                        ["Zone",     railwayZone || "—"],
                        ["Distance", routeDistance ? `${routeDistance} KM` : "—"],
                      ].map(([k,v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                          <span style={{ color:"hsl(var(--muted-foreground))" }}>{k}</span>
                          <span style={{ fontWeight:600, color:"hsl(var(--foreground))" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nav Buttons */}
              <div style={{ display:"flex", gap:12, marginTop:28 }}>
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(s => s-1)} className="flex-1 rounded-xl" style={{ height:44 }}>Back</Button>
                )}
                {step < 2 ? (
                  <Button onClick={() => setStep(s => s+1)} disabled={!stepValid[step]}
                    className="flex-1 rounded-xl font-semibold text-white"
                    style={{ height:44, background:`linear-gradient(135deg,${TEAL},${TEAL_DARK})`, border:"none",
                      boxShadow: stepValid[step] ? `0 4px 14px rgba(13,148,136,0.35)` : "none" }}>
                    Continue
                  </Button>
                ) : (
                  <Button onClick={handlePredict} disabled={!stepValid[2]||loading}
                    className="flex-1 rounded-xl font-semibold text-white"
                    style={{ height:44, background:`linear-gradient(135deg,${TEAL},${TEAL_DARK})`, border:"none",
                      boxShadow: stepValid[2] && !loading ? `0 4px 14px rgba(13,148,136,0.35)` : "none" }}>
                    {loading ? <><Loader2 className="mr-2 w-4 h-4 animate-spin"/>Predicting…</> : <><TrendingUp className="mr-2 w-4 h-4"/>Predict Occupancy</>}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Loading */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="glass-card rounded-2xl p-8"
                style={{ border:"1.5px solid hsl(var(--border))", display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
                <div style={{ position:"relative", width:56, height:56 }}>
                  <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1.4, ease:"linear" }}
                    style={{ position:"absolute", inset:0, borderRadius:"50%", border:`3px solid rgba(13,148,136,0.2)`, borderTopColor:TEAL }}/>
                  <Train style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:22, height:22, color:TEAL }}/>
                </div>
                <div style={{ textAlign:"center" }}>
                  <p className="font-display font-bold text-foreground">Running ML model…</p>
                  <p className="text-muted-foreground text-sm" style={{ marginTop:4 }}>Analysing route patterns</p>
                </div>
                <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:8 }}>
                  {[80,60,90].map((w,i) => (
                    <motion.div key={i} animate={{ opacity:[0.3,1,0.3] }} transition={{ repeat:Infinity, duration:1.4, delay:i*0.2 }}
                      style={{ height:10, borderRadius:6, background:"hsl(var(--muted))", width:`${w}%` }}/>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ borderRadius:16, padding:"16px 20px", background:"rgba(239,68,68,0.08)",
                  border:"1.5px solid rgba(239,68,68,0.35)", display:"flex", alignItems:"center", gap:12 }}>
                <AlertTriangle style={{ width:18, height:18, color:"#ef4444", flexShrink:0 }}/>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"#ef4444" }}>Prediction failed</p>
                  <p style={{ fontSize:12, color:"hsl(var(--muted-foreground))", marginTop:2 }}>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && cfg && !loading && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-5">

                {result.modelAccuracy && (
                  <div style={{ display:"flex", justifyContent:"flex-end" }}>
                    <span style={{ fontSize:11, padding:"4px 10px", borderRadius:20, background:"rgba(13,148,136,0.1)",
                      color:TEAL_DARK, fontWeight:600, border:`1px solid rgba(13,148,136,0.3)` }}>
                      Model accuracy: {(result.modelAccuracy*100).toFixed(1)}%
                    </span>
                  </div>
                )}

                {(result.level==="high"||result.level==="very_high") && (
                  <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                    style={{ borderRadius:12, padding:"12px 16px",
                      background: result.level==="very_high" ? "rgba(124,58,237,0.1)" : "rgba(239,68,68,0.08)",
                      border:`1.5px solid ${result.level==="very_high" ? "rgba(124,58,237,0.4)" : "rgba(239,68,68,0.35)"}`,
                      display:"flex", alignItems:"center", gap:10 }}>
                    <motion.div animate={{ scale:[1,1.2,1] }} transition={{ repeat:3, duration:0.4 }}>
                      <Bell style={{ width:16, height:16, color: result.level==="very_high"?"#7c3aed":"#ef4444", flexShrink:0 }}/>
                    </motion.div>
                    <p style={{ fontSize:12, color:"hsl(var(--foreground))", fontWeight:500 }}>
                      {result.level==="very_high"
                        ? "🚨 Alert sent! Very high occupancy — check notifications for details."
                        : "⚠️ Alert sent! High occupancy detected — check your notification bell."}
                    </p>
                  </motion.div>
                )}

                {/* Main result card */}
                <motion.div initial={{ opacity:0, y:40, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
                  transition={{ duration:0.5, ease:[0.34,1.56,0.64,1] }}
                  className="glass-card rounded-2xl overflow-hidden"
                  style={{ border:`1.5px solid ${cfg.border}`, boxShadow:`0 8px 40px ${cfg.glow}` }}>
                  <div style={{ padding:"14px 28px", display:"flex", alignItems:"center", gap:10,
                    background:cfg.bg, borderBottom:`1px solid ${cfg.border}` }}>
                    <cfg.Icon style={{ width:18, height:18, color:cfg.color }}/>
                    <span className="font-display font-bold text-lg" style={{ color:cfg.color }}>{cfg.label} Occupancy Detected</span>
                  </div>
                  <div className="p-7">
                    <div style={{ display:"flex", flexDirection:"column", gap:28, alignItems:"center" }}>
                      <div style={{ width:200, flexShrink:0 }}>
                        <GaugeChart pct={result.percentage} color={cfg.color} glow={cfg.glow}/>
                      </div>
                      <div style={{ width:"100%" }} className="space-y-4">
                        <p className="text-muted-foreground text-sm">{result.suggestion}</p>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                          {[
                            { label:"Berths",    value:<><AnimatedNumber value={result.estimatedPassengers}/><span style={{opacity:.6}}>/{capacity}</span></>, Ic:Users },
                            { label:"Peak Hour", value:`${result.peakHour}:00`, Ic:Clock },
                            { label:"Occupancy", value:<AnimatedNumber value={result.percentage} suffix="%"/>, Ic:BarChart2 },
                          ].map(({ label, value, Ic }) => (
                            <div key={label} style={{ borderRadius:12, padding:12, textAlign:"center", background:cfg.bg, border:`1px solid ${cfg.border}` }}>
                              <Ic style={{ width:15, height:15, color:cfg.color, margin:"0 auto 4px" }}/>
                              <div style={{ fontSize:11, color:"hsl(var(--muted-foreground))", marginBottom:3 }}>{label}</div>
                              <div style={{ fontSize:13, fontWeight:700, color:"hsl(var(--foreground))" }}>{value}</div>
                            </div>
                          ))}
                        </div>
                        {result.probabilities && (
                          <div style={{ borderRadius:12, padding:14, background:"hsl(var(--muted)/0.3)", border:"1px solid hsl(var(--border))" }}>
                            <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase",
                              color:"hsl(var(--muted-foreground))", marginBottom:10 }}>Confidence Breakdown</p>
                            {Object.entries(result.probabilities).sort(([,a],[,b]) => b-a).map(([cls, prob]) => (
                              <div key={cls} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                                <span style={{ fontSize:12, color:"hsl(var(--foreground))", width:70, flexShrink:0 }}>{cls}</span>
                                <div style={{ flex:1, height:6, borderRadius:3, background:"hsl(var(--border))", overflow:"hidden" }}>
                                  <motion.div initial={{ width:0 }} animate={{ width:`${prob*100}%` }}
                                    transition={{ duration:0.8, ease:"easeOut" }}
                                    style={{ height:"100%", borderRadius:3, background:cfg.color }}/>
                                </div>
                                <span style={{ fontSize:12, fontWeight:600, color:cfg.color, width:36, textAlign:"right" }}>{(prob*100).toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Compare Button */}
                <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
                  <Button
                    onClick={handleOpenCompare}
                    className="w-full rounded-xl font-semibold"
                    style={{ height:48,
                      background:`linear-gradient(135deg,rgba(13,148,136,0.12),rgba(19,78,74,0.12))`,
                      border:`1.5px solid rgba(13,148,136,0.45)`,
                      color: TEAL_DARK,
                      boxShadow:`0 4px 20px rgba(13,148,136,0.15)`,
                      transition:"all 0.2s" }}>
                    <GitCompare className="mr-2 w-4 h-4"/>
                    Compare with another route
                    <span style={{ marginLeft:8, fontSize:10, padding:"2px 8px", borderRadius:999,
                      background:`rgba(13,148,136,0.2)`, color:TEAL_DARK, fontWeight:700 }}>
                      OPEN FULL PAGE
                    </span>
                  </Button>
                </motion.div>

                {/* ── Save to Calendar Button ── */}
                <SaveToCalendarButton
                  travelDate={travelDate}
                  hourOfDep={hourOfDep}
                  sourceCity={sourceCity}
                  destCity={destCity}
                  vehicleType="train"
                  vehicleClass={vehicleClass}
                  occupancyLevel={
                    result.level === "very_high" ? "Very High" :
                    result.level === "high"      ? "High"      :
                    result.level === "medium"    ? "Moderate"  : "Low"
                  }
                  occupancyPct={result.percentage}
                  suggestion={result.suggestion}
                  accentColor={TEAL}
                />

                {/* Charts */}
                <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                  className="glass-card rounded-2xl p-7" style={{ border:"1.5px solid hsl(var(--border))" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
                    <BarChart2 style={{ width:18, height:18, color:TEAL }}/>
                    <h3 className="font-display font-bold text-foreground">Occupancy Charts</h3>
                  </div>
                  <div className="space-y-8">
                    <AnimatedBarChart data={result.hourlyData} color={cfg.color} labels={["0–4h","4–8h","8–12h","12–16h","16–20h","20–24h"]} title="Hourly Trend Today"/>
                    <div style={{ height:1, background:"hsl(var(--border) / 0.5)" }}/>
                    <AnimatedBarChart data={result.weeklyData} color={TEAL} labels={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]} title="Weekly Pattern"/>
                  </div>
                </motion.div>

                {/* Tips */}
                <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
                  className="glass-card rounded-2xl p-7" style={{ border:"1.5px solid hsl(var(--border))" }}>
                  <h3 className="font-display font-bold text-foreground" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                    <Zap style={{ width:16, height:16, color:TEAL }}/> Smart Travel Tips
                  </h3>
                  <ul className="space-y-3">
                    {(result.level==="high"||result.level==="very_high" ? [
                      { dot:cfg.color, text:"Book your train ticket well in advance — waitlisted tickets may not get confirmed." },
                      { dot:cfg.color, text:"Check Tatkal quota if regular tickets are unavailable." },
                      { dot:cfg.color, text:"Consider an alternate train or travel date if possible." },
                    ] : result.level==="medium" ? [
                      { dot:cfg.color, text:"Check PNR status regularly — your waitlisted ticket may get confirmed." },
                      { dot:cfg.color, text:"Arrive at the platform early to find your coach easily." },
                    ] : [
                      { dot:cfg.color, text:"This is an ideal time to travel — relax and enjoy!" },
                      { dot:cfg.color, text:"You may be able to choose your preferred berth position." },
                    ]).concat([
                      { dot:TEAL, text:`${season} season can affect occupancy — plan ahead for holidays.` },
                      { dot:TEAL, text:`${vehicleClass} coaches typically see higher demand on ${day}s.` },
                    ]).map(({ dot, text }, i) => (
                      <motion.li key={i} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4+i*0.07 }}
                        style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:13,
                          color:"hsl(var(--muted-foreground))", listStyle:"none" }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:dot, flexShrink:0, marginTop:5 }}/>
                        {text}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default TrainPredictionPage;