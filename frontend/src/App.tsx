import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HistoryProvider } from "@/contexts/HistoryContext";
import { NotificationProvider } from "@/contexts/NotificationContext"; // 👈 add if missing
import LandingPage from "./pages/LandingPage";
import TransportSelectPage from "./pages/TransportSelectPage";
import PredictionPage from "./pages/PredictionPage";
import TrainPredictionPage from "./pages/TrainPredictionPage";
import RouteComparePage from "./pages/RouteComparePage"; // 👈 add this
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <HistoryProvider>
          <NotificationProvider> {/* 👈 wrap with this too if not already */}
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/select" element={<TransportSelectPage />} />
              <Route path="/predict/bus" element={<PredictionPage />} />
              <Route path="/predict/train" element={<TrainPredictionPage />} />
              <Route path="/compare/:mode" element={<RouteComparePage />} /> {/* 👈 add this */}
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationProvider>
        </HistoryProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;