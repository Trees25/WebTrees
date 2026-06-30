import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Header from "./HeaderAdmin";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

export default function AdminPersonal() {
  const [personal, setPersonal] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevoPago, setNuevoPago] = useState({
    desarrollador: "",
    proyecto_id: "",
    monto: 0,
    mes: new Date().toISOString().slice(0, 7), // YYYY-MM
  });
  const [pagosHistorico, setPagosHistorico] = useState([]);
  const [nuevoDevMode, setNuevoDevMode] = useState(false);
  const [nuevoDevNombre, setNuevoDevNombre] = useState("");
  const [pagoEditando, setPagoEditando] = useState(null);

  const [filtroProyecto, setFiltroProyecto] = useState("");
  const [filtroDesarrollador, setFiltroDesarrollador] = useState("");
  const [filtroMes, setFiltroMes] = useState("");

  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (profile?.empresa_id) {
      cargarDatos();
    }
  }, [profile]);

  const cargarDatos = async () => {
    setLoading(true);
    await Promise.all([cargarPersonal(), cargarProyectos(), cargarPagos()]);
    setLoading(false);
  };

  const cargarPersonal = async () => {
    const { data } = await supabase
      .from("desarrolladores")
      .select("id, nombre")
      .eq("empresa_id", profile.empresa_id);
    if (data) setPersonal(data);
  };

  const cargarProyectos = async () => {
    const { data } = await supabase
      .from("proyectos")
      .select("id, nombre")
      .eq("empresa_id", profile.empresa_id);
    if (data) setProyectos(data);
  };

  const cargarPagos = async () => {
    // Para simplificar, cargamos todos los pagos de la empresa cruzando con proyectos
    // Para asegurar que mostramos la data correctamente, podríamos hacer un join.
    // Supabase no permite joins automáticos a traves de otras tablas facilmente si no hay FK directa a empresa en la tabla de pagos_personal.
    // Usaremos la FK de proyecto_id para traer nombre y empresa.
    const { data } = await supabase
      .from("pagos_personal")
      .select(`
        id, monto, mes, fecha_pago, desarrollador_id,
        proyectos!inner ( nombre, empresa_id )
      `)
      .eq("proyectos.empresa_id", profile.empresa_id)
      .order("fecha_pago", { ascending: false });

    if (data) setPagosHistorico(data);
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    let desarrollador_final = nuevoPago.desarrollador;

    if (nuevoDevMode && nuevoDevNombre) {
      const { data: devAgregado, error: errorDev } = await supabase
        .from("desarrolladores")
        .insert([{ nombre: nuevoDevNombre, empresa_id: profile.empresa_id }])
        .select()
        .single();
      
      if (errorDev) {
        return alert("Error creando desarrollador: " + errorDev.message);
      }
      desarrollador_final = devAgregado.id;
      setPersonal([...personal, devAgregado]);
    }

    if (!desarrollador_final || !nuevoPago.proyecto_id || nuevoPago.monto <= 0) {
      return alert("Faltan campos obligatorios");
    }

    if (pagoEditando) {
      const { error } = await supabase.from("pagos_personal").update({
        desarrollador_id: desarrollador_final,
        proyecto_id: nuevoPago.proyecto_id,
        monto: nuevoPago.monto,
        mes: nuevoPago.mes
      }).eq("id", pagoEditando.id);
      
      if (error) {
        alert("Error al editar pago: " + error.message);
      } else {
        resetForm();
        cargarPagos();
      }
    } else {
      const { error } = await supabase.from("pagos_personal").insert([{
        desarrollador_id: desarrollador_final,
        proyecto_id: nuevoPago.proyecto_id,
        monto: nuevoPago.monto,
        mes: nuevoPago.mes
      }]);

      if (error) {
        alert("Error al registrar pago: " + error.message);
      } else {
        resetForm();
        cargarPagos();
      }
    }
  };

  const resetForm = () => {
    setNuevoPago({
      desarrollador: "",
      proyecto_id: "",
      monto: 0,
      mes: new Date().toISOString().slice(0, 7)
    });
    setPagoEditando(null);
    setNuevoDevMode(false);
    setNuevoDevNombre("");
  };

  const handleEliminarPago = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.")) return;
    
    const { error } = await supabase.from("pagos_personal").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      cargarPagos();
    }
  };

  const handleEditarClick = (pago) => {
    setPagoEditando(pago);
    setNuevoPago({
      desarrollador: pago.desarrollador_id,
      proyecto_id: pago.proyectos?.id || pago.proyecto_id,
      monto: pago.monto,
      mes: pago.mes
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNombreDesarrollador = (id) => {
    const d = personal.find(p => p.id === id);
    return d ? d.nombre : "Desconocido";
  };

  const pagosFiltrados = pagosHistorico.filter(pago => {
    const matchProyecto = filtroProyecto === "" || pago.proyectos?.nombre.toLowerCase().includes(filtroProyecto.toLowerCase());
    const matchDesarrollador = filtroDesarrollador === "" || pago.desarrollador_id === filtroDesarrollador;
    const matchMes = filtroMes === "" || pago.mes === filtroMes;
    return matchProyecto && matchDesarrollador && matchMes;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Gestión de Personal</h2>
            <p className="text-slate-500">Registro de pagos a desarrolladores por proyecto</p>
          </div>
          <button
            className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            onClick={() => navigate("/admin")}
          >
            ← Volver al Admin
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario Nuevo Pago */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  {pagoEditando ? "Editar Pago" : "Registrar Pago"}
                </h3>
                {pagoEditando && (
                  <button onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-700">
                    Cancelar Edición
                  </button>
                )}
              </div>
              <form onSubmit={handleRegistrarPago} className="space-y-4">
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">Desarrollador *</label>
                    <button type="button" onClick={() => setNuevoDevMode(!nuevoDevMode)} className="text-xs text-indigo-600 font-bold">
                      {nuevoDevMode ? "Usar existente" : "+ Nuevo"}
                    </button>
                  </div>

                  {nuevoDevMode ? (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <input className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" placeholder="Nombre completo" value={nuevoDevNombre} onChange={e => setNuevoDevNombre(e.target.value)} />
                    </div>
                  ) : (
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={nuevoPago.desarrollador}
                      onChange={(e) => setNuevoPago({ ...nuevoPago, desarrollador: e.target.value })}
                      required={!nuevoDevMode}
                    >
                      <option value="">Seleccionar personal...</option>
                      {personal.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto *</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={nuevoPago.proyecto_id}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, proyecto_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar proyecto...</option>
                    {proyectos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($) *</label>
                    <input type="number" required min="1" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" value={nuevoPago.monto} onChange={e => setNuevoPago({...nuevoPago, monto: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mes *</label>
                    <input type="month" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none text-sm" value={nuevoPago.mes} onChange={e => setNuevoPago({...nuevoPago, mes: e.target.value})} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95 mt-4">
                  {pagoEditando ? "Guardar Cambios" : "Registrar Pago"}
                </button>
              </form>
            </div>
          </div>

          {/* Listado de Pagos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-slate-800">Historial de Pagos</h3>
                
                <div className="flex flex-wrap gap-2">
                  <input 
                    type="text" 
                    placeholder="Filtrar proyecto..." 
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={filtroProyecto}
                    onChange={(e) => setFiltroProyecto(e.target.value)}
                  />
                  <select 
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={filtroDesarrollador}
                    onChange={(e) => setFiltroDesarrollador(e.target.value)}
                  >
                    <option value="">Todos los desarrolladores</option>
                    {personal.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <input 
                    type="month" 
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                  />
                  {(filtroProyecto || filtroDesarrollador || filtroMes) && (
                    <button 
                      onClick={() => {setFiltroProyecto(""); setFiltroDesarrollador(""); setFiltroMes("");}}
                      className="px-3 py-1.5 text-xs text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Fecha</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Desarrollador</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Proyecto</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Mes</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase text-right">Monto</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagosFiltrados.map((pago) => (
                      <tr key={pago.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-500">{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-800">{getNombreDesarrollador(pago.desarrollador_id)}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{pago.proyectos?.nombre}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 font-medium">{pago.mes}</td>
                        <td className="py-3 px-4 text-sm font-bold text-emerald-600 text-right">${pago.monto}</td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button onClick={() => handleEditarClick(pago)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Editar</button>
                          <button onClick={() => handleEliminarPago(pago.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Borrar</button>
                        </td>
                      </tr>
                    ))}
                    {pagosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                          No se encontraron pagos con esos filtros
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
