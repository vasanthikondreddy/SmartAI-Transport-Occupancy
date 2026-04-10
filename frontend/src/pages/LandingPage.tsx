import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Bus, Clock, ArrowRight, Brain, Zap,
  TrendingUp, Shield, Train, MapPin, CheckCircle,
  ChevronRight, Plus, Activity, Route, Users,
} from "lucide-react";
import { useState, useRef } from "react";
import heroImg from "@/assets/hero-transport.jpg";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:           "#faf7f2",
  bgAlt:        "#f5ede0",
  surface:      "#ffffff",
  surfaceWarm:  "#fffbf5",
  border:       "rgba(180,100,20,0.12)",
  borderMid:    "rgba(180,100,20,0.22)",
  borderStrong: "rgba(180,100,20,0.35)",
  text:         "#1a0f00",
  textSub:      "#6b4f2c",
  textMuted:    "#a07850",
  textFaint:    "#c4a07a",
  amber:        "#d97706",
  amberLight:   "#f59e0b",
  amberPale:    "#fef3c7",
  amberGlow:    "rgba(217,119,6,0.18)",
  orange:       "#ea580c",
  teal:         "#0d9488",
  tealPale:     "rgba(13,148,136,0.08)",
  red:          "#dc2626",
};

// ── Responsive hook ────────────────────────────────────────────────────────
import { useEffect } from "react";
const useBreakpoint = () => {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("desktop");
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
};

// ── Subtle warm background ─────────────────────────────────────────────────
const PageBg = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
    <div style={{
      position: "absolute", inset: 0,
      background: `radial-gradient(ellipse 75% 50% at 80% -5%, ${C.amberPale} 0%, transparent 55%)`,
    }} />
    <div style={{
      position: "absolute", inset: 0,
      background: `radial-gradient(ellipse 50% 40% at -2% 95%, rgba(234,88,12,0.06) 0%, transparent 55%)`,
    }} />
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.035 }}>
      <defs>
        <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill={C.amber} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
    <motion.div
      animate={{ y: [0, -28, 0], opacity: [0.35, 0.6, 0.35] }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute", top: "12%", right: "5%",
        width: 380, height: 380, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)`,
        filter: "blur(48px)",
      }}
    />
    <motion.div
      animate={{ y: [0, 24, 0], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      style={{
        position: "absolute", bottom: "20%", left: "3%",
        width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)`,
        filter: "blur(56px)",
      }}
    />
  </div>
);

