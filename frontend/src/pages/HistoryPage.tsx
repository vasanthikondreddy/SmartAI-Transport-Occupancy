import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bus, Train, Trash2, Clock, MapPin,
  BarChart2, Filter, Inbox, AlertTriangle, CheckCircle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHistory, HistoryEntry } from "@/contexts/HistoryContext";

// ─── Level Config ─────────────────────────────────────────────────────────────
const levelCfg: Record<string, { color: string; bg: string; border: string; label: string; Icon: any }> = {
  Low:       { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.35)",   label: "Low",       Icon: CheckCircle   },
  Moderate:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.35)",  label: "Moderate",  Icon: Info          },
  High:      { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.35)",   label: "High",      Icon: AlertTriangle },
  "Very High":{ color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.35)",  label: "Very High", Icon: AlertTriangle },
};

const seasonEmoji: Record<string, string> = {
  Winter: "❄️", Spring: "🌸", Summer: "☀️", Monsoon: "🌧️", Autumn: "🍂",
};

function formatHour(h: number) {
  return h === 0 ? "12:00 AM" : h === 12 ? "12:00 PM" : h < 12 ? `${h}:00 AM` : `${h-12}:00 PM`;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Single History Card ──────────────────────────────────────────────────────
const HistoryCard = ({ entry, onDelete }: { entry: HistoryEntry; onDelete: () => void }) => {
  const cfg = levelCfg[entry.occupancyLevel] ?? levelCfg["Moderate"];
  const Icon = entry.type === "bus" ? Bus : Train;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${cfg.border}` }}
    >
      {/* Top bar */}
      <div style={{ padding: "10px 16px", background: cfg.bg, borderBottom: `1px solid ${cfg.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: cfg.color + "22",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon style={{ width: 14, height: 14, color: cfg.color }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {entry.type === "bus" ? "Bus" : "Train"} · {cfg.label}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
            {timeAgo(entry.timestamp)}
          </span>
          <button onClick={onDelete}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4,
              borderRadius: 6, color: "hsl(var(--muted-foreground))", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={e => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}>
            <Trash2 style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px" }}>
        {/* Route */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <MapPin style={{ width: 14, height: 14, color: "hsl(var(--primary))", flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>
            {entry.sourceCity}
          </span>
          <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>→</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>
            {entry.destCity}
          </span>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Occupancy", value: `${entry.occupancyPercentage}%`, color: cfg.color },
            { label: "Passengers", value: `${entry.estimatedPassengers}/${entry.capacity}`, color: "hsl(var(--foreground))" },
            { label: "Departure", value: formatHour(entry.hourOfDep), color: "hsl(var(--foreground))" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ borderRadius: 8, padding: "8px 10px", background: "hsl(var(--muted)/0.3)",
              border: "1px solid hsl(var(--border))", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
          <span>📅 {entry.day}, {entry.travelDate}</span>
          <span>{seasonEmoji[entry.season] ?? ""} {entry.season}</span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20,
            background: "hsl(var(--primary)/0.1)", color: "hsl(var(--primary))", fontWeight: 600 }}>
            {entry.vehicleClass}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const HistoryPage = () => {
  const navigate = useNavigate();
  const { entries: history, deleteEntry, clearAll } = useHistory();
  const [filter, setFilter] = useState<"all" | "bus" | "train">("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = history.filter(e => filter === "all" || e.type === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" onClick={() => navigate("/select")} className="rounded-xl hover:bg-primary/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground leading-none">
                Prediction History
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {history.length} saved prediction{history.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(true)}
              className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-1" /> Clear All
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-5">

        {/* Filter tabs */}
        {history.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "bus", "train"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", border: "1.5px solid",
                  borderColor: filter === f ? "hsl(var(--primary))" : "hsl(var(--border))",
                  background: filter === f ? "hsl(var(--primary))" : "transparent",
                  color: filter === f ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
                {f === "bus" && <Bus style={{ width: 12, height: 12 }} />}
                {f === "train" && <Train style={{ width: 12, height: 12 }} />}
                {f === "all" && <Filter style={{ width: 12, height: 12 }} />}
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span style={{ padding: "1px 6px", borderRadius: 10,
                  background: filter === f ? "rgba(255,255,255,0.2)" : "hsl(var(--muted))",
                  fontSize: 10 }}>
                  {f === "all" ? history.length : history.filter(e => e.type === f).length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Stats summary */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5"
            style={{ border: "1.5px solid hsl(var(--border))", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Total Predictions", value: history.length, Icon: BarChart2 },
              { label: "Avg Occupancy",
                value: `${Math.round(history.reduce((s, e) => s + e.occupancyPercentage, 0) / history.length)}%`,
                Icon: BarChart2 },
              { label: "Most Used",
                value: history.filter(e => e.type === "bus").length >= history.filter(e => e.type === "train").length ? "Bus" : "Train",
                Icon: history.filter(e => e.type === "bus").length >= history.filter(e => e.type === "train").length ? Bus : Train },
            ].map(({ label, value, Icon: Ic }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <Ic style={{ width: 16, height: 16, color: "hsl(var(--primary))", margin: "0 auto 4px" }} />
                <div style={{ fontSize: 18, fontWeight: 800, color: "hsl(var(--foreground))" }}>{value}</div>
                <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "60px 20px" }}>
            <Inbox style={{ width: 48, height: 48, color: "hsl(var(--muted-foreground))", margin: "0 auto 16px", opacity: 0.4 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: 6 }}>
              {filter === "all" ? "No predictions yet" : `No ${filter} predictions yet`}
            </p>
            <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginBottom: 20 }}>
              Your predictions will appear here after you run them.
            </p>
            <Button onClick={() => navigate("/select")}
              className="gradient-primary border-0 text-primary-foreground rounded-xl">
              Make a Prediction
            </Button>
          </motion.div>
        )}

        {/* History list */}
        <AnimatePresence mode="popLayout">
          {filtered.map(entry => (
            <HistoryCard key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} />
          ))}
        </AnimatePresence>

      </div>

      {/* Clear All Confirm Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl p-6 max-w-sm w-full"
              style={{ border: "1.5px solid hsl(var(--border))" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: 8 }}>
                Clear all history?
              </h3>
              <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginBottom: 20 }}>
                This will permanently delete all {history.length} saved predictions.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="outline" onClick={() => setShowClearConfirm(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button onClick={() => { clearAll(); setShowClearConfirm(false); }}
                  className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0">
                  Clear All
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryPage;