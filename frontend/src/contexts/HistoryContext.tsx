import { createContext, useContext, useState, useEffect } from "react";

export interface HistoryEntry {
  id: string;           // 👈 add this
  timestamp: number;    // 👈 add this
  type: "bus" | "train";
  sourceCity: string;
  destCity: string;
  travelDate: string;
  day: string;
  month: string;
  season: string;
  hourOfDep: number;
  vehicleClass: string;
  capacity: number;
  occupancyLevel: string;
  occupancyPercentage: number;
  estimatedPassengers: number;
  suggestion: string;
}

const STORAGE_KEY = "ai-commute-history";

interface HistoryContextType {
  entries: HistoryEntry[];
  saveEntry: (e: Omit<HistoryEntry, "id" | "timestamp">) => void; // 👈 pages don't pass id/timestamp
  deleteEntry: (id: string) => void;   // 👈 HistoryPage needs this
  clearAll: () => void;                // 👈 HistoryPage calls clearAll
}

const HistoryContext = createContext<HistoryContextType | null>(null);

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const saveEntry = (entry: Omit<HistoryEntry, "id" | "timestamp">) =>
    setEntries(prev =>
      [{ ...entry, id: crypto.randomUUID(), timestamp: Date.now() }, ...prev].slice(0, 50)
    );

  const deleteEntry = (id: string) =>
    setEntries(prev => prev.filter(e => e.id !== id));

  const clearAll = () => setEntries([]);

  return (
    <HistoryContext.Provider value={{ entries, saveEntry, deleteEntry, clearAll }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used inside HistoryProvider");
  return ctx;
};