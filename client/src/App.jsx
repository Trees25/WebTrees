import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./Home";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRouter";
import ScrollToTop from "./hooks/scrooltop";
const Projects = lazy(() => import("./pages/Projects"));
const Admin = lazy(() => import("./components/Admin"));
const Login = lazy(() => import("./components/Login"));
const PerfilUsuario = lazy(() => import("./components/PerfilUsuario"));
const Clientes = lazy(() => import("./components/Clientes"));
const Presupuesto = lazy(() => import("./components/Presupuesto"));
const Recibo = lazy(() => import("./components/Recibo"));
const Estadisticas = lazy(() => import("./components/Estadisticas"));
const Catalogo = lazy(() => import("./components/Catalogo"));
const Resumen = lazy(() => import("./components/Resumen"));
const Perfiles = lazy(() => import("./components/Perfiles"));

export default function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-dvh flex flex-col w-full bg-[#101726] text-white">
      {!isAdminPath && <Navbar />}
      <ScrollToTop />

      <main className="flex-grow">
        {/* ENVOLTORIO SUSPENSE OBLIGATORIO PARA LAZY LOADING */}
        <Suspense
          fallback={
            <div className="flex h-full min-h-[50vh] items-center justify-center">
              <span className="text-gray-400">Cargando vista...</span>
            </div>
          }
        >
          <Routes>
            {/* Home es estático, carga inmediato */}
            <Route path="/" element={<Home />} />

            <Route path="/proyectos" element={<Projects />} />
            <Route path="/login" element={<Login />} />

            {/* Rutas Privadas */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/perfil-usuario"
              element={
                <PrivateRoute>
                  <PerfilUsuario />
                </PrivateRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <PrivateRoute>
                  <Clientes />
                </PrivateRoute>
              }
            />
            <Route
              path="/presupuesto"
              element={
                <PrivateRoute>
                  <Presupuesto />
                </PrivateRoute>
              }
            />
            <Route
              path="/recibo"
              element={
                <PrivateRoute>
                  <Recibo />
                </PrivateRoute>
              }
            />
            <Route
              path="/resumen"
              element={
                <PrivateRoute>
                  <Resumen />
                </PrivateRoute>
              }
            />
            <Route
              path="/perfiles"
              element={
                <PrivateRoute>
                  <Perfiles />
                </PrivateRoute>
              }
            />
            <Route
              path="/catalogo"
              element={
                <PrivateRoute>
                  <Catalogo />
                </PrivateRoute>
              }
            />
            <Route
              path="/estadisticas"
              element={
                <PrivateRoute>
                  <Estadisticas />
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>

      {!isAdminPath && <Footer />}
    </div>
  );
}
