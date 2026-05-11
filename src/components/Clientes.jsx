import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/HeaderAdmin";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    dni_cuit: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  const navigate = useNavigate();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();

  useEffect(() => {
    if (profile?.empresa_id) {
      cargarClientes();
    }
  }, [profile]);

  const cargarClientes = async () => {
    if (!profile?.empresa_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("empresa_id", profile.empresa_id)
      .order("creado_en", { ascending: false });

    if (!error) setClientes(data);
    setLoading(false);
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nuevoCliente.nombre) return alert("El nombre es obligatorio");
    if (!profile?.empresa_id) return alert("No tenés una empresa asociada.");

    const { error } = await supabase.from("clientes").insert([
      {
        ...nuevoCliente,
        empresa_id: profile.empresa_id,
      },
    ]);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setNuevoCliente({
        nombre: "",
        dni_cuit: "",
        email: "",
        telefono: "",
        direccion: "",
      });
      cargarClientes();
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) {
      alert("Error: " + error.message);
    } else {
      cargarClientes();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-900">
      <Header />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Gestión de Clientes
            </h2>
            <p className="text-slate-500">
              Administra tu base de datos de clientes
            </p>
            {profileError && (
              <p className="text-red-500 text-sm font-bold mt-2">
                Error: {profileError}
              </p>
            )}
          </div>
          <button
            className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            onClick={() => navigate("/admin")}
          >
            ← Volver al Admin
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6">
                Nuevo Cliente
              </h3>
              <form onSubmit={handleAgregar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={nuevoCliente.nombre}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        nombre: e.target.value,
                      })
                    }
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    DNI / CUIT
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={nuevoCliente.dni_cuit}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        dni_cuit: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={nuevoCliente.telefono}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        telefono: e.target.value,
                      })
                    }
                    placeholder="Ej: 11 1234-5678"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Agregar Cliente
                </button>
              </form>
            </div>
          </div>

          {/* Listado */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-4 px-6 text-sm font-semibold text-slate-600">
                        Nombre
                      </th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-600">
                        DNI/CUIT
                      </th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-600">
                        Teléfono
                      </th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientes.map((cli) => (
                      <tr
                        key={cli.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            {cli.nombre}
                            {cli.tipo === "lead" && (
                              <span className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-600 rounded-full uppercase tracking-tighter shadow-sm border border-blue-200">
                                Posible Cliente
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500">
                          {cli.dni_cuit || "-"}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500">
                          {cli.telefono || "-"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleEliminar(cli.id)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {clientes.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-slate-400 italic"
                        >
                          No hay clientes registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
