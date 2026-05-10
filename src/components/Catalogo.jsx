import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/HeaderAdmin";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

export default function Catalogo() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "" });
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const navigate = useNavigate();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();

  useEffect(() => {
    if (profile?.empresa_id) {
      cargarServicios();
    }
  }, [profile]);

  const cargarServicios = async () => {
    if (!profile?.empresa_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .eq("empresa_id", profile.empresa_id)
      .order("nombre", { ascending: true });

    if (!error) setServicios(data || []);
    setLoading(false);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!nuevo.nombre) return;
    if (!profile?.empresa_id) return alert("No tenés una empresa asociada.");

    setLoading(true);

    if (idEnEdicion) {
      // Actualizar existente
      const { error } = await supabase
        .from("servicios")
        .update(nuevo)
        .eq("id", idEnEdicion);

      if (!error) {
        setIdEnEdicion(null);
        setNuevo({ nombre: "", precio: "" });
        cargarServicios();
      } else {
        alert("Error al actualizar: " + error.message);
      }
    } else {
      // Insertar nuevo
      const { error } = await supabase.from("servicios").insert([
        {
          ...nuevo,
          empresa_id: profile.empresa_id,
        },
      ]);
      if (!error) {
        setNuevo({ nombre: "", precio: "" });
        cargarServicios();
      } else {
        alert("Error al agregar servicio: " + error.message);
      }
    }
    setLoading(false);
  };

  const handleEdit = (s) => {
    setIdEnEdicion(s.id);
    setNuevo({ nombre: s.nombre, precio: s.precio });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelar = () => {
    setIdEnEdicion(null);
    setNuevo({ nombre: "", precio: "" });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este servicio del catálogo?")) return;
    const { error } = await supabase.from("servicios").delete().eq("id", id);
    if (!error) cargarServicios();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header />
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Catálogo de Servicios
            </h2>
            <p className="text-slate-500">
              Administra tus servicios y precios predefinidos
            </p>
          </div>
        </div>

        <div
          className={`bg-white p-6 rounded-2xl shadow-sm border transition-all ${idEnEdicion ? "border-amber-300 ring-4 ring-amber-50" : "border-slate-200"} mb-8`}
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            {idEnEdicion ? "Editar Servicio" : "Nuevo Servicio"}
          </h3>
          <form
            onSubmit={handleGuardar}
            className="flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1 font-bold">
                Nombre
              </label>
              <input
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                placeholder="Ej: Poda de altura"
              />
            </div>
            <div className="w-full md:w-32">
              <label className="block text-sm font-medium text-slate-700 mb-1 font-bold">
                Precio
              </label>
              <input
                required
                type="number"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20"
                value={nuevo.precio}
                onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 md:flex-none px-8 py-2 bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {idEnEdicion ? "Actualizar" : "Guardar"}
              </button>
              {idEnEdicion && (
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
              >
                <div className="flex-1">
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    {s.nombre}
                    {idEnEdicion === s.id && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                        Editando
                      </span>
                    )}
                  </p>
                  <p className="text-amber-600 font-bold text-sm">
                    ${Number(s.precio).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => handleEdit(s)}
                    className="p-2 px-4 text-amber-600 hover:bg-amber-50 font-bold rounded-lg text-xs transition-all"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(s.id)}
                    className="p-2 px-4 text-red-100 hover:text-red-500 transition-colors font-bold text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            {servicios.length === 0 && (
              <div className="p-12 text-center text-slate-400 italic">
                No hay servicios en el catálogo
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
