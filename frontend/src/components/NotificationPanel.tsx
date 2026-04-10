import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, BellOff, Trash2, Bus, Train, CheckCheck, BellRing } from "lucide-react";
import { useNotifications, NotificationEntry } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";

const levelCfg: Record<string, { color: string; bg: string; border: string }> = {
  Low:        { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)"   },
  Moderate:   { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)"  },
  High:       { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)"   },
  "Very High":{ color: "#7c3aed", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.25)"  },
};

function timeAgo(ts: number) {
  const diff  = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const NotifCard = ({ notif, onDelete }: { notif: NotificationEntry; onDelete: () => void }) => {
  const cfg = levelCfg[notif.level] ?? levelCfg["Moderate"];
  const VehicleIcon = notif.type === "bus" ? Bus : Train;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        borderRadius: 12,
        border: `1.5px solid ${notif.read ? "hsl(var(--border))" : cfg.border}`,
        background: notif.read ? "hsl(var(--card))" : cfg.bg,
        padding: "12px 14px",
        marginBottom: 10,
        position: "relative",
        transition: "background 0.3s",
      }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span style={{
          position: "absolute", top: 12, right: 40,
          width: 7, height: 7, borderRadius: "50%",
          background: cfg.color,
        }}/>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <VehicleIcon style={{ width: 14, height: 14, color: cfg.color }}/>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>
              {notif.level} Occupancy
            </span>
            <button onClick={onDelete}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2,
                borderRadius: 4, color: "hsl(var(--muted-foreground))", flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={e => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}>
              <Trash2 style={{ width: 12, height: 12 }}/>
            </button>
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: 2 }}>
            {notif.title}
          </p>
          <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", lineHeight: 1.5, marginBottom: 6 }}>
            {notif.body}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>
              🗺️ {notif.route}
            </span>
            <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>
              {timeAgo(notif.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationPanel = ({ open, onClose }: NotificationPanelProps) => {
  const {
    notifications, unreadCount, permission,
    requestPermission, markAllRead,
    deleteNotification, clearAllNotifications,
  } = useNotifications();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 48 }}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              width: 320, zIndex: 49,
              background: "hsl(var(--background))",
              borderLeft: "1.5px solid hsl(var(--border))",
              display: "flex", flexDirection: "column",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid hsl(var(--border))",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "hsl(var(--card))",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <BellRing style={{ width: 18, height: 18, color: "#F59E0B" }}/>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))", lineHeight: 1 }}>
                    Notifications
                  </p>
                  <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {unreadCount > 0 && (
                  <button onClick={markAllRead}
                    title="Mark all read"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 6,
                      borderRadius: 8, color: "hsl(var(--muted-foreground))" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#22c55e")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}>
                    <CheckCheck style={{ width: 16, height: 16 }}/>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAllNotifications}
                    title="Clear all"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 6,
                      borderRadius: 8, color: "hsl(var(--muted-foreground))" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}>
                    <Trash2 style={{ width: 16, height: 16 }}/>
                  </button>
                )}
                <button onClick={onClose}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6,
                    borderRadius: 8, color: "hsl(var(--muted-foreground))" }}>
                  <X style={{ width: 16, height: 16 }}/>
                </button>
              </div>
            </div>

            {/* Permission Banner */}
            {permission !== "granted" && permission !== "unsupported" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  margin: "12px 16px 0",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(245,158,11,0.08)",
                  border: "1.5px solid rgba(245,158,11,0.35)",
                  display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
                }}
              >
                <BellOff style={{ width: 16, height: 16, color: "#F59E0B", flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#B45309", marginBottom: 2 }}>
                    Enable browser alerts
                  </p>
                  <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                    Get notified when occupancy is high
                  </p>
                </div>
                <Button
                  onClick={requestPermission}
                  style={{
                    height: 30, fontSize: 11, padding: "0 12px",
                    background: "linear-gradient(135deg,#F59E0B,#B45309)",
                    border: "none", borderRadius: 8, color: "white", fontWeight: 600,
                    cursor: "pointer", flexShrink: 0,
                  }}
                >
                  Enable
                </Button>
              </motion.div>
            )}

            {permission === "granted" && (
              <div style={{
                margin: "10px 16px 0", padding: "8px 12px", borderRadius: 10,
                background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
                display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
              }}>
                <Bell style={{ width: 13, height: 13, color: "#22c55e" }}/>
                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
                  Browser alerts enabled ✓
                </span>
              </div>
            )}

            {/* Notifications List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: "center", padding: "60px 20px" }}
                >
                  <Bell style={{ width: 40, height: 40, color: "hsl(var(--muted-foreground))",
                    margin: "0 auto 12px", opacity: 0.3 }}/>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: 6 }}>
                    No notifications yet
                  </p>
                  <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                    Alerts appear here when occupancy is High or Very High
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map(notif => (
                    <NotifCard
                      key={notif.id}
                      notif={notif}
                      onDelete={() => deleteNotification(notif.id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