// ── Section label pill ─────────────────────────────────────────────────────
const Pill = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "5px 15px", borderRadius: 999,
    background: C.amberPale, border: `1px solid rgba(217,119,6,0.28)`,
    marginBottom: 16,
  }}>
    <Icon style={{ width: 11, height: 11, color: C.amber }} />
    <span style={{
      fontSize: 10, fontWeight: 800, color: C.amber,
      letterSpacing: "0.1em", textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
    }}>
      {label}
    </span>
  </div>
);

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({
  value, label, icon: Icon, delay,
}: { value: string; label: string; icon: any; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -5, boxShadow: `0 20px 56px rgba(217,119,6,0.12)` }}
    style={{
      padding: "28px 20px", borderRadius: 24, background: C.surface,
      border: `1.5px solid ${C.border}`, textAlign: "center",
      boxShadow: "0 2px 16px rgba(217,119,6,0.05)",
      transition: "box-shadow 0.3s",
    }}
  >
    <div style={{
      width: 50, height: 50, borderRadius: 14,
      background: C.amberPale, border: `1px solid rgba(217,119,6,0.2)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 14px",
    }}>
      <Icon style={{ width: 22, height: 22, color: C.amber }} />
    </div>
    <div style={{
      fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, letterSpacing: "-0.05em",
      color: C.text, lineHeight: 1,
      fontFamily: "'Syne', 'DM Sans', sans-serif",
    }}>
      {value}
    </div>
    <div style={{
      fontSize: 11, color: C.textFaint, marginTop: 10, fontWeight: 700,
      letterSpacing: "0.07em", textTransform: "uppercase",
    }}>
      {label}
    </div>
  </motion.div>
);

// ── Vehicle card ───────────────────────────────────────────────────────────
const VehicleCard = ({
  icon: Icon, type, badge, badgeColor, badgeBg,
  stats, desc, delay, onClick, accent,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.65 }}
    whileHover={{ y: -8, boxShadow: `0 28px 72px rgba(217,119,6,0.15)` }}
    onClick={onClick}
    style={{
      borderRadius: 32, background: C.surface, border: `1.5px solid ${C.border}`,
      padding: "clamp(24px,4vw,44px) clamp(20px,3.5vw,40px)",
      cursor: "pointer", position: "relative",
      overflow: "hidden", boxShadow: "0 4px 28px rgba(217,119,6,0.05)",
      transition: "box-shadow 0.35s",
    }}
  >
    <div style={{
      position: "absolute", top: 0, right: 0, width: 160, height: 160,
      background: `radial-gradient(circle at top right, ${C.amberPale}, transparent 65%)`,
    }} />
    <div style={{
      position: "absolute", bottom: 0, left: 0,
      width: "100%", height: 4,
      background: `linear-gradient(90deg, ${accent}, transparent)`,
    }} />
    <div style={{
      display: "flex", alignItems: "flex-start",
      justifyContent: "space-between", marginBottom: 24,
    }}>
      <div style={{
        width: 62, height: 62, borderRadius: 18,
        background: C.amberPale, border: `1.5px solid ${C.borderMid}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon style={{ width: 30, height: 30, color: C.amber }} />
      </div>
      <span style={{
        fontSize: 10, fontWeight: 800, padding: "5px 13px", borderRadius: 999,
        background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}35`,
        letterSpacing: "0.07em", textTransform: "uppercase",
        fontFamily: "'DM Mono', monospace",
      }}>
        {badge}
      </span>
    </div>
    <h3 style={{
      fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 900, color: C.text,
      letterSpacing: "-0.03em", marginBottom: 12,
      fontFamily: "'Syne', 'DM Sans', sans-serif",
    }}>
      {type}
    </h3>
    <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.8, marginBottom: 24 }}>
      {desc}
    </p>
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 28 }}>
      {stats.map((s: string) => (
        <span key={s} style={{
          fontSize: 11, padding: "4px 10px", borderRadius: 8,
          background: C.amberPale, color: C.amber,
          fontWeight: 700, border: `1px solid rgba(217,119,6,0.18)`,
        }}>
          {s}
        </span>
      ))}
    </div>
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      color: C.amber, fontSize: 14, fontWeight: 800,
    }}>
      Predict Now <ChevronRight style={{ width: 16, height: 16 }} />
    </div>
  </motion.div>
);

// ── FAQ item ───────────────────────────────────────────────────────────────
const FAQItem = ({
  q, a, delay,
}: { q: string; a: string; delay: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      style={{
        borderRadius: 20, background: open ? C.surfaceWarm : C.surface,
        border: `1.5px solid ${open ? C.borderStrong : C.border}`,
        marginBottom: 10, overflow: "hidden",
        transition: "border-color 0.25s, background 0.25s",
        boxShadow: open ? `0 6px 32px ${C.amberGlow}` : "none",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "18px 22px",
          background: "transparent", border: "none", cursor: "pointer",
          gap: 16, textAlign: "left",
        }}
      >
        <span style={{
          fontSize: 14.5, fontWeight: 700, color: C.text,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: open ? C.amber : C.amberPale,
            border: `1.5px solid ${open ? C.amber : "rgba(217,119,6,0.25)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: open ? "#fff" : C.amber,
            transition: "background 0.25s, border-color 0.25s, color 0.25s",
          }}
        >
          <Plus style={{ width: 15, height: 15 }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="ans"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p style={{
              padding: "0 22px 20px", fontSize: 14, color: C.textSub,
              lineHeight: 1.82, margin: 0,
            }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Landing Page ───────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const bp = useBreakpoint();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const featureIcons  = [BarChart3, Bus, Clock];
  const featureColors = [C.amber, C.orange, C.teal];

  const features = [
    {
      title: "Predict Occupancy",
      description: "AI-powered passenger density forecasting using historical and real-time ridership data across AP & TS.",
    },
    {
      title: "Smart Scheduling",
      description: "Optimize your travel plans by choosing the best departure time — avoid peak crowds effortlessly.",
    },
    {
      title: "Real-Time Insights",
      description: "Get instant predictions and live occupancy updates for any route, right at your fingertips.",
    },
  ];

  const faqs = [
    {
      q: "How does TransitAI predict occupancy?",
      a: "Our ML model is trained on historical ridership data, time-of-day patterns, day-of-week trends, and seasonal factors across 15+ cities in AP & TS. It outputs a live occupancy percentage for any route and departure time you select.",
    },
    {
      q: "Do I need to create an account?",
      a: "No sign-up, no login, no app install required. Just open TransitAI in your browser, pick your route, and get instant predictions — completely free.",
    },
    {
      q: "Which cities and routes are supported?",
      a: "We currently cover 15 cities across Andhra Pradesh and Telangana, including Hyderabad, Vijayawada, Visakhapatnam, Warangal, and Tirupati. Both APSRTC/TSRTC bus services and major inter-city train routes are included.",
    },
    {
      q: "How accurate are the predictions?",
      a: "Our model achieves 94.7% prediction accuracy on held-out test data. Accuracy may vary slightly for newer routes or during major public holidays where historical data is limited.",
    },
    {
      q: "Can I use this for both buses and trains?",
      a: "Yes. TransitAI supports 7 bus types (Ordinary, Express, Sleeper, Volvo AC, Metro Express, and more) and all major train classes — General, Sleeper, AC 3-Tier, AC 2-Tier, etc.",
    },
    {
      q: "Is the data updated in real time?",
      a: "Predictions are generated in real time using the latest model snapshot. Live occupancy feeds are incorporated where available from APSRTC, TSRTC, and Indian Railways data sources.",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      overflowX: "hidden", position: "relative",
    }}>
      <PageBg />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          backdropFilter: "blur(22px)",
          background: "rgba(250,247,242,0.86)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: isMobile ? "0 16px" : "0 32px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", height: isMobile ? 60 : 70,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: isMobile ? 34 : 40, height: isMobile ? 34 : 40, borderRadius: 11,
              background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 20px ${C.amberGlow}`,
              flexShrink: 0,
            }}>
              <Brain style={{ width: isMobile ? 17 : 20, height: isMobile ? 17 : 20, color: "#fff" }} />
            </div>
            <span style={{
              fontWeight: 900, fontSize: isMobile ? 18 : 21, letterSpacing: "-0.05em",
              color: C.text, fontFamily: "'Syne', 'DM Sans', sans-serif",
            }}>
              Transit<span style={{ color: C.amber }}>AI</span>
            </span>
          </div>

          {/* Nav links — hidden on mobile */}
          {!isMobile && (
            <nav style={{ display: "flex", alignItems: "center", gap: isTablet ? 20 : 32 }}>
              {[
                { label: "Features", id: "features" },
                { label: "Modes", id: "vehicles" },
                { label: "FAQ", id: "faq" },
              ].map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() =>
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
                  }
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: 600, color: C.textSub,
                    transition: "color 0.2s", padding: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.amber)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 10px 36px rgba(217,119,6,0.38)` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/select")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: isMobile ? "8px 14px" : "10px 24px", borderRadius: 12, border: "none",
              background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
              color: "#fff", fontSize: isMobile ? 13 : 14, fontWeight: 800, cursor: "pointer",
              boxShadow: `0 4px 20px ${C.amberGlow}`,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isMobile ? "Start" : "Get Started"} <ArrowRight style={{ width: 14, height: 14 }} />
          </motion.button>
        </div>
      </motion.header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          minHeight: isMobile ? "auto" : "100vh",
          display: "flex", alignItems: "center",
          padding: isMobile
            ? "90px 16px 60px"
            : isTablet
            ? "110px 24px 70px"
            : "130px 32px 90px",
          position: "relative", zIndex: 1,
        }}
      >
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1fr",
          gap: isMobile ? 40 : isTablet ? 48 : 80,
          alignItems: "center", width: "100%",
        }}>
          {/* Left copy */}
          <motion.div style={{ y: isMobile ? 0 : heroY }}>
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 16px", borderRadius: 999,
                background: "rgba(217,119,6,0.08)",
                border: `1px solid rgba(217,119,6,0.28)`,
                marginBottom: 22,
              }}
            >
              <Activity style={{ width: 13, height: 13, color: C.amber }} />
              <span style={{
                fontSize: 10, fontWeight: 800, color: C.amber,
                letterSpacing: "0.09em", textTransform: "uppercase",
                fontFamily: "'DM Mono', monospace",
              }}>
                AI-Powered Transit Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.18 }}
              style={{
                fontSize: "clamp(36px,6vw,76px)", fontWeight: 900,
                lineHeight: 1.02, letterSpacing: "-0.045em",
                marginBottom: 22, color: C.text,
                fontFamily: "'Syne', 'DM Sans', sans-serif",
              }}
            >
              Smarter Travel{" "}
              <span style={{
                background: `linear-gradient(130deg, ${C.amber} 0%, ${C.orange} 55%, ${C.red} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Starts Here
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, delay: 0.28 }}
              style={{
                fontSize: isMobile ? 15 : 17, lineHeight: 1.8, color: C.textSub,
                marginBottom: 36, maxWidth: 470,
              }}
            >
              Know before you go. Our ML model predicts bus and train occupancy
              so you travel at the right time — no surprises, no crowds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `0 14px 48px rgba(217,119,6,0.45)` }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/select")}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: isMobile ? "13px 26px" : "15px 34px", borderRadius: 14, border: "none",
                  background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
                  color: "#fff", fontSize: isMobile ? 14 : 15, fontWeight: 800, cursor: "pointer",
                  boxShadow: `0 6px 28px rgba(217,119,6,0.38)`,
                }}
              >
                <Zap style={{ width: 16, height: 16 }} /> Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, borderColor: C.amber }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  document.getElementById("vehicles")?.scrollIntoView({ behavior: "smooth" })
                }
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: isMobile ? "13px 20px" : "15px 28px", borderRadius: 14,
                  border: `1.5px solid ${C.borderMid}`, background: C.surface,
                  color: C.textSub, fontSize: isMobile ? 14 : 15, fontWeight: 600, cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
              >
                See How It Works <ArrowRight style={{ width: 15, height: 15 }} />
              </motion.button>
            </motion.div>

            {/* Trust chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.56 }}
              style={{ display: "flex", alignItems: "center", gap: isMobile ? 14 : 22, flexWrap: "wrap" }}
            >
              {[
                { icon: CheckCircle, text: "No sign-up required" },
                { icon: Shield,      text: "Free to use" },
                { icon: MapPin,      text: "15 AP & TS cities" },
              ].map(({ icon: Ic, text }) => (
                <div
                  key={text}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 12, color: C.textFaint,
                  }}
                >
                  <Ic style={{ width: 13, height: 13, color: C.amber }} />
                  {text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero image — shown below text on mobile/tablet */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 50, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.82, delay: 0.2 }}
            style={{ position: "relative" }}
          >
            <div style={{
              position: "absolute", inset: -20,
              background: `radial-gradient(ellipse at center, rgba(245,158,11,0.18) 0%, transparent 68%)`,
              borderRadius: 40, filter: "blur(28px)",
            }} />
            <div style={{
              position: "relative", borderRadius: 24, overflow: "hidden",
              border: `1.5px solid rgba(217,119,6,0.16)`,
              boxShadow: "0 36px 90px rgba(120,60,0,0.2)",
            }}>
              <img
                src={heroImg}
                alt="AI transport prediction"
                style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, transparent 35%, rgba(26,15,0,0.65) 100%)",
              }} />

              {/* Floating prediction chip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.55 }}
                style={{
                  position: "absolute", bottom: 14, left: 14, right: 14,
                  padding: "12px 16px", borderRadius: 16,
                  background: "rgba(250,247,242,0.94)", backdropFilter: "blur(18px)",
                  border: `1px solid rgba(217,119,6,0.22)`,
                  display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <TrendingUp style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                    Live Prediction Active
                  </div>
                  <div style={{ fontSize: 10, color: C.textFaint, marginTop: 2 }}>
                    Hyderabad → Vijayawada · Express Bus
                  </div>
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 900, color: C.red, flexShrink: 0,
                  fontFamily: "'Syne', sans-serif",
                }}>
                  82%
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section style={{
        padding: isMobile ? "60px 16px" : "80px 24px",
        position: "relative", zIndex: 1,
        background: `linear-gradient(180deg, transparent, ${C.bgAlt} 20%, ${C.bgAlt} 80%, transparent)`,
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 44 }}
          >
            <Pill icon={BarChart3} label="By the numbers" />
            <h2 style={{
              fontSize: "clamp(22px,3.2vw,42px)", fontWeight: 900,
              letterSpacing: "-0.035em", color: C.text,
              fontFamily: "'Syne', 'DM Sans', sans-serif",
            }}>
              Trusted by Commuters Across AP & TS
            </h2>
          </motion.div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: isMobile ? 14 : 20,
          }}>
            <StatCard value="94.7%" label="Prediction Accuracy" icon={BarChart3} delay={0} />
            <StatCard value="15+"   label="Cities Covered"      icon={MapPin}    delay={0.1} />
            <StatCard value="7"     label="Bus Types"           icon={Bus}       delay={0.2} />
            <StatCard value="2"     label="Vehicle Modes"       icon={Train}     delay={0.3} />
          </div>
        </div>
      </section>

      {/* ── VEHICLE SHOWCASE ────────────────────────────────────────────── */}
      <section id="vehicles" style={{
        padding: isMobile ? "60px 16px" : isTablet ? "80px 24px" : "100px 32px",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <Pill icon={Zap} label="Two Modes" />
            <h2 style={{
              fontSize: "clamp(24px,3.6vw,46px)", fontWeight: 900,
              letterSpacing: "-0.035em", color: C.text,
              fontFamily: "'Syne', 'DM Sans', sans-serif",
            }}>
              Bus & Train — We've Got Both
            </h2>
            <p style={{
              fontSize: 15, color: C.textSub, marginTop: 12,
              maxWidth: 480, margin: "12px auto 0", lineHeight: 1.75,
            }}>
              Pick your mode and get instant ML-powered occupancy predictions for your route.
            </p>
          </motion.div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 18 : 28,
          }}>
            <VehicleCard
              icon={Bus} type="Bus Prediction" delay={0.06}
              badge="7 Bus Types" badgeBg={C.amberPale} badgeColor={C.amber}
              accent={C.amber}
              desc="From City Ordinary to Volvo AC — predict crowd levels for any APSRTC or TSRTC service across the region."
              stats={["Express", "Sleeper", "Volvo AC", "Metro Express", "Ordinary"]}
              onClick={() => navigate("/predict/bus")}
            />
            <VehicleCard
              icon={Train} type="Train Prediction" delay={0.16}
              badge="All Classes" badgeBg={C.tealPale} badgeColor={C.teal}
              accent={C.teal}
              desc="Sleeper, AC, General — get passenger density forecasts for intercity and express train routes across AP & TS."
              stats={["Sleeper", "AC 3-Tier", "AC 2-Tier", "General", "Express"]}
              onClick={() => navigate("/predict/train")}
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" style={{
        padding: isMobile ? "60px 16px 70px" : "80px 24px 100px",
        position: "relative", zIndex: 1,
        background: `linear-gradient(180deg, transparent, ${C.bgAlt} 18%, ${C.bgAlt} 82%, transparent)`,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <Pill icon={Shield} label="Features" />
            <h2 style={{
              fontSize: "clamp(24px,3.6vw,46px)", fontWeight: 900,
              letterSpacing: "-0.035em", color: C.text,
              fontFamily: "'Syne', 'DM Sans', sans-serif",
            }}>
              Why Choose TransitAI?
            </h2>
          </motion.div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(3,1fr)",
            gap: isMobile ? 16 : 24,
          }}>
            {features.map((f, i) => {
              const Icon = featureIcons[i];
              const col  = featureColors[i];
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  style={{
                    padding: "32px 28px", borderRadius: 26, background: C.surface,
                    border: `1.5px solid ${C.border}`, position: "relative",
                    overflow: "hidden", boxShadow: "0 4px 24px rgba(217,119,6,0.04)",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, transparent, ${col}, transparent)`,
                  }} />
                  <div style={{
                    width: 52, height: 52, borderRadius: 15,
                    background: `${col}14`, border: `1.5px solid ${col}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 20,
                  }}>
                    <Icon style={{ width: 22, height: 22, color: col }} />
                  </div>
                  <h3 style={{
                    fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 10,
                    letterSpacing: "-0.025em",
                    fontFamily: "'Syne', 'DM Sans', sans-serif",
                  }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.78 }}>
                    {f.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section style={{
        padding: isMobile ? "60px 16px" : "100px 32px",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <Pill icon={Route} label="How it works" />
            <h2 style={{
              fontSize: "clamp(24px,3.6vw,46px)", fontWeight: 900,
              letterSpacing: "-0.035em", color: C.text,
              fontFamily: "'Syne', 'DM Sans', sans-serif",
            }}>
              Three Steps to Smarter Travel
            </h2>
          </motion.div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
            gap: isMobile ? 14 : 20,
          }}>
            {[
              { step: "01", icon: Bus,       title: "Choose your mode",  desc: "Select bus or train and enter your route details and travel date." },
              { step: "02", icon: Activity,  title: "ML runs instantly",  desc: "Our model processes historical patterns and live data in milliseconds." },
              { step: "03", icon: Users,     title: "Plan your journey",  desc: "See occupancy levels and pick the best time to travel with confidence." },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.55 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: "30px 24px", borderRadius: 24, background: C.surfaceWarm,
                  border: `1.5px solid ${C.border}`, position: "relative",
                  textAlign: "center",
                }}
              >
                <div style={{
                  position: "absolute", top: 18, right: 20,
                  fontSize: 13, fontWeight: 900, color: C.amberPale,
                  fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
                }}>
                  {step}
                </div>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 18px",
                  boxShadow: `0 8px 28px ${C.amberGlow}`,
                }}>
                  <Icon style={{ width: 22, height: 22, color: "#fff" }} />
                </div>
                <h3 style={{
                  fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 8,
                  letterSpacing: "-0.02em",
                  fontFamily: "'Syne', 'DM Sans', sans-serif",
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: 13.5, color: C.textSub, lineHeight: 1.78 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" style={{
        padding: isMobile ? "60px 16px 80px" : "80px 32px 100px",
        position: "relative", zIndex: 1,
        background: `linear-gradient(180deg, transparent, ${C.bgAlt} 18%, ${C.bgAlt} 82%, transparent)`,
      }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <Pill icon={Shield} label="FAQ" />
            <h2 style={{
              fontSize: "clamp(24px,3.6vw,46px)", fontWeight: 900,
              letterSpacing: "-0.035em", color: C.text,
              fontFamily: "'Syne', 'DM Sans', sans-serif",
            }}>
              Frequently Asked Questions
            </h2>
            <p style={{
              fontSize: 15, color: C.textSub, marginTop: 12, lineHeight: 1.72,
            }}>
              Everything you need to know about TransitAI.
            </p>
          </motion.div>
          {faqs.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} delay={i * 0.06} />
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section style={{
        padding: isMobile ? "40px 16px 80px" : "60px 32px 120px",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.68 }}
            style={{
              borderRadius: isMobile ? 28 : 38,
              padding: isMobile ? "50px 24px" : isTablet ? "60px 40px" : "76px 64px",
              textAlign: "center",
              position: "relative", overflow: "hidden",
              background: `linear-gradient(135deg, ${C.amber} 0%, ${C.orange} 52%, ${C.red} 100%)`,
              boxShadow: `0 30px 90px rgba(217,119,6,0.45)`,
            }}
          >
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse 68% 75% at 50% -8%, rgba(255,255,255,0.22) 0%, transparent 58%)",
              pointerEvents: "none",
            }} />
            <svg style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              opacity: 0.06, pointerEvents: "none",
            }}>
              <defs>
                <pattern id="ctadots" width="26" height="26" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="2" fill="#fff" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ctadots)" />
            </svg>
            <div style={{ position: "relative", zIndex: 1 }}>
              <motion.div
                initial={{ scale: 0.82, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "6px 16px", borderRadius: 999,
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  marginBottom: 22,
                }}
              >
                <Zap style={{ width: 13, height: 13, color: "#fde68a" }} />
                <span style={{
                  fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.92)",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  Powered by Machine Learning
                </span>
              </motion.div>
              <h2 style={{
                fontSize: "clamp(26px,4.2vw,50px)", fontWeight: 900, color: "#fff",
                letterSpacing: "-0.035em", marginBottom: 16,
                fontFamily: "'Syne', 'DM Sans', sans-serif",
              }}>
                Ready to Travel Smarter?
              </h2>
              <p style={{
                fontSize: isMobile ? 15 : 16.5, color: "rgba(255,255,255,0.75)",
                maxWidth: 430, margin: "0 auto 36px", lineHeight: 1.75,
              }}>
                Join thousands of commuters making better travel decisions with AI.
              </p>
              <motion.button
                whileHover={{ scale: 1.07, boxShadow: "0 18px 54px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/select")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: isMobile ? "14px 32px" : "16px 42px",
                  borderRadius: 15, border: "none",
                  background: "#fff", color: C.amber,
                  fontSize: isMobile ? 15 : 16, fontWeight: 900, cursor: "pointer",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                  fontFamily: "'Syne', 'DM Sans', sans-serif",
                }}
              >
                Start Prediction <ArrowRight style={{ width: 17, height: 17 }} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{
        padding: isMobile ? "24px 16px" : "32px",
        borderTop: `1px solid ${C.border}`,
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: isMobile ? 16 : 14,
          flexDirection: isMobile ? "column" : "row",
          textAlign: isMobile ? "center" : "left",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Brain style={{ width: 15, height: 15, color: "#fff" }} />
            </div>
            <span style={{
              fontWeight: 900, fontSize: 15, color: C.text,
              fontFamily: "'Syne', 'DM Sans', sans-serif",
              letterSpacing: "-0.03em",
            }}>
              Transit<span style={{ color: C.amber }}>AI</span>
            </span>
          </div>
          <p style={{ fontSize: 12, color: C.textFaint, margin: 0 }}>
            © 2026 TransitAI. Smart Transport Occupancy Prediction.
          </p>
          <p style={{ fontSize: 12, color: C.textFaint, margin: 0 }}>
             Transit@gmail.com
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Features", "Modes", "FAQ"].map((label) => (
              <button
                key={label}
                onClick={() =>
                  document.getElementById(label.toLowerCase())?.scrollIntoView({ behavior: "smooth" })
                }
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  fontSize: 13, color: C.textFaint, transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.amber)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.textFaint)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;