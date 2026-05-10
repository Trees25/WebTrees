import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

// 👇 ACÁ PEGÁ TU ID DE MEDICIÓN DE GOOGLE (ej: "G-A1B2C3D4")
// Si no tenés uno, andá a analytics.google.com -> Admin -> Data Streams
const TRACKING_ID = "G-GV0CYC9F8N";

ReactGA.initialize(TRACKING_ID);

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Esto se ejecuta cada vez que la ruta (location) cambia
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
      title: document.title,
    });

    // Opcional: Un console.log para ver si funciona mientras desarrollás
    console.log(`📡 Enviando página a Google: ${location.pathname}`);
  }, [location]);

  return null; // Este componente no muestra nada visual, es invisible.
};

export default AnalyticsTracker;
