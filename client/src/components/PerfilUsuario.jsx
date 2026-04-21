import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/HeaderAdmin";
import { useProfile } from "../hooks/useProfile";
import { useNavigate } from "react-router-dom";

export default function PerfilUsuario() {
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refreshProfile,
  } = useProfile();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre_usuario || "");
      setApellido(profile.apellido_usuario || "");
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const { error } = await supabase
      .from("perfiles_usuario")
      .update({
        nombre_usuario: nombre,
        apellido_usuario: apellido,
      })
      .eq("user_id", profile.user_id);

    if (error) {
      setMessage({
        type: "error",
        text: "Error al actualizar: " + error.message,
      });
    } else {
      setMessage({ type: "success", text: "¡Perfil actualizado con éxito!" });
      await refreshProfile();
    }
    setSaving(false);
  };

  if (profileLoading)
    return (
      <div className="p-8 text-center text-slate-500">Cargando perfil...</div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header />
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Mi Perfil</h2>
          <button
            onClick={() => navigate("/admin")}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Volver
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                {nombre
                  ? nombre[0].toUpperCase()
                  : profile?.email
                    ? profile.email[0].toUpperCase()
                    : "?"}
              </div>
              <h3 className="text-center font-bold text-slate-800 mb-1">
                {nombre ? `${nombre} ${apellido}` : "Usuario"}
              </h3>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Empresa
                </p>
                <div className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold flex items-center gap-2">
                  🌲 Trees
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate("/perfiles")}
              className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-100 cursor-pointer hover:bg-indigo-700 transition-all group"
            >
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                💳 Cuentas de Cobro
                <span className="text-white/50 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </h4>
              <p className="text-indigo-100 text-xs text-pretty italic">
                Gestiona tus datos bancarios y sus alias (ej: Mercado Pago) para
                tus recibos.
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">
                Configuración del Usuario
              </h3>
              <form onSubmit={handleSave} className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre
                    </label>
                    <input
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Tu nombre real"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Apellido
                    </label>
                    <input
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Tu apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                    />
                  </div>
                </div>

                {message.text && (
                  <div
                    className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                      message.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {message.type === "success" ? "✅" : "⚠️"}
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-10 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Actualizar Datos"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
