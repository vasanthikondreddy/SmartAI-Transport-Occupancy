import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bus, Train, ArrowLeft, Brain, ChevronRight, Zap, MapPin, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const C = {
  bg:          "#faf7f2",
  surface:     "#ffffff",
  surfaceWarm: "#fffbf5",
  border:      "rgba(180,100,20,0.12)",
  borderMid:   "rgba(180,100,20,0.22)",
  text:        "#1a0f00",
  textSub:     "#6b4f2c",
  textFaint:   "#c4a07a",
  amber:       "#d97706",
  amberLight:  "#f59e0b",
  amberPale:   "#fef3c7",
  amberGlow:   "rgba(217,119,6,0.18)",
  orange:      "#ea580c",
  teal:        "#0d9488",
  tealPale:    "rgba(13,148,136,0.08)",
  tealMid:     "rgba(13,148,136,0.22)",
  red:         "#dc2626",
};

// ── Responsive hook ────────────────────────────────────────────────────────
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

// ── Animated counter ──────────────────────────────────────────────────────
const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v) + suffix);
  useEffect(() => {
    const ctrl = animate(count, to, { duration: 1.6, ease: "easeOut", delay: 0.7 });
    return ctrl.stop;
  }, []);
  return <motion.span>{rounded}</motion.span>;
};

// ── Floating particle ─────────────────────────────────────────────────────
const Particle = ({ x, y, size, delay, color }: {
  x: string; y: string; size: number; delay: number; color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 0 }}
    animate={{ opacity: [0, 0.7, 0], y: -90 }}
    transition={{ duration: 3.8, delay, repeat: Infinity, repeatDelay: Math.random() * 4 + 2, ease: "easeOut" }}
    style={{
      position: "absolute", left: x, top: y,
      width: size, height: size, borderRadius: "50%",
      background: color, pointerEvents: "none",
    }}
  />
);

// ── Animated background ───────────────────────────────────────────────────
const PageBg = () => {
  const particles = [
    { x: "14%", y: "62%", size: 8,  delay: 0,   color: "rgba(217,119,6,0.45)" },
    { x: "82%", y: "70%", size: 5,  delay: 1.3, color: "rgba(234,88,12,0.38)" },
    { x: "26%", y: "78%", size: 6,  delay: 2.5, color: "rgba(13,148,136,0.32)" },
    { x: "68%", y: "56%", size: 9,  delay: 0.9, color: "rgba(217,119,6,0.32)" },
    { x: "50%", y: "74%", size: 4,  delay: 3.2, color: "rgba(245,158,11,0.42)" },
    { x: "88%", y: "42%", size: 7,  delay: 1.9, color: "rgba(234,88,12,0.32)" },
    { x: "7%",  y: "47%", size: 5,  delay: 2.9, color: "rgba(13,148,136,0.38)" },
    { x: "61%", y: "84%", size: 6,  delay: 0.5, color: "rgba(217,119,6,0.38)" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: 520, height: 520, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.22, 1], opacity: [0.28, 0.52, 0.28] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3.5 }}
        style={{
          position: "absolute", bottom: "-8%", left: "-5%",
          width: 440, height: 440, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)",
          filter: "blur(64px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 28, 0], y: [0, -18, 0], opacity: [0.18, 0.38, 0.18] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        style={{
          position: "absolute", top: "38%", left: "38%",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234,88,12,0.1) 0%, transparent 70%)",
          filter: "blur(52px)",
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.038 }}>
        <defs>
          <pattern id="sdots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" fill={C.amber} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sdots)" />
      </svg>
      {particles.map((p, i) => <Particle key={i} {...p} />)}
    </div>
  );
};

