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
import ClientesPosventa from "./components/ClientesPosventa";
export default function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-dvh flex flex-col w-full bg-[#101726] text-white">
      {!isAdminPath && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/proyectos" element={<Projects />} />
          <Route path="/login" element={<Login />} />
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
          <Route
            path="/clientes-posventa"
            element={
              <PrivateRoute>
                <ClientesPosventa />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>

      {!isAdminPath && <Footer />}
    </div>
  );
}
