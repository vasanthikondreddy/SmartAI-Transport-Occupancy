import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 👉 add these imports
import { NotificationProvider } from "@/contexts/NotificationContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import React from "react";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HistoryProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </HistoryProvider>
  </React.StrictMode>
);