// src/components/Login.js
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        navigate("/admin");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.message === "Failed to fetch") {
        setError(
          "Error de conexión: No se pudo contactar con Supabase. Verificá tu internet o si el servicio está caído.",
        );
      } else {
        setError("Ocurrió un error inesperado al intentar ingresar.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <img
            src="/assets/logo.png"
            alt="Logo"
            className="w-48 mx-auto mb-6 opacity-90 invert grayscale contrast-200 mix-blend-screen"
          />
          <h2 className="text-2xl font-bold text-white">Bienvenido de nuevo</h2>
          <p className="text-slate-400 mt-2">
            Ingresá tus credenciales para continuar
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-700/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 italic space-y-2">
                <p>{error}</p>
                {error.includes("conexión") && (
                  <button
                    type="button"
                    onClick={handleResetSession}
                    className="text-xs font-bold underline hover:text-red-800 block"
                  >
                    Resetear sesión y reintentar
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full text-black pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full text-black pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Entrar al Sistema"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          © {new Date().getFullYear()} Trees Gestión. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
