import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Header from "./HeaderAdmin";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminBalance() {
  const [datosMensuales, setDatosMensuales] = useState([]);
  const [totalesGrupales, setTotalesGrupales] = useState({ ingresos: 0, egresos: 0 });
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroMes, setFiltroMes] = useState("Todos");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [datosCrudos, setDatosCrudos] = useState({ ingresos: [], egresos: [], proyectosMap: {} });
  
  const navigate = useNavigate();
  const { profile } = useProfile();

  useEffect(() => {
    if (profile?.empresa_id) {
      cargarBalance();
    }
  }, [profile]);

  const cargarBalance = async () => {
    setLoading(true);
    
    // 1. Buscar los proyectos de la empresa actual
    const { data: proyectosData } = await supabase
      .from("proyectos")
      .select("id, tipo_proyecto, fecha_inicio")
      .eq("empresa_id", profile.empresa_id);
    
    const proyectosMap = {};
    const proyectosIds = proyectosData?.map(p => {
      proyectosMap[p.id] = p.tipo_proyecto || "Otro";
      return p.id;
    }) || [];

    let ingresos = [];
    let egresos = [];
    
    if (proyectosIds.length > 0) {
      // Ingresos (pagos de clientes)
      const { data: pagosProyectos } = await supabase
        .from("pagos_proyectos")
        .select("monto, fecha_pago, proyecto_id, tipo_pago")
        .in("proyecto_id", proyectosIds);
      if (pagosProyectos) ingresos = pagosProyectos;
    }

    // 2. Obtener los beneficiarios de la empresa para poder traer TODOS los pagos generales 
    // (incluso los que no tienen proyecto_id porque son mensuales)
    const entidadesConfigs = [
      { tabla: "desarrolladores", pagoTabla: "pagos_personal", idField: "desarrollador_id" },
      { tabla: "proveedores", pagoTabla: "pagos_proveedores", idField: "proveedor_id" },
      { tabla: "apps_terceros", pagoTabla: "pagos_apps", idField: "app_id" }
    ];

    for (const conf of entidadesConfigs) {
      const { data: entidades } = await supabase
        .from(conf.tabla)
        .select("id")
        .eq("empresa_id", profile.empresa_id);

      if (entidades && entidades.length > 0) {
        const ids = entidades.map(e => e.id);
        const { data: pagosData, error } = await supabase
          .from(conf.pagoTabla)
          .select("monto, mes, proyecto_id")
          .in(conf.idField, ids);
          
        if (pagosData) {
          egresos = [...egresos, ...pagosData];
        } else if (error && error.code === '42P01') {
          console.warn(`Tabla ${conf.pagoTabla} no existe o sin acceso.`);
        }
      }
    }
    
    setDatosCrudos({ ingresos, egresos, proyectosMap });
    setLoading(false);
  };

  useEffect(() => {
    if (datosCrudos.ingresos.length > 0 || datosCrudos.egresos.length > 0) {
      procesarDatos();
    }
  }, [datosCrudos, filtroTipo, filtroMes]);

  const obtenerMesLocal = (fechaString) => {
    if (!fechaString) return "Sin Fecha";
    try {
      // Si la fecha viene como YYYY-MM-DD puro de una columna "date" de postgres
      if (fechaString.length === 10) {
        const [y, m, d] = fechaString.split('-');
        return `${y}-${m}`;
      }

      // Si la fecha vieja se guardó a las 00:00:00Z, parsearla normal resta un día (y posiblemente un mes).
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

  const procesarDatos = () => {
    const { ingresos, egresos, proyectosMap } = datosCrudos;
    
    // Filtramos. Si el pago general (egreso) no tiene proyecto, se asume que pertenece a la empresa globalmente.
    // Si hay un filtro específico por tipo de proyecto, podríamos decidir excluir los que no tienen proyecto, 
    // o incluirlos si filtroTipo es "Todos".
    const ingresosFiltrados = ingresos.filter(i => filtroTipo === "Todos" || proyectosMap[i.proyecto_id] === filtroTipo);
    const egresosFiltrados = egresos.filter(e => {
      if (filtroTipo === "Todos") return true;
      if (!e.proyecto_id) return false; // Si se filtra por tipo, y no tiene proyecto, lo excluimos de la vista
      return proyectosMap[e.proyecto_id] === filtroTipo;
    });

    // Agrupar por mes (YYYY-MM)
    const agrupado = {};

    ingresosFiltrados.forEach(ingreso => {
      const mes = obtenerMesLocal(ingreso.fecha_pago);
      if (!agrupado[mes]) agrupado[mes] = { name: mes, ingresos: 0, ingresosProy: 0, ingresosMensual: 0, ingresosHard: 0, egresos: 0 };
      
      const val = Number(ingreso.monto);
      agrupado[mes].ingresos += val;
      
      if (ingreso.tipo_pago === 'mensualidad') agrupado[mes].ingresosMensual += val;
      else if (ingreso.tipo_pago === 'hardware') agrupado[mes].ingresosHard += val;
      else agrupado[mes].ingresosProy += val;
    });

    egresosFiltrados.forEach(egreso => {
      const mes = egreso.es_hardware ? egreso.mes : (egreso.mes || "Sin Fecha");
      if (!agrupado[mes]) agrupado[mes] = { name: mes, ingresos: 0, ingresosProy: 0, ingresosMensual: 0, ingresosHard: 0, egresos: 0 };
      agrupado[mes].egresos += Number(egreso.monto);
    });

    const resultadoArray = Object.values(agrupado)
      .map(item => ({
        ...item,
        balance: item.ingresos - item.egresos
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const mesesArray = resultadoArray.map(r => r.name);
    setMesesDisponibles(mesesArray);

    const datosFiltrados = filtroMes === "Todos" ? resultadoArray : resultadoArray.filter(r => r.name === filtroMes);

    setDatosMensuales(datosFiltrados);
    
    const totalIng = datosFiltrados.reduce((acc, i) => acc + i.ingresos, 0);
    const totalEgr = datosFiltrados.reduce((acc, i) => acc + i.egresos, 0);
    setTotalesGrupales({ ingresos: totalIng, egresos: totalEgr });
  };

  const formatearDinero = (valor) => `$${valor.toLocaleString("es-AR")}`;
  
  const PIE_COLORS = ["#10b981", "#ef4444"]; // Verde y Rojo

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-start justify-between mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Balance Mensual</h2>
              <p className="text-slate-500 dark:text-slate-400">Reporte de ingresos y egresos globales</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-4 py-2 text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg shadow-sm hover:bg-indigo-100 transition-all active:scale-95"
                onClick={() => navigate("/gestion-interna-proyectos")}
              >
                🏗️ Proyectos
              </button>
              <button
                className="px-4 py-2 text-sm font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-lg shadow-sm hover:bg-amber-100 transition-all active:scale-95"
                onClick={() => navigate("/gestion-interna-personal")}
              >
                💸 Pagos
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
        
        {/* Filtros */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Tipo de Proyecto:</label>
            <select
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="Todos">Todos (Incluye gastos fijos)</option>
              <option value="Sistema">Sistema</option>
              <option value="Página Web">Página Web</option>
              <option value="Aplicación Móvil">Aplicación Móvil</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Mes:</label>
            <select
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
            >
              <option value="Todos">Todos los meses</option>
              {mesesDisponibles.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          
          <span className="text-xs text-slate-500 dark:text-slate-400 italic md:ml-auto">
            * Gastos sin proyecto se ocultan al filtrar por tipo.
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Calculando balance...</div>
        ) : (
          <>
            {/* Tarjetas de Resumen Global */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ingresos Totales</p>
                <p className="text-3xl font-bold text-emerald-600">{formatearDinero(totalesGrupales.ingresos)}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Egresos Totales</p>
                <p className="text-3xl font-bold text-red-500">{formatearDinero(totalesGrupales.egresos)}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Balance Neto</p>
                <p className={`text-3xl font-bold ${totalesGrupales.ingresos - totalesGrupales.egresos >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                  {formatearDinero(totalesGrupales.ingresos - totalesGrupales.egresos)}
                </p>
              </div>
            </div>

            {/* Gráficos */}
            {datosMensuales.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Gráfico de Columnas (Barras) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Ingresos vs Egresos (Por Mes)</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosMensuales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(241, 245, 249, 0.1)' }} 
                          formatter={(value) => formatearDinero(value)}
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.75rem', padding: '10px' }}
                          itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                          labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '5px' }}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico Lineal */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Evolución del Balance Neto</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={datosMensuales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                          formatter={(value) => formatearDinero(value)}
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.75rem', padding: '10px' }}
                          itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                          labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '5px' }}
                        />
                        <Legend iconType="circle" />
                        <Line type="monotone" dataKey="balance" name="Balance Neto" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Sectores (Torta) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2 flex flex-col items-center">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 w-full text-left">Proporción Histórica Global</h3>
                  <div className="h-64 w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%" maxWidth={400}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Ingresos (Total)", value: totalesGrupales.ingresos },
                            { name: "Egresos (Total)", value: totalesGrupales.egresos }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {PIE_COLORS.map((color, index) => (
                           <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatearDinero(value)}
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.75rem', padding: '10px' }}
                          itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
                Aún no hay datos de pagos ni ingresos para generar el reporte de balance.
              </div>
            )}

            {/* Tabla Detallada */}
            {datosMensuales.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Detalle Mensual</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase text-right">Mes</th>
                        <th className="py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase text-right">Ingresos (Desglose)</th>
                        <th className="py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase text-right">Egresos</th>
                        <th className="py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase text-right">Balance Neto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {datosMensuales.map((mes, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:bg-slate-950">
                          <td className="py-3 px-6 text-sm font-bold text-slate-800 dark:text-slate-100 text-right">{mes.name}</td>
                          <td className="py-3 px-6 text-sm font-semibold text-emerald-600 text-right">
                            <div>{formatearDinero(mes.ingresos)}</div>
                            <div className="text-[10px] text-emerald-500 font-normal">
                              Proy: {formatearDinero(mes.ingresosProy)} | Mens: {formatearDinero(mes.ingresosMensual)} | Hard: {formatearDinero(mes.ingresosHard)}
                            </div>
                          </td>
                          <td className="py-3 px-6 text-sm font-semibold text-red-500 text-right">{formatearDinero(mes.egresos)}</td>
                          <td className={`py-3 px-6 text-sm font-bold text-right ${mes.balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                            {formatearDinero(mes.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
