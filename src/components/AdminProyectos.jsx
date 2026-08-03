import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Header from "./HeaderAdmin";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

export default function AdminProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [desarrolladores, setDesarrolladores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre: "",
    estado: "en_desarrollo",
    tipo_proyecto: "Otro",
    valor_total: 0,
    mensualidad: 0,
    fecha_limite: "",
    cliente_id: "",
    desarrolladores_ids: [],
  });
  const [nuevoClienteMode, setNuevoClienteMode] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", dni_cuit: "", telefono: "" });
  const [nuevoDevMode, setNuevoDevMode] = useState(false);
  const [nuevoDevNombre, setNuevoDevNombre] = useState("");
  const [pagoMode, setPagoMode] = useState(null);
  const [montoPago, setMontoPago] = useState(0);
  const [tipoPago, setTipoPago] = useState("proyecto");
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [pagoProyectoEditando, setPagoProyectoEditando] = useState(null);
  const [edicionPagoForm, setEdicionPagoForm] = useState({ monto: 0, fecha_pago: "" });
  
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (profile?.empresa_id) {
      cargarDatos();
    }
  }, [profile]);

  const cargarDatos = async () => {
    setLoading(true);
    await Promise.all([cargarProyectos(), cargarClientes(), cargarDesarrolladores()]);
    setLoading(false);
  };

  const cargarProyectos = async () => {
    const { data } = await supabase
      .from("proyectos")
      .select("*, clientes(nombre), pagos_proyectos(id, monto, tipo_pago, fecha_pago), proyectos_desarrolladores(desarrolladores(id, nombre))")
      .eq("empresa_id", profile.empresa_id)
      .order("creado_en", { ascending: false });
    
    if (data) setProyectos(data);
  };

  const cargarClientes = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("id, nombre")
      .eq("empresa_id", profile.empresa_id);
    if (data) setClientes(data);
  };

  const cargarDesarrolladores = async () => {
    const { data } = await supabase
      .from("desarrolladores")
      .select("id, nombre")
      .eq("empresa_id", profile.empresa_id);
    if (data) setDesarrolladores(data);
  };

  const handleAgregarProyecto = async (e) => {
    e.preventDefault();
    if (!profile?.empresa_id) return alert("No tenés una empresa asociada.");

    let cliente_id_final = nuevoProyecto.cliente_id;

    if (nuevoClienteMode) {
      if (!nuevoCliente.nombre) return alert("El nombre del cliente es obligatorio");
      const { data: clienteAgregado, error: errorCliente } = await supabase
        .from("clientes")
        .insert([{ ...nuevoCliente, empresa_id: profile.empresa_id }])
        .select()
        .single();
      
      if (errorCliente) {
        return alert("Error creando cliente: " + errorCliente.message);
      }
      cliente_id_final = clienteAgregado.id;
      setClientes([...clientes, clienteAgregado]);
    }

    if (!cliente_id_final || !nuevoProyecto.nombre) return alert("Faltan campos obligatorios");

    let devs_actualizados = [...nuevoProyecto.desarrolladores_ids];

    if (nuevoDevMode && nuevoDevNombre) {
      const { data: devAgregado, error: errorDev } = await supabase
        .from("desarrolladores")
        .insert([{ nombre: nuevoDevNombre, empresa_id: profile.empresa_id }])
        .select()
        .single();
      
      if (errorDev) {
        return alert("Error creando desarrollador: " + errorDev.message);
      }
      devs_actualizados.push(devAgregado.id);
      setDesarrolladores([...desarrolladores, devAgregado]);
    }

    if (proyectoEditando) {
      const { error } = await supabase.from("proyectos").update({
        nombre: nuevoProyecto.nombre,
        estado: nuevoProyecto.estado,
        tipo_proyecto: nuevoProyecto.tipo_proyecto,
        valor_total: nuevoProyecto.valor_total,
        mensualidad: nuevoProyecto.mensualidad,
        fecha_limite: nuevoProyecto.fecha_limite || null,
        cliente_id: cliente_id_final,
      }).eq("id", proyectoEditando.id);
      
      if (error) {
        return alert("Error al actualizar proyecto: " + error.message);
      }
      
      // Actualizar relaciones (borrar las viejas e insertar las nuevas)
      await supabase.from("proyectos_desarrolladores").delete().eq("proyecto_id", proyectoEditando.id);
      if (devs_actualizados.length > 0) {
        const relaciones = devs_actualizados.map(devId => ({
          proyecto_id: proyectoEditando.id,
          desarrollador_id: devId
        }));
        await supabase.from("proyectos_desarrolladores").insert(relaciones);
      }
      
      resetFormProyecto();
    } else {
      const { data: proyAgregado, error } = await supabase.from("proyectos").insert([{
        nombre: nuevoProyecto.nombre,
        estado: nuevoProyecto.estado,
        tipo_proyecto: nuevoProyecto.tipo_proyecto,
        valor_total: nuevoProyecto.valor_total,
        mensualidad: nuevoProyecto.mensualidad,
        fecha_limite: nuevoProyecto.fecha_limite || null,
        cliente_id: cliente_id_final,
        empresa_id: profile.empresa_id
      }]).select().single();

      if (error) {
        return alert("Error al agregar proyecto: " + error.message);
      }
      
      // Insertar relaciones
      if (devs_actualizados.length > 0) {
        const relaciones = devs_actualizados.map(devId => ({
          proyecto_id: proyAgregado.id,
          desarrollador_id: devId
        }));
        await supabase.from("proyectos_desarrolladores").insert(relaciones);
      }

      resetFormProyecto();
    }
  };

  const resetFormProyecto = () => {
    setNuevoProyecto({
      nombre: "", estado: "en_desarrollo", tipo_proyecto: "Otro", valor_total: 0, mensualidad: 0, fecha_limite: "", cliente_id: "", desarrolladores_ids: []
    });
    setNuevoClienteMode(false);
    setNuevoDevMode(false);
    setNuevoDevNombre("");
    setProyectoEditando(null);
    cargarProyectos();
  };

  const handleEditarProyectoClick = (proyecto) => {
    setProyectoEditando(proyecto);
    
    // Extraer los ids de los desarrolladores asignados de la tabla intermedia
    const devsAsignados = proyecto.proyectos_desarrolladores?.map(rel => rel.desarrolladores?.id).filter(id => id) || [];
    
    setNuevoProyecto({
      nombre: proyecto.nombre,
      estado: proyecto.estado,
      tipo_proyecto: proyecto.tipo_proyecto || "Otro",
      valor_total: proyecto.valor_total,
      mensualidad: proyecto.mensualidad,
      fecha_limite: proyecto.fecha_limite || "",
      cliente_id: proyecto.cliente_id || "",
      desarrolladores_ids: devsAsignados,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoverDevTag = (idToRemove) => {
    setNuevoProyecto({
      ...nuevoProyecto,
      desarrolladores_ids: nuevoProyecto.desarrolladores_ids.filter(id => id !== idToRemove)
    });
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    if (!pagoMode || montoPago <= 0) return;

    const { error } = await supabase.from("pagos_proyectos").insert([{
      proyecto_id: pagoMode,
      monto: montoPago,
      tipo_pago: tipoPago
    }]);

    if (error) {
      alert("Error al registrar pago: " + error.message);
    } else {
      setPagoMode(null);
      setMontoPago(0);
      setTipoPago("proyecto");
      cargarProyectos();
    }
  };

  const handleEliminarPagoProyecto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este pago?")) return;
    const { error } = await supabase.from("pagos_proyectos").delete().eq("id", id);
    if (error) alert("Error: " + error.message);
    else cargarProyectos();
  };

  const handleEditarPagoProyectoClick = (pago) => {
    setPagoProyectoEditando(pago.id);
    setEdicionPagoForm({
      monto: pago.monto,
      fecha_pago: pago.fecha_pago ? new Date(pago.fecha_pago).toISOString().split('T')[0] : ""
    });
  };

  const guardarEdicionPago = async (e, pagoId) => {
    e.preventDefault();
    if (edicionPagoForm.monto <= 0) return;
    const payload = { monto: Number(edicionPagoForm.monto) };
    if (edicionPagoForm.fecha_pago) {
      payload.fecha_pago = new Date(edicionPagoForm.fecha_pago).toISOString();
    }
    const { error } = await supabase.from("pagos_proyectos").update(payload).eq("id", pagoId);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setPagoProyectoEditando(null);
      cargarProyectos();
    }
  };

  const proyectosFiltrados = proyectos.filter(proyecto => {
    const matchTexto = filtroTexto === "" || 
      proyecto.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || 
      (proyecto.clientes?.nombre && proyecto.clientes.nombre.toLowerCase().includes(filtroTexto.toLowerCase()));
      
    // Buscamos que la fecha de creación coincida con la fecha (formato YYYY-MM-DD)
    const matchFecha = filtroFecha === "" || 
      (proyecto.creado_en && proyecto.creado_en.startsWith(filtroFecha));
      
    return matchTexto && matchFecha;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 text-slate-900 dark:text-slate-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-start justify-between mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestión de Proyectos</h2>
              <p className="text-slate-500 dark:text-slate-400">Administra los proyectos y pagos de clientes</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-4 py-2 text-sm font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-lg shadow-sm hover:bg-amber-100 transition-all active:scale-95"
                onClick={() => navigate("/gestion-interna-personal")}
              >
                💸 Pagos
              </button>
              <button
                className="px-4 py-2 text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg shadow-sm hover:bg-emerald-100 transition-all active:scale-95"
                onClick={() => navigate("/gestion-interna-balance")}
              >
                📈 Balance
              </button>
            </div>
          </div>
          <button
            className="px-4 py-2 text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-950 transition-all active:scale-95"
            onClick={() => navigate("/gestion-interna")}
          >
            ← Volver al Admin
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario Nuevo Proyecto */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {proyectoEditando ? "Editar Proyecto" : "Nuevo Proyecto"}
                </h3>
                {proyectoEditando && (
                  <button onClick={resetFormProyecto} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200">
                    Cancelar Edición
                  </button>
                )}
              </div>
              <form onSubmit={handleAgregarProyecto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nombre del Proyecto *</label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:text-slate-100"
                    value={nuevoProyecto.nombre}
                    onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Estado</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:text-slate-100"
                      value={nuevoProyecto.estado}
                      onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, estado: e.target.value })}
                    >
                      <option value="en_desarrollo">En Desarrollo</option>
                      <option value="en_produccion">En Producción</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tipo de Proyecto</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:text-slate-100"
                      value={nuevoProyecto.tipo_proyecto}
                      onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, tipo_proyecto: e.target.value })}
                    >
                      <option value="Sistema">Sistema</option>
                      <option value="Página Web">Página Web</option>
                      <option value="Aplicación Móvil">Aplicación Móvil</option>
                      <option value="E-Commerce">E-Commerce</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Cliente *</label>
                    <button type="button" onClick={() => setNuevoClienteMode(!nuevoClienteMode)} className="text-xs text-indigo-600 font-bold">
                      {nuevoClienteMode ? "Usar existente" : "+ Nuevo Cliente"}
                    </button>
                  </div>
                  
                  {nuevoClienteMode ? (
                    <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                      <input className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-md" placeholder="Nombre" value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} />
                      <input className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-md" placeholder="Teléfono" value={nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} />
                    </div>
                  ) : (
                    <select
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:text-slate-100"
                      value={nuevoProyecto.cliente_id}
                      onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, cliente_id: e.target.value })}
                      required={!nuevoClienteMode}
                    >
                      <option value="">Selecciona un cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Valor Total ($)</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none" value={nuevoProyecto.valor_total} onChange={e => setNuevoProyecto({...nuevoProyecto, valor_total: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Mensualidad ($)</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none" value={nuevoProyecto.mensualidad} onChange={e => setNuevoProyecto({...nuevoProyecto, mensualidad: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Fecha Límite</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none" value={nuevoProyecto.fecha_limite} onChange={e => setNuevoProyecto({...nuevoProyecto, fecha_limite: e.target.value})} />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Desarrolladores a Cargo</label>
                    <button type="button" onClick={() => setNuevoDevMode(!nuevoDevMode)} className="text-xs text-indigo-600 font-bold">
                      {nuevoDevMode ? "Usar existente" : "+ Nuevo"}
                    </button>
                  </div>

                  {nuevoDevMode ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 mb-2">
                      <input className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-md" placeholder="Nombre completo del nuevo" value={nuevoDevNombre} onChange={e => setNuevoDevNombre(e.target.value)} />
                    </div>
                  ) : (
                    <select
                      className="w-full px-4 py-2 mb-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:text-slate-100"
                      value=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !nuevoProyecto.desarrolladores_ids.includes(val)) {
                          setNuevoProyecto({...nuevoProyecto, desarrolladores_ids: [...nuevoProyecto.desarrolladores_ids, val]});
                        }
                      }}
                    >
                      <option value="">Añadir desarrollador...</option>
                      {desarrolladores.filter(d => !nuevoProyecto.desarrolladores_ids.includes(d.id)).map(d => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  )}

                  {/* Etiquetas de desarrolladores seleccionados */}
                  {nuevoProyecto.desarrolladores_ids.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {nuevoProyecto.desarrolladores_ids.map(id => {
                        const dev = desarrolladores.find(d => d.id === id);
                        return dev ? (
                          <span key={id} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-xs font-bold">
                            {dev.nombre}
                            <button type="button" onClick={() => handleRemoverDevTag(id)} className="text-indigo-400 hover:text-indigo-600">×</button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                  {proyectoEditando ? "Guardar Cambios" : "Agregar Proyecto"}
                </button>
              </form>
            </div>
          </div>

          {/* Listado de Proyectos */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Proyectos Activos</h3>
                
                <div className="flex flex-wrap gap-2">
                  <input 
                    type="text" 
                    placeholder="Buscar proyecto o cliente..." 
                    className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:text-slate-100"
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                  />
                  <input 
                    type="date" 
                    className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:text-slate-100"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                  />
                  {(filtroTexto || filtroFecha) && (
                    <button 
                      onClick={() => {setFiltroTexto(""); setFiltroFecha("");}}
                      className="px-3 py-1.5 text-xs text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                {proyectosFiltrados.map((proyecto) => {
                  const pagosProyecto = proyecto.pagos_proyectos?.filter(p => p.tipo_pago === 'proyecto' || !p.tipo_pago) || [];
                  const pagosMensualidad = proyecto.pagos_proyectos?.filter(p => p.tipo_pago === 'mensualidad') || [];
                  
                  const totalPagadoProyecto = pagosProyecto.reduce((acc, p) => acc + Number(p.monto), 0);
                  const totalPagadoMensualidad = pagosMensualidad.reduce((acc, p) => acc + Number(p.monto), 0);
                  
                  const saldoRestante = Number(proyecto.valor_total) - totalPagadoProyecto;
                  const fechaLimiteFormat = proyecto.fecha_limite ? new Date(proyecto.fecha_limite) : null;
                  const esFechaCercana = fechaLimiteFormat && (fechaLimiteFormat - new Date()) / (1000 * 60 * 60 * 24) <= 5;
                  
                  return (
                    <div key={proyecto.id} className={`border ${esFechaCercana ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'} rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center transition-colors`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{proyecto.nombre}</h4>
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${proyecto.estado === 'en_produccion' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {proyecto.estado.replace('_', ' ')}
                          </span>
                          {proyecto.tipo_proyecto && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                              {proyecto.tipo_proyecto}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Cliente: {proyecto.clientes?.nombre || 'Desconocido'}</p>
                        
                        {/* Mostrar lista de desarrolladores asignados */}
                        {proyecto.proyectos_desarrolladores?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {proyecto.proyectos_desarrolladores.map(rel => (
                              <span key={rel.desarrolladores?.id} className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded font-bold">
                                👨‍💻 {rel.desarrolladores?.nombre}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-xs text-slate-400 mt-1">Creado el {new Date(proyecto.creado_en).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Valor: ${proyecto.valor_total} | Pagado (Proyecto): <span className="text-emerald-600 font-bold">${totalPagadoProyecto}</span> | Resta: ${saldoRestante}
                        </p>
                        {totalPagadoMensualidad > 0 && (
                          <p className="text-xs text-indigo-600 mt-1 font-semibold">Total cobrado de Mensualidades: ${totalPagadoMensualidad}</p>
                        )}
                        {proyecto.fecha_limite && (
                          <p className={`text-xs mt-1 font-semibold ${esFechaCercana ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}>
                            Límite: {new Date(proyecto.fecha_limite).toLocaleDateString()} {esFechaCercana && '⚠️ ¡Alerta!'}
                          </p>
                        )}
                        
                        {proyecto.pagos_proyectos?.length > 0 && (
                          <details className="mt-3 group">
                            <summary className="text-xs text-indigo-600 font-bold cursor-pointer hover:text-indigo-800 list-none flex items-center gap-1">
                              <span className="group-open:rotate-90 transition-transform">▶</span> Ver historial de pagos
                            </summary>
                            <div className="mt-2 pl-4 border-l-2 border-indigo-100 space-y-2">
                              {proyecto.pagos_proyectos.map(pago => (
                                pagoProyectoEditando === pago.id ? (
                                  <form key={pago.id} onSubmit={(e) => guardarEdicionPago(e, pago.id)} className="flex items-center gap-2 bg-indigo-50 p-2 rounded border border-indigo-100 shadow-sm text-xs">
                                    <input type="date" required className="px-2 py-1 border border-slate-300 rounded outline-none" value={edicionPagoForm.fecha_pago} onChange={e => setEdicionPagoForm({...edicionPagoForm, fecha_pago: e.target.value})} />
                                    <span className="font-bold text-slate-600 dark:text-slate-300 uppercase hidden sm:inline">{pago.tipo_pago || 'proyecto'}</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-100">$</span>
                                    <input type="number" required min="1" className="w-20 px-2 py-1 border border-slate-300 rounded outline-none" value={edicionPagoForm.monto} onChange={e => setEdicionPagoForm({...edicionPagoForm, monto: e.target.value})} />
                                    <div className="flex gap-1 ml-auto">
                                      <button type="submit" className="bg-emerald-600 text-white px-2 py-1 rounded font-bold hover:bg-emerald-700">Guardar</button>
                                      <button type="button" onClick={() => setPagoProyectoEditando(null)} className="bg-slate-200 text-slate-700 dark:text-slate-200 px-2 py-1 rounded font-bold hover:bg-slate-300">Cancelar</button>
                                    </div>
                                  </form>
                                ) : (
                                  <div key={pago.id} className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <div>
                                      <span className="font-semibold text-slate-700 dark:text-slate-200">{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : 'N/A'}</span>
                                      <span className="mx-2 text-slate-400">|</span>
                                      <span className={`uppercase font-bold ${pago.tipo_pago === 'mensualidad' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                        {pago.tipo_pago || 'proyecto'}
                                      </span>
                                      <span className="mx-2 text-slate-400">|</span>
                                      <span className="font-bold text-slate-800 dark:text-slate-100">${pago.monto}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button type="button" onClick={() => handleEditarPagoProyectoClick(pago)} className="text-blue-500 hover:text-blue-700 font-bold">Editar</button>
                                      <button type="button" onClick={() => handleEliminarPagoProyecto(pago.id)} className="text-red-500 hover:text-red-700 font-bold">Borrar</button>
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 w-full md:w-auto items-end">
                        <button onClick={() => handleEditarProyectoClick(proyecto)} className="text-blue-500 hover:text-blue-700 text-xs font-bold mb-2">
                          ✎ Editar Proyecto
                        </button>
                        {pagoMode === proyecto.id ? (
                          <form onSubmit={handleRegistrarPago} className="flex flex-col gap-2 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <input type="radio" name="tipoPago" value="proyecto" checked={tipoPago === 'proyecto'} onChange={(e) => setTipoPago(e.target.value)} /> Proyecto
                              </label>
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <input type="radio" name="tipoPago" value="mensualidad" checked={tipoPago === 'mensualidad'} onChange={(e) => setTipoPago(e.target.value)} /> Mensualidad
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="number" required placeholder="Monto" className="w-24 px-2 py-1 border border-slate-300 rounded text-sm outline-none" value={montoPago} onChange={e => setMontoPago(e.target.value)} />
                              <button type="submit" className="bg-emerald-600 text-white px-3 py-1 rounded text-sm font-bold shadow-sm hover:bg-emerald-700">Guardar</button>
                              <button type="button" onClick={() => setPagoMode(null)} className="text-slate-500 dark:text-slate-400 text-sm hover:text-slate-700 dark:text-slate-200">Cancelar</button>
                            </div>
                          </form>
                        ) : (
                          <button onClick={() => {setPagoMode(proyecto.id); setMontoPago(proyecto.mensualidad); setTipoPago('mensualidad');}} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors whitespace-nowrap">
                            Registrar Pago
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {proyectosFiltrados.length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8 italic">No se encontraron proyectos con esos filtros.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
