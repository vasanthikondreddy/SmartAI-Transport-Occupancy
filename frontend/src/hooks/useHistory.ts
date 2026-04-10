import { useState, useEffect } from "react";

export interface HistoryEntry {
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

export const useHistory = () => {
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
  

  const saveEntry = (entry: HistoryEntry) => {
    setEntries(prev => [entry, ...prev].slice(0, 50));
  };

   const clearHistory = () => setEntries([]);

  return { entries, saveEntry, clearHistory };
};