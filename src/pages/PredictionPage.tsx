import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bus, Train, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PredictionResult from "@/components/PredictionResult";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type OccupancyLevel = "low" | "medium" | "high";

interface PredictionData {
  level: OccupancyLevel;
  percentage: number;
  suggestion: string;
}

const PredictionPage = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const isBus = type === "bus";
  const Icon = isBus ? Bus : Train;

  const [route, setRoute] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionData | null>(null);

  const handlePredict = () => {
    setLoading(true);
    setResult(null);

    // Simulate AI prediction
    setTimeout(() => {
      const pct = Math.floor(Math.random() * 100);
      let level: OccupancyLevel = "low";
      let suggestion = "Great time to travel! Seats available.";
      if (pct > 70) {
        level = "high";
        suggestion = "Avoid peak time. Consider traveling later.";
      } else if (pct > 40) {
        level = "medium";
        suggestion = "Moderate crowd expected. Travel is comfortable.";
      }
      setResult({ level, percentage: pct, suggestion });
      setLoading(false);
    }, 1800);
  };

  const canPredict = route && day && time && passengers;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/30 px-6 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/select")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-lg text-foreground">
              {isBus ? "Bus" : "Train"} Occupancy Prediction
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 md:p-10"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Enter Travel Details
          </h2>
          <p className="text-muted-foreground mb-8">
            Fill in your trip details for an AI-powered occupancy prediction.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="route">Route Number</Label>
              <Input
                id="route"
                placeholder={isBus ? "e.g. 42A" : "e.g. Blue Line"}
                value={route}
                onChange={(e) => setRoute(e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Day of the Week</Label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time of Travel</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="passengers">Passenger History</Label>
                <Input
                  id="passengers"
                  type="number"
                  placeholder="Avg. passengers"
                  min={0}
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g. Central Station"
                    className="pl-9"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handlePredict}
              disabled={!canPredict || loading}
              className="w-full gradient-primary border-0 text-primary-foreground hover:opacity-90 transition-opacity text-base mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Predict Occupancy"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <PredictionResult data={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PredictionPage;
