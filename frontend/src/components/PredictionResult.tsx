import { TrendingDown, TrendingUp, Minus, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type OccupancyLevel = "low" | "medium" | "high";

interface PredictionResultProps {
  data: {
    level: OccupancyLevel;
    percentage: number;
    suggestion: string;
  };
}

const levelConfig = {
  low: {
    label: "Low Occupancy",
    icon: TrendingDown,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    progressClass: "[&>div]:bg-success",
  },
  medium: {
    label: "Medium Occupancy",
    icon: Minus,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    progressClass: "[&>div]:bg-warning",
  },
  high: {
    label: "High Occupancy",
    icon: TrendingUp,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    progressClass: "[&>div]:bg-destructive",
  },
};

const PredictionResult = ({ data }: PredictionResultProps) => {
  const config = levelConfig[data.level];
  const Icon = config.icon;

  return (
    <div className={`glass-card rounded-2xl p-8 border-2 ${config.border}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Prediction Result
          </h3>
          <p className={`font-semibold ${config.color}`}>{config.label}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Occupancy Level</span>
          <span className={`font-display text-2xl font-bold ${config.color}`}>
            {data.percentage}%
          </span>
        </div>
        <Progress value={data.percentage} className={`h-3 ${config.progressClass}`} />
      </div>

      {/* Suggestion */}
      <div className={`${config.bg} rounded-xl p-4 flex items-start gap-3`}>
        <Lightbulb className={`w-5 h-5 ${config.color} mt-0.5 shrink-0`} />
        <p className="text-foreground text-sm leading-relaxed">{data.suggestion}</p>
      </div>
    </div>
  );
};

export default PredictionResult;
