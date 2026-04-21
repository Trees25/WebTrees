import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/HeaderAdmin";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

export default function Perfiles() {
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevo, setNuevo] = useState({
    alias: "",
    beneficiario: "",
    dni: "",
    banco: "",
    cbu_alias: "",
  });
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const navigate = useNavigate();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();

  useEffect(() => {
    if (profile?.empresa_id) {
      cargarPerfiles();
    }
  }, [profile]);

  const cargarPerfiles = async () => {
    if (!profile?.empresa_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("perfiles_pago")
      .select("*")
      .eq("empresa_id", profile.empresa_id)
      .order("creado_en", { ascending: false });

    if (!error) setPerfiles(data || []);
    setLoading(false);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!nuevo.alias) return;
    if (!profile?.empresa_id) return alert("No tenés una empresa asociada.");

    setLoading(true);
    if (idEnEdicion) {
      // Actualizar existente
      const { error } = await supabase
        .from("perfiles_pago")
        .update(nuevo)
        .eq("id", idEnEdicion);

      if (!error) {
        setIdEnEdicion(null);
        setNuevo({
          alias: "",
          beneficiario: "",
          dni: "",
          banco: "",
          cbu_alias: "",
        });
        cargarPerfiles();
      }
    } else {
      // Insertar nuevo
      const { error } = await supabase.from("perfiles_pago").insert([
        {
          ...nuevo,
          empresa_id: profile.empresa_id,
        },
      ]);
      if (!error) {
        setNuevo({
          alias: "",
          beneficiario: "",
          dni: "",
          banco: "",
          cbu_alias: "",
        });
        cargarPerfiles();
      }
    }
    setLoading(false);
  };

  const handleEdit = (p) => {
    setIdEnEdicion(p.id);
    setNuevo({
      alias: p.alias || "",
      beneficiario: p.beneficiario || "",
      dni: p.dni || "",
      banco: p.banco || "",
      cbu_alias: p.cbu_alias || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelar = () => {
    setIdEnEdicion(null);
    setNuevo({
      alias: "",
      beneficiario: "",
      dni: "",
      banco: "",
      cbu_alias: "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta cuenta de pago?")) return;
    const { error } = await supabase
      .from("perfiles_pago")
      .delete()
      .eq("id", id);
    if (!error) cargarPerfiles();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header />
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Cuentas de Pago
            </h2>
            <p className="text-slate-500">
              Configura tus datos bancarios para los PDFs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24 transition-all">
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                {idEnEdicion ? "Editar Cuenta" : "Nueva Cuenta"}
              </h3>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Alias de la Cuenta (ej: Mercado Pago)
                  </label>
                  <input
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all font-medium"
                    placeholder="Para identificar el banco o billetera"
                    value={nuevo.alias}
                    onChange={(e) =>
                      setNuevo({ ...nuevo, alias: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Beneficiario
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all"
                    placeholder="Nombre completo"
                    value={nuevo.beneficiario}
                    onChange={(e) =>
                      setNuevo({ ...nuevo, beneficiario: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    DNI/CUIT
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all"
                    value={nuevo.dni}
                    onChange={(e) =>
                      setNuevo({ ...nuevo, dni: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Banco
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all"
                    value={nuevo.banco}
                    onChange={(e) =>
                      setNuevo({ ...nuevo, banco: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    CBU/Alias
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all"
                    value={nuevo.cbu_alias}
                    onChange={(e) =>
                      setNuevo({ ...nuevo, cbu_alias: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {idEnEdicion ? "Guardar Cambios" : "Agregar Cuenta"}
                  </button>
                  {idEnEdicion && (
                    <button
                      type="button"
                      onClick={handleCancelar}
                      className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 text-sm"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            {perfiles.map((p) => (
              <div
                key={p.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center group hover:border-blue-200 transition-all"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    {p.alias}
                    {p.id === idEnEdicion && (
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Editando
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-slate-500 italic">
                    {p.beneficiario}
                  </p>
                  <div className="mt-2 flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      🏦 {p.banco}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      🔑 {p.cbu_alias}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 px-4 text-blue-600 hover:bg-blue-50 font-bold rounded-lg text-xs transition-all"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 px-4 text-red-500 hover:bg-red-50 font-bold rounded-lg text-xs transition-all"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            {perfiles.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
                No hay cuentas configuradas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