// ── Transport card ────────────────────────────────────────────────────────
const TransportCard = ({
  card, index, onClick, isMobile,
}: {
  card: any; index: number; onClick: () => void; isMobile: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const Icon = card.icon;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTilt({
      x: ((e.clientY - cy) / rect.height) * -7,
      y: ((e.clientX - cx) / rect.width) * 7,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 64, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.28 + index * 0.18, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onClick={onClick}
      style={{ perspective: 1000, cursor: "pointer" }}
    >
      <motion.div
        animate={{
          rotateX: hovered && !isMobile ? tilt.x : 0,
          rotateY: hovered && !isMobile ? tilt.y : 0,
          y: hovered ? -8 : 0,
        }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        style={{
          borderRadius: isMobile ? 24 : 32,
          background: C.surface,
          border: `1.5px solid ${hovered ? card.accentMid : C.border}`,
          padding: isMobile ? "28px 24px" : "46px 42px",
          position: "relative",
          overflow: "hidden",
          boxShadow: hovered
            ? `0 36px 88px ${card.accentGlow}, 0 0 0 1px ${card.accentMid}`
            : "0 4px 24px rgba(217,119,6,0.06)",
          transition: "border-color 0.3s, box-shadow 0.35s",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ambient glow */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute", top: -50, right: -50,
            width: 240, height: 240, borderRadius: "50%",
            background: `radial-gradient(circle, ${card.accentPale} 0%, transparent 68%)`,
            pointerEvents: "none",
          }}
        />

        {/* Shimmer sweep */}
        <motion.div
          animate={{ x: hovered ? "220%" : "-100%", opacity: hovered ? 0.65 : 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)",
            pointerEvents: "none", zIndex: 1,
          }}
        />

        {/* Bottom accent bar */}
        <motion.div
          animate={{ scaleX: hovered ? 1 : 0.28, opacity: hovered ? 1 : 0.35 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
            background: card.barColor, transformOrigin: "left", pointerEvents: "none",
          }}
        />

        {/* Ghost number */}
        <div style={{
          position: "absolute", top: 16, right: 20,
          fontSize: isMobile ? 52 : 72, fontWeight: 900, lineHeight: 1,
          color: `${card.accent}07`, userSelect: "none",
          fontFamily: "'Syne', sans-serif",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Icon + badge */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", marginBottom: isMobile ? 22 : 34,
          position: "relative", zIndex: 2,
        }}>
          <motion.div
            animate={{
              scale: hovered ? 1.12 : 1,
              rotate: hovered ? 8 : 0,
              background: hovered
                ? `linear-gradient(135deg, ${card.accent}, ${card.accentDark})`
                : card.accentPale,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            style={{
              width: isMobile ? 58 : 74, height: isMobile ? 58 : 74,
              borderRadius: isMobile ? 16 : 22,
              border: `1.5px solid ${card.accentMid}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: hovered ? `0 14px 36px ${card.accentGlow}` : "none",
              flexShrink: 0,
            }}
          >
            <Icon style={{
              width: isMobile ? 26 : 34, height: isMobile ? 26 : 34,
              color: hovered ? "#fff" : card.accent,
              transition: "color 0.3s",
            }} />
          </motion.div>

          <span style={{
            fontSize: 10, fontWeight: 800, padding: "5px 12px", borderRadius: 999,
            background: card.badgeBg, color: card.badgeColor,
            border: `1px solid ${card.badgeColor}35`,
            letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace",
            flexShrink: 0,
          }}>
            {card.badge}
          </span>
        </div>

        <h2 style={{
          fontSize: isMobile ? 22 : 28, fontWeight: 900, color: C.text,
          letterSpacing: "-0.035em", marginBottom: 10,
          fontFamily: "'Syne', 'DM Sans', sans-serif",
          position: "relative", zIndex: 2,
        }}>
          {card.title}
        </h2>

        <p style={{
          fontSize: 14, color: C.textSub, lineHeight: 1.8,
          marginBottom: isMobile ? 20 : 28, position: "relative", zIndex: 2,
        }}>
          {card.description}
        </p>

        <div style={{
          display: "flex", gap: 7, flexWrap: "wrap",
          marginBottom: isMobile ? 24 : 34, position: "relative", zIndex: 2,
        }}>
          {card.tags.map((tag: string, ti: number) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.15 + ti * 0.07, duration: 0.4 }}
              style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 8,
                background: card.accentPale, color: card.accent,
                fontWeight: 700, border: `1px solid ${card.accentMid}`,
              }}
            >
              {tag}
            </motion.span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 2 }}>
          <motion.span
            animate={{ color: hovered ? card.accent : C.textSub }}
            style={{ fontSize: 14, fontWeight: 800 }}
          >
            Predict Now
          </motion.span>
          <motion.div
            animate={{ x: hovered ? 6 : 0, opacity: hovered ? 1 : 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ChevronRight style={{ width: 17, height: 17, color: hovered ? card.accent : C.textSub }} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────
const TransportSelectPage = () => {
  const navigate = useNavigate();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const cards = [
    {
      icon: Bus,
      title: "Bus Prediction",
      description: "From City Ordinary to Volvo AC — predict crowd levels for any APSRTC or TSRTC service across the region.",
      type: "bus",
      accent: C.amber, accentDark: C.orange,
      accentPale: C.amberPale, accentGlow: "rgba(217,119,6,0.24)",
      accentMid: "rgba(217,119,6,0.26)",
      badge: "7 Bus Types", badgeBg: C.amberPale, badgeColor: C.amber,
      tags: ["Express", "Sleeper", "Volvo AC", "Metro Express", "Ordinary"],
      barColor: `linear-gradient(90deg, ${C.amber}, ${C.orange})`,
    },
    {
      icon: Train,
      title: "Train Prediction",
      description: "Sleeper, AC, General — get passenger density forecasts for intercity and express train routes across AP & TS.",
      type: "train",
      accent: C.teal, accentDark: "#0f766e",
      accentPale: C.tealPale, accentGlow: "rgba(13,148,136,0.2)",
      accentMid: C.tealMid,
      badge: "All Classes", badgeBg: C.tealPale, badgeColor: C.teal,
      tags: ["Sleeper", "AC 3-Tier", "AC 2-Tier", "General", "Express"],
      barColor: `linear-gradient(90deg, ${C.teal}, #0f766e)`,
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      overflowX: "hidden", position: "relative",
      display: "flex", flexDirection: "column",
    }}>
      <PageBg />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "sticky", top: 0, zIndex: 100,
          backdropFilter: "blur(24px)",
          background: "rgba(250,247,242,0.9)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: isMobile ? "0 16px" : "0 32px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", height: isMobile ? 60 : 70,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 16 }}>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate("/")}
              style={{
                width: isMobile ? 36 : 42, height: isMobile ? 36 : 42, borderRadius: 12,
                border: `1.5px solid ${C.borderMid}`,
                background: C.surface, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: C.textSub, flexShrink: 0,
              }}
            >
              <ArrowLeft style={{ width: 17, height: 17 }} />
            </motion.button>
            <motion.div
              whileHover={{ rotate: 10 }}
              style={{
                width: isMobile ? 34 : 40, height: isMobile ? 34 : 40, borderRadius: 11,
                background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 20px ${C.amberGlow}`,
                flexShrink: 0,
              }}
            >
              <Brain style={{ width: isMobile ? 16 : 20, height: isMobile ? 16 : 20, color: "#fff" }} />
            </motion.div>
            <span style={{
              fontWeight: 900, fontSize: isMobile ? 17 : 20, letterSpacing: "-0.05em",
              color: C.text, fontFamily: "'Syne', 'DM Sans', sans-serif",
            }}>
              Transit<span style={{ color: C.amber }}>AI</span>
            </span>
          </div>

          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 240 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: isMobile ? "5px 12px" : "7px 18px", borderRadius: 999,
              background: C.amberPale, border: `1.5px solid rgba(217,119,6,0.3)`,
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.22, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3 }}
              style={{
                width: isMobile ? 18 : 22, height: isMobile ? 18 : 22, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.amber}, ${C.orange})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0,
              }}
            >
              1
            </motion.span>
            {!isMobile && (
              <span style={{
                fontSize: 11, fontWeight: 800, color: C.amber,
                letterSpacing: "0.07em", textTransform: "uppercase",
                fontFamily: "'DM Mono', monospace",
              }}>
                Select Mode
              </span>
            )}
          </motion.div>
        </div>
      </motion.header>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: isMobile ? "40px 16px 48px" : isTablet ? "48px 24px 56px" : "52px 32px 64px",
        position: "relative", zIndex: 1,
      }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 54, maxWidth: 560, width: "100%" }}>
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.08 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "5px 16px", borderRadius: 999,
              background: C.amberPale, border: `1px solid rgba(217,119,6,0.28)`,
              marginBottom: 18,
            }}
          >
            <Zap style={{ width: 11, height: 11, color: C.amber }} />
            <span style={{
              fontSize: 10, fontWeight: 800, color: C.amber,
              letterSpacing: "0.1em", textTransform: "uppercase",
              fontFamily: "'DM Mono', monospace",
            }}>
              Step 1 of 2
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: "clamp(28px,5vw,60px)", fontWeight: 900,
              letterSpacing: "-0.045em", color: C.text,
              marginBottom: 14, lineHeight: 1.06,
              fontFamily: "'Syne', 'DM Sans', sans-serif",
            }}
          >
            Choose Your{" "}
            <span style={{
              background: `linear-gradient(130deg, ${C.amber} 0%, ${C.orange} 55%, ${C.red} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Transport Mode
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            style={{
              fontSize: isMobile ? 14.5 : 16, color: C.textSub,
              lineHeight: 1.78, maxWidth: 420, margin: "0 auto",
            }}
          >
            Select bus or train to get an instant ML-powered occupancy prediction for your route.
          </motion.p>
        </div>

        {/* Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 16 : 28,
          maxWidth: 900, width: "100%",
        }}>
          {cards.map((card, i) => (
            <TransportCard
              key={card.type}
              card={card}
              index={i}
              isMobile={isMobile}
              onClick={() => navigate(`/predict/${card.type}`)}
            />
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.62 }}
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: isMobile ? "column" : "row",
            gap: 0,
            marginTop: isMobile ? 28 : 44,
            borderRadius: 20,
            background: C.surface, border: `1.5px solid ${C.border}`,
            boxShadow: "0 4px 24px rgba(217,119,6,0.07)",
            overflow: "hidden",
            width: isMobile ? "100%" : "auto",
          }}
        >
          {[
            { icon: MapPin,  label: "Cities Covered", value: 15,  suffix: "+" },
            { icon: Zap,     label: "Accuracy",        value: 94,  suffix: "%" },
            { icon: Shield,  label: "Cost",            value: 0,   suffix: "",  special: "Free" },
          ].map(({ icon: Ic, label, value, suffix, special }, i) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: isMobile ? "16px 24px" : "18px 32px",
              borderRight: !isMobile && i < 2 ? `1px solid ${C.border}` : "none",
              borderBottom: isMobile && i < 2 ? `1px solid ${C.border}` : "none",
              width: isMobile ? "100%" : "auto",
              justifyContent: isMobile ? "flex-start" : "initial",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: C.amberPale, border: `1px solid rgba(217,119,6,0.2)`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Ic style={{ width: 16, height: 16, color: C.amber }} />
              </div>
              <div>
                <div style={{
                  fontSize: isMobile ? 20 : 22, fontWeight: 900, color: C.text,
                  letterSpacing: "-0.04em", lineHeight: 1,
                  fontFamily: "'Syne', sans-serif",
                }}>
                  {special ?? <Counter to={value} suffix={suffix} />}
                </div>
                <div style={{ fontSize: 11, color: C.textFaint, fontWeight: 600, marginTop: 2 }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TransportSelectPage;