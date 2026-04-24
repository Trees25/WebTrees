import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const TRACKING_ID = "G-GV0CYC9F8N";

const AnalyticsTracker = () => {
  const location = useLocation();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Retrasar 2.5 segundos para sacar a Google Analytics de la métrica LCP
    const timer = setTimeout(() => {
      if (!isInitialized.current) {
        ReactGA.initialize(TRACKING_ID);
        isInitialized.current = true;
      }

      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
        title: document.title,
      });
    }, 2500);

    // Limpiar el timer si el componente se desmonta rápido o el usuario cambia de ruta antes
    return () => clearTimeout(timer);
  }, [location]);

  return null;
};

export default AnalyticsTracker;
