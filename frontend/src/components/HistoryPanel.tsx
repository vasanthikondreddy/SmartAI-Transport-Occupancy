import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bus, Train, Clock, Trash2 } from "lucide-react";
import { useHistory } from "@/contexts/HistoryContext";

const levelBadge: Record<string, { label: string; cls: string }> = {
  Low:         { label: "Low",       cls: "bg-emerald-500/20 text-emerald-400" },
  Moderate:    { label: "Moderate",  cls: "bg-amber-500/20 text-amber-400" },
  High:        { label: "High",      cls: "bg-red-500/20 text-red-400" },
  "Very High": { label: "Very High", cls: "bg-violet-500/20 text-violet-400" },
};

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

export const HistoryPanel = ({ open, onClose }: HistoryPanelProps) => {
  const { entries, clearAll } = useHistory();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const tid = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => { clearTimeout(tid); document.removeEventListener("mousedown", handler); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 288,
              background: "#1C1917",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}
            >
              <div>
                <p className="text-sm font-semibold text-white">Prediction History</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {entries.length} prediction{entries.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {entries.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      background: "rgba(255,255,255,0.05)",
                      border: "none",
                      cursor: "pointer",
                    }}
                    title="Clear all history"
                  >
                    <Trash2 style={{ width: 11, height: 11 }} />
                    Clear
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <X style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>

            {/* Entries */}
            <div
              className="flex-1 overflow-y-auto py-3 px-3"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
            >
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <Clock style={{ width: 22, height: 22, color: "rgba(255,255,255,0.2)" }} />
                  </div>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                    No predictions yet.
                    <br />
                    Run one to see it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {entries.map((entry, i) => {
                    const badge = levelBadge[entry.occupancyLevel] ?? {
                      label: entry.occupancyLevel,
                      cls: "bg-white/10 text-white/60",
                    };
                    const dateStr = entry.travelDate
                      ? new Date(entry.travelDate + "T00:00:00").toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-default"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "0.5px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background:
                              entry.type === "bus"
                                ? "rgba(245,158,11,0.15)"
                                : "rgba(13,148,136,0.15)",
                          }}
                        >
                          {entry.type === "bus" ? (
                            <Bus style={{ width: 14, height: 14, color: "#F59E0B" }} />
                          ) : (
                            <Train style={{ width: 14, height: 14, color: "#0D9488" }} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-medium truncate"
                            style={{ color: "rgba(255,255,255,0.88)" }}
                          >
                            {entry.sourceCity} → {entry.destCity}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                            {dateStr}{dateStr && " · "}{entry.occupancyPercentage}% occupied
                          </p>
                        </div>

                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};