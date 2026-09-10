import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Header from "./HeaderAdmin";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

const CONFIG_TIPOS = {
  desarrollador: {
    label: "Desarrollador",
    tabla_entidad: "desarrolladores",
    tabla_pago: "pagos_personal",
    id_field: "desarrollador_id"
  },
  proveedor: {
    label: "Proveedor",
    tabla_entidad: "proveedores",
    tabla_pago: "pagos_proveedores",
    id_field: "proveedor_id"
  },
  app: {
    label: "App de Terceros",
    tabla_entidad: "apps_terceros",
    tabla_pago: "pagos_apps",
    id_field: "app_id"
  }
};

export default function AdminPersonal() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState("desarrollador");
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  // Utilities para sacar mes local y evitar bugs UTC
  const dToday = new Date();
  const defaultLocalMonth = `${dToday.getFullYear()}-${String(dToday.getMonth() + 1).padStart(2, '0')}`;

  const [nuevoPago, setNuevoPago] = useState({
    beneficiario_id: "",
    proyecto_id: "",
    monto: 0,
    mes: defaultLocalMonth, // YYYY-MM
    fecha_pago: "",
  });
  const [pagosHistorico, setPagosHistorico] = useState([]);
  const [nuevoBenefMode, setNuevoBenefMode] = useState(false);
  const [nuevoBenefNombre, setNuevoBenefNombre] = useState("");
  const [pagoEditando, setPagoEditando] = useState(null);

  // Estados para reparto de utilidades
  const [mesReparto, setMesReparto] = useState(defaultLocalMonth);
  const [datosReparto, setDatosReparto] = useState(null);
  const [aplicarRetencion, setAplicarRetencion] = useState(true);

  const [filtroProyecto, setFiltroProyecto] = useState("");
  const [filtroBeneficiario, setFiltroBeneficiario] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const navigate = useNavigate();

  // Helper functions for reliable local date rendering
  const mostrarFecha = (fechaStr) => {
    if (!fechaStr) return "N/A";
    if (fechaStr.length === 10) {
      const [y, m, d] = fechaStr.split('-');
      return `${d}/${m}/${y}`;
    }
    if (fechaStr.endsWith('T00:00:00Z') || fechaStr.endsWith('T00:00:00+00:00')) {
      const [y, m, d] = fechaStr.split('T')[0].split('-');
      return `${d}/${m}/${y}`;
    }
    return new Date(fechaStr).toLocaleDateString();
  };

  const getFechaInput = (fechaStr) => {
    if (!fechaStr) return "";
    if (fechaStr.length === 10) return fechaStr;
    if (fechaStr.endsWith('T00:00:00Z') || fechaStr.endsWith('T00:00:00+00:00')) {
      return fechaStr.split('T')[0];
    }
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const combinarFechaConHoraActual = (fechaStringYMD) => {
    if (!fechaStringYMD) return null;
    const [year, month, day] = fechaStringYMD.split('-');
    const d = new Date();
    d.setFullYear(Number(year), Number(month) - 1, Number(day));
    return d.toISOString();
  };

  const obtenerMesLocal = (fechaString) => {
    if (!fechaString) return "Sin Fecha";
    try {
      if (fechaString.length === 10) {
        const [y, m, d] = fechaString.split('-');
        return `${y}-${m}`;
      }
      if (fechaString.endsWith('T00:00:00Z') || fechaString.endsWith('T00:00:00+00:00')) {
        const parteFecha = fechaString.split('T')[0];
        const [y, m, d] = parteFecha.split('-');
        return `${y}-${m}`;
      }
      const d = new Date(fechaString);
      if (isNaN(d.getTime())) return "Sin Fecha";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    } catch (e) {
      return "Sin Fecha";
    }
  };

  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (profile?.empresa_id) {
      cargarDatosBase();
      cargarPagosHistorico();
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.empresa_id) {
      cargarBeneficiarios(tipoSeleccionado);
      setNuevoPago(prev => ({ 
        ...prev, 
        beneficiario_id: "",
        fecha_pago: getFechaInput(new Date().toISOString())
      }));
      setNuevoBenefMode(false);
      setNuevoBenefNombre("");
    }
  }, [tipoSeleccionado, profile]);

  const cargarDatosBase = async () => {
    const { data } = await supabase
      .from("proyectos")
      .select("id, nombre")
      .eq("empresa_id", profile.empresa_id);
    if (data) setProyectos(data);
  };

  const cargarBeneficiarios = async (tipo) => {
    setLoading(true);
    const conf = CONFIG_TIPOS[tipo];
    if (conf) {
      const { data } = await supabase
        .from(conf.tabla_entidad)
        .select("id, nombre")
        .eq("empresa_id", profile.empresa_id);
      if (data) setBeneficiarios(data);
    }
    setLoading(false);
  };

  const cargarPagosHistorico = async () => {
    setLoading(true);
    let todosLosPagos = [];

    for (const [key, conf] of Object.entries(CONFIG_TIPOS)) {
      // 1. Obtener los IDs de los beneficiarios de esta empresa
      const { data: entidadesData } = await supabase
        .from(conf.tabla_entidad)
        .select("id, nombre")
        .eq("empresa_id", profile.empresa_id);
      
      if (entidadesData && entidadesData.length > 0) {
        const entidadesIds = entidadesData.map(e => e.id);
        const entidadesMap = {};
        entidadesData.forEach(e => { entidadesMap[e.id] = e.nombre });

        // 2. Obtener los pagos solo para esos beneficiarios
        const { data: pagosData, error } = await supabase
          .from(conf.tabla_pago)
          .select(`
            id, monto, mes, fecha_pago, ${conf.id_field}, proyecto_id,
            proyectos ( nombre )
          `)
          .in(conf.id_field, entidadesIds);
        
        if (pagosData) {
          const mapeados = pagosData.map(p => ({
            ...p,
            tipo: key,
            beneficiario_id: p[conf.id_field],
            beneficiario_nombre: entidadesMap[p[conf.id_field]] || "Desconocido"
          }));
          todosLosPagos = [...todosLosPagos, ...mapeados];
        } else if (error && error.code === '42P01') {
          // Si la tabla no existe aún, ignoramos
          console.warn(`Tabla ${conf.tabla_pago} no existe o no hay acceso.`);
        }
      }
    }
    
    // Ordenar por fecha descendente
    todosLosPagos.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));
    setPagosHistorico(todosLosPagos);
    setLoading(false);
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    let benef_final_id = nuevoPago.beneficiario_id;
    const conf = CONFIG_TIPOS[tipoSeleccionado];

    if (nuevoBenefMode && nuevoBenefNombre) {
      const { data: benefAgregado, error: errorBenef } = await supabase
        .from(conf.tabla_entidad)
        .insert([{ nombre: nuevoBenefNombre, empresa_id: profile.empresa_id }])
        .select()
        .single();
      
      if (errorBenef) {
        return alert("Error creando beneficiario: " + errorBenef.message);
      }
      benef_final_id = benefAgregado.id;
      setBeneficiarios([...beneficiarios, benefAgregado]);
    }

    if (!benef_final_id || nuevoPago.monto <= 0) {
      return alert("Faltan campos obligatorios");
    }

    if (pagoEditando) {
      const confOriginal = CONFIG_TIPOS[pagoEditando.tipo];
      
      const payload = {
        proyecto_id: nuevoPago.proyecto_id || null, // Nulo para pagos generales (ej. mensualidad desarrollador sin proyecto especifico)
        monto: nuevoPago.monto,
        mes: nuevoPago.mes
      };
      if (nuevoPago.fecha_pago) {
        payload.fecha_pago = combinarFechaConHoraActual(nuevoPago.fecha_pago);
      }
      payload[confOriginal.id_field] = benef_final_id;

      const { error } = await supabase.from(confOriginal.tabla_pago).update(payload).eq("id", pagoEditando.id);
      
      if (error) {
        alert("Error al editar pago: " + error.message);
      } else {
        resetForm();
        cargarPagosHistorico();
      }
    } else {
      const payload = {
        proyecto_id: nuevoPago.proyecto_id || null,
        monto: nuevoPago.monto,
        mes: nuevoPago.mes
      };
      if (nuevoPago.fecha_pago) {
        payload.fecha_pago = combinarFechaConHoraActual(nuevoPago.fecha_pago);
      }
      payload[conf.id_field] = benef_final_id;

      const { error } = await supabase.from(conf.tabla_pago).insert([payload]);

      if (error) {
        alert("Error al registrar pago: " + error.message);
      } else {
        resetForm();
        cargarPagosHistorico();
      }
    }
  };

  const resetForm = () => {
    const dNow = new Date();
    const defaultMo = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}`;
    setNuevoPago({
      beneficiario_id: "",
      proyecto_id: "",
      monto: 0,
      mes: defaultMo,
      fecha_pago: getFechaInput(dNow.toISOString())
    });
    setPagoEditando(null);
    setNuevoBenefMode(false);
    setNuevoBenefNombre("");
  };

  const handleEliminarPago = async (id, tipo) => {
    if (!window.confirm("¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.")) return;
    const conf = CONFIG_TIPOS[tipo];
    const { error } = await supabase.from(conf.tabla_pago).delete().eq("id", id);
    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      cargarPagosHistorico();
    }
  };

  const handleEditarClick = (pago) => {
    setPagoEditando(pago);
    setTipoSeleccionado(pago.tipo);
    setNuevoPago({
      beneficiario_id: pago.beneficiario_id,
      proyecto_id: pago.proyectos?.id || pago.proyecto_id || "",
      monto: pago.monto,
      mes: pago.mes,
      fecha_pago: getFechaInput(pago.fecha_pago)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pagosFiltrados = pagosHistorico.filter(pago => {
    const matchProyecto = filtroProyecto === "" || pago.proyectos?.nombre?.toLowerCase().includes(filtroProyecto.toLowerCase());
    const matchBeneficiario = filtroBeneficiario === "" || pago.beneficiario_nombre?.toLowerCase().includes(filtroBeneficiario.toLowerCase());
    const matchMes = filtroMes === "" || pago.mes === filtroMes;
    const matchTipo = filtroTipo === "todos" || pago.tipo === filtroTipo;
    return matchProyecto && matchBeneficiario && matchMes && matchTipo;
  });

  const handleCalcularReparto = async () => {
    if (!profile?.empresa_id) return;
    setLoading(true);
    try {
      const mesLiquidar = mesReparto; // ej: '2026-07'

      // 1. Ingresos del mes SELECCIONADO
      const { data: proyData } = await supabase.from("proyectos").select("id").eq("empresa_id", profile.empresa_id);
      const proyIds = proyData?.map(p => p.id) || [];
      
      let totalIngresos = 0;
      if (proyIds.length > 0) {
        const { data: pagosProy } = await supabase.from("pagos_proyectos").select("monto, fecha_pago").in("proyecto_id", proyIds);
        if (pagosProy) {
          totalIngresos = pagosProy
            .filter(p => {
              if (!p.fecha_pago) return false;
              const mesPago = obtenerMesLocal(p.fecha_pago);
              return mesPago === mesLiquidar;
            })
            .reduce((acc, p) => acc + Number(p.monto), 0);
        }
      }

      // 2. Egresos del mes SELECCIONADO (proveedores y apps)
      let totalEgresos = 0;
      const gastosTipos = ["proveedor", "app"];
      for (const tipo of gastosTipos) {
        const conf = CONFIG_TIPOS[tipo];
        const { data: entData } = await supabase.from(conf.tabla_entidad).select("id").eq("empresa_id", profile.empresa_id);
        const entIds = entData?.map(e => e.id) || [];
        if (entIds.length > 0) {
          const { data: pagosGastos } = await supabase.from(conf.tabla_pago).select("monto").in(conf.id_field, entIds).eq("mes", mesLiquidar);
          if (pagosGastos) {
            totalEgresos += pagosGastos.reduce((acc, p) => acc + Number(p.monto), 0);
          }
        }
      }

      // 3. Desarrolladores
      const { data: devsData } = await supabase.from("desarrolladores").select("id, nombre").eq("empresa_id", profile.empresa_id);
      const devs = devsData || [];
      
      const utilidadesNetas = totalIngresos - totalEgresos;
      const fondoEmpresa = aplicarRetencion ? (utilidadesNetas * 0.10) : 0;
      const utilidadesARepartir = utilidadesNetas - fondoEmpresa;
      
      const montoPorDev = devs.length > 0 ? (utilidadesARepartir / devs.length) : 0;
      
      setDatosReparto({
        ingresos: totalIngresos,
        egresos: totalEgresos,
        utilidades: utilidadesNetas,
        fondoEmpresa: fondoEmpresa,
        utilidadesARepartir: utilidadesARepartir,
        devs: devs,
        montoPorDev: montoPorDev,
        mesCalculado: mesLiquidar,
        aplicoRetencion: aplicarRetencion
      });
      
    } catch (e) {
      alert("Error calculando: " + e.message);
    }
    setLoading(false);
  };

  const handleConfirmarReparto = async () => {
    if (!datosReparto || datosReparto.devs.length === 0 || datosReparto.montoPorDev <= 0) return;
    setLoading(true);
    try {
      const payload = datosReparto.devs.map(dev => ({
        desarrollador_id: dev.id,
        monto: parseFloat(datosReparto.montoPorDev.toFixed(2)),
        mes: mesReparto,
        proyecto_id: null
      }));

      const { error } = await supabase.from("pagos_personal").insert(payload);
      if (error) throw error;
      
      alert("Se han registrado los pagos a los desarrolladores con éxito.");
      setDatosReparto(null);
      cargarPagosHistorico();
    } catch (e) {
      alert("Error registrando: " + e.message);
    }
    setLoading(false);
  };

  const isAugust2026Onwards = new Date() >= new Date('2026-08-01');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 text-slate-900 dark:text-slate-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-start justify-between mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestión de Pagos Generales</h2>
              <p className="text-slate-500 dark:text-slate-400">Registro de pagos a Desarrolladores, Proveedores y Apps</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-4 py-2 text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg shadow-sm hover:bg-indigo-100 transition-all active:scale-95"
                onClick={() => navigate("/gestion-interna-proyectos")}
              >
                🏗️ Proyectos
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
          {/* Columna Izquierda: Reparto y Formulario Nuevo Pago */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Reparto de Utilidades */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/30 transition-colors">
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-2">Reparto Mensual (Desarrolladores)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Seleccioná el mes a liquidar. El sistema sumará todos los ingresos y restará los gastos de ese <strong>mes exacto</strong> para calcular la ganancia neta y repartirla.</p>
              
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex gap-2">
                  <input type="month" className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500/20" value={mesReparto} onChange={e => {setMesReparto(e.target.value); setDatosReparto(null);}} />
                  <button onClick={handleCalcularReparto} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all text-sm">
                    Calcular
                  </button>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer mt-1 font-medium">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={aplicarRetencion} onChange={(e) => {setAplicarRetencion(e.target.checked); setDatosReparto(null);}} />
                  Aplicar retención del 10% para la empresa
                </label>
              </div>

              {datosReparto && (
                <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 shadow-sm text-sm">
                  <div className="text-xs text-center text-slate-500 dark:text-slate-400 font-bold mb-3 border-b pb-2">
                    Basado en los registros de: {datosReparto.mesCalculado}
                  </div>
                  <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-300"><span>Ingresos del mes:</span> <span className="font-semibold text-emerald-600">${datosReparto.ingresos.toLocaleString()}</span></div>
                  <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-300"><span>Gastos del mes (Prov/Apps):</span> <span className="font-semibold text-red-500">${datosReparto.egresos.toLocaleString()}</span></div>
                  <div className="flex justify-between mb-2 text-slate-800 dark:text-slate-100 font-bold"><span>Balance Neto:</span> <span>${datosReparto.utilidades.toLocaleString()}</span></div>
                  
                  {datosReparto.aplicoRetencion ? (
                    <>
                      <div className="flex justify-between mb-1 text-amber-600 dark:text-amber-500 text-xs font-semibold border-t pt-2 mt-2">
                        <span>Fondo Empresa (10% retenido):</span> <span>-${datosReparto.fondoEmpresa.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-3 text-indigo-700 dark:text-indigo-400 font-bold border-b pb-2">
                        <span>Utilidad real a repartir (90%):</span> <span>${datosReparto.utilidadesARepartir.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between mb-3 text-indigo-700 dark:text-indigo-400 font-bold border-t pt-2 border-b pb-2 mt-2">
                      <span>Utilidad a repartir (100%):</span> <span>${datosReparto.utilidadesARepartir.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-300"><span>Total Desarrolladores:</span> <span className="font-bold">{datosReparto.devs.length}</span></div>
                  <div className="flex justify-between text-indigo-700 font-bold text-base mt-2">
                    <span>Monto por persona:</span> 
                    <span>${datosReparto.montoPorDev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                  </div>
                  
                  <button 
                    onClick={handleConfirmarReparto} 
                    disabled={loading || datosReparto.montoPorDev <= 0}
                    className="w-full mt-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    Confirmar y Registrar Pagos
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {pagoEditando ? "Editar Pago" : "Registrar Pago"}
                </h3>
                {pagoEditando && (
                  <button onClick={resetForm} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200">
                    Cancelar Edición
                  </button>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tipo de Beneficiario</label>
                <div className="flex gap-2">
                  {Object.entries(CONFIG_TIPOS).map(([key, conf]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => !pagoEditando && setTipoSeleccionado(key)}
                      disabled={pagoEditando != null && pagoEditando.tipo !== key}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                        tipoSeleccionado === key 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950'
                      } ${pagoEditando && pagoEditando.tipo !== key ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {conf.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleRegistrarPago} className="space-y-4">
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Beneficiario *</label>
                    <button type="button" onClick={() => setNuevoBenefMode(!nuevoBenefMode)} className="text-xs text-indigo-600 font-bold">
                      {nuevoBenefMode ? "Usar existente" : "+ Nuevo"}
                    </button>
                  </div>

                  {nuevoBenefMode ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                      <input className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-md" placeholder="Nombre completo" value={nuevoBenefNombre} onChange={e => setNuevoBenefNombre(e.target.value)} />
                    </div>
                  ) : (
                    <select
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      value={nuevoPago.beneficiario_id}
                      onChange={(e) => setNuevoPago({ ...nuevoPago, beneficiario_id: e.target.value })}
                      required={!nuevoBenefMode}
                    >
                      <option value="">Seleccionar {CONFIG_TIPOS[tipoSeleccionado].label.toLowerCase()}...</option>
                      {beneficiarios.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Proyecto (Opcional)</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    value={nuevoPago.proyecto_id}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, proyecto_id: e.target.value })}
                  >
                    <option value="">-- Sin Proyecto Específico --</option>
                    {proyectos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Monto ($) *</label>
                    <input type="number" required min="1" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none" value={nuevoPago.monto} onChange={e => setNuevoPago({...nuevoPago, monto: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Fecha de Pago</label>
                    <input type="date" required className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-sm" value={nuevoPago.fecha_pago} onChange={e => setNuevoPago({...nuevoPago, fecha_pago: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Mes asociado al pago *</label>
                    <input type="month" required className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-sm" value={nuevoPago.mes} onChange={e => setNuevoPago({...nuevoPago, mes: e.target.value})} />
                    <p className="text-[10px] text-slate-500 mt-1">El balance se calcula en base a este mes, independientemente de la fecha exacta de pago.</p>
                  </div>
                </div>
                
                {tipoSeleccionado === 'desarrollador' && isAugust2026Onwards && (
                  <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg text-xs text-indigo-700">
                    ℹ️ Recuerda: Los pagos a desarrolladores ahora se realizan de forma mensual.
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95 mt-4">
                  {pagoEditando ? "Guardar Cambios" : "Registrar Pago"}
                </button>
              </form>
            </div>
          </div>

          {/* Listado de Pagos */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Historial de Pagos Generales</h3>
                
                <div className="flex flex-wrap gap-2">
                  <select 
                    className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <option value="todos">Todos los Tipos</option>
                    {Object.entries(CONFIG_TIPOS).map(([key, conf]) => (
                      <option key={key} value={key}>{conf.label}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Filtrar beneficiario..." 
                    className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    value={filtroBeneficiario}
                    onChange={(e) => setFiltroBeneficiario(e.target.value)}
                  />
                  <input 
                    type="month" 
                    className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                  />
                  {(filtroProyecto || filtroBeneficiario || filtroMes || filtroTipo !== "todos") && (
                    <button 
                      onClick={() => {setFiltroProyecto(""); setFiltroBeneficiario(""); setFiltroMes(""); setFiltroTipo("todos");}}
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
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Fecha</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Tipo</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Beneficiario</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Proyecto</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Mes</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase text-right">Monto</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pagosFiltrados.map((pago) => (
                      <tr key={`${pago.tipo}-${pago.id}`} className="hover:bg-slate-50 dark:bg-slate-950">
                        <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{mostrarFecha(pago.fecha_pago)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            {CONFIG_TIPOS[pago.tipo]?.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-100">{pago.beneficiario_nombre}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{pago.proyectos?.nombre || <span className="text-slate-400 italic">General</span>}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{pago.mes}</td>
                        <td className="py-3 px-4 text-sm font-bold text-emerald-600 text-right">${pago.monto}</td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button onClick={() => handleEditarClick(pago)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Editar</button>
                          <button onClick={() => handleEliminarPago(pago.id, pago.tipo)} className="text-red-500 hover:text-red-700 text-sm font-medium">Borrar</button>
                        </td>
                      </tr>
                    ))}
                    {pagosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 italic">
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
