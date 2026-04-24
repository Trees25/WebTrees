import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; //para SEO
import AnalyticsTracker from "./components/AnalyticsTracker.jsx"; // PARA QUE GOOGLE TIRE STATS
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
