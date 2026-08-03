import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./Home";
import Projects from "./pages/Projects";
import Footer from "./components/Footer";
import Admin from "./components/Admin";
import PrivateRoute from "./components/PrivateRouter";
import Login from "./components/Login";
import PerfilUsuario from "./components/PerfilUsuario";
import Clientes from "./components/Clientes";
import Presupuesto from "./components/Presupuesto";
import Recibo from "./components/Recibo";
import Estadisticas from "./components/Estadisticas";
import Catalogo from "./components/Catalogo";
import Resumen from "./components/Resumen";
import Perfiles from "./components/Perfiles";
import AdminProyectos from "./components/AdminProyectos";
import AdminPersonal from "./components/AdminPersonal";
import AdminBalance from "./components/AdminBalance";
import NotFound from "./components/NotFound";

export default function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/gestion-interna");
  const isLoginPath = location.pathname === "/ingreso-privado";

  // Este efecto hace que los links con "#" (ej: /#servicios) hagan scroll suave hacia la sección
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
      // Si navegamos a "Inicio" (/) sin hash, scrolleamos arriba de todo
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-dvh flex flex-col w-full bg-[#101726] text-white">
      {!isAdminPath && !isLoginPath && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/proyectos" element={<Projects />} />
          <Route path="/ingreso-privado" element={<Login />} />
          <Route
            path="/gestion-interna"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestion-interna-proyectos"
            element={
              <PrivateRoute>
                <AdminProyectos />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestion-interna-personal"
            element={
              <PrivateRoute>
                <AdminPersonal />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestion-interna-balance"
            element={
              <PrivateRoute>
                <AdminBalance />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAdminPath && !isLoginPath && <Footer />}
    </div>
  );
}
