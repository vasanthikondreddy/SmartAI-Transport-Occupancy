import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bus, Train, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const cards = [
  {
    icon: Bus,
    title: "Bus Prediction",
    description: "Predict occupancy levels for city and intercity bus routes.",
    type: "bus",
    gradient: "from-primary to-accent",
  },
  {
    icon: Train,
    title: "Train Prediction",
    description: "Forecast passenger density for metro and railway services.",
    type: "train",
    gradient: "from-accent to-primary",
  },
];

const TransportSelectPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass-card border-b border-border/30 px-6 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-lg text-foreground">
            Select Transport Type
          </h1>
        </div>
      </header>

      {/* Cards */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl w-full">
          {cards.map((card, i) => (
            <motion.button
              key={card.type}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              onClick={() => navigate(`/predict/${card.type}`)}
              className="glass-card rounded-2xl p-10 text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <card.icon className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                {card.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransportSelectPage;
