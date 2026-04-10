import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface NotificationEntry {
  id: string;
  title: string;
  body: string;
  type: "bus" | "train";
  level: string;
  route: string;
  timestamp: number;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationEntry[];
  unreadCount: number;
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<void>;
  sendNotification: (entry: Omit<NotificationEntry, "id" | "timestamp" | "read">) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = "ai_commute_notifications";

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const sendNotification = (entry: Omit<NotificationEntry, "id" | "timestamp" | "read">) => {
    const newEntry: NotificationEntry = {
      ...entry,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      read: false,
    };

    // Save to in-app history
    setNotifications(prev => [newEntry, ...prev].slice(0, 50));

    // Fire browser notification if permitted
    if (permission === "granted") {
      const levelEmoji =
        entry.level === "Very High" ? "🚨" :
        entry.level === "High"      ? "⚠️" :
        entry.level === "Moderate"  ? "🟡" : "✅";

      const notif = new Notification(entry.title, {
        body: `${levelEmoji} ${entry.body}`,
        icon: entry.type === "bus" ? "/bus-icon.png" : "/train-icon.png",
        badge: "/badge.png",
        tag: newEntry.id,
        requireInteraction: entry.level === "Very High" || entry.level === "High",
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      // Auto-close after 6s for low/moderate
      if (entry.level !== "High" && entry.level !== "Very High") {
        setTimeout(() => notif.close(), 6000);
      }
    }
  };

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const deleteNotification = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const clearAllNotifications = () => setNotifications([]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, permission,
      requestPermission, sendNotification,
      markAllRead, deleteNotification, clearAllNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
};
