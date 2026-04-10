import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveToCalendarProps {
  travelDate: string;
  hourOfDep: number;
  sourceCity: string;
  destCity: string;
  vehicleType: "bus" | "train";
  vehicleClass?: string;
  occupancyLevel: string;
  occupancyPct: number;
  suggestion: string;
  accentColor?: string;
}

function formatGCalDate(date: string, hour: number): string {
  const d = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
  const end = new Date(d.getTime() + 60 * 60 * 1000);
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(dt.getDate()).padStart(2, "0")}T${String(dt.getHours()).padStart(2, "0")}${String(dt.getMinutes()).padStart(2, "0")}00`;
  return `${fmt(d)}/${fmt(end)}`;
}

export const SaveToCalendarButton = ({
  travelDate,
  hourOfDep,
  sourceCity,
  destCity,
  vehicleType,
  vehicleClass,
  occupancyLevel,
  occupancyPct,
  suggestion,
  accentColor = "#0D9488",
}: SaveToCalendarProps) => {
  const handleSave = () => {
    const emoji = vehicleType === "bus" ? "🚌" : "🚆";
    const title = encodeURIComponent(
      `${emoji} ${sourceCity} → ${destCity} (${vehicleClass ?? vehicleType})`
    );
    const details = encodeURIComponent(
      `Occupancy Prediction: ${occupancyLevel} (${occupancyPct}%)\nTip: ${suggestion}\n\nPredicted by AI Commute Planner`
    );
    const location = encodeURIComponent(`${sourceCity}, India`);
    const dates = formatGCalDate(travelDate, hourOfDep);
    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <Button
        onClick={handleSave}
        className="w-full rounded-xl font-semibold"
        style={{
          height: 48,
          background: `linear-gradient(135deg,${accentColor}22,${accentColor}11)`,
          border: `1.5px solid ${accentColor}70`,
          color: accentColor,
          boxShadow: `0 4px 20px ${accentColor}20`,
          transition: "all 0.2s",
        }}
      >
        <Calendar className="mr-2 w-4 h-4" />
        Save to Google Calendar
        <span style={{
          marginLeft: 8, fontSize: 10, padding: "2px 8px", borderRadius: 999,
          background: `${accentColor}25`, color: accentColor, fontWeight: 700,
        }}>
          OPENS GOOGLE
        </span>
      </Button>
    </motion.div>
  );
};