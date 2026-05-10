import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/HeaderAdmin";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export default function Estadisticas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({
    totalRecibos: 0,
    totalPresupuestos: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: docs, error } = await supabase
      .from("documentos")
      .select("*, documento_items(*)");

    if (!error && docs) {
      processData(docs);
    }
    setLoading(false);
  };

  const processData = (docs) => {
    const monthlyData = {};
    let sumRecibos = 0;
    let sumPres = 0;

    docs.forEach((doc) => {
      const date = new Date(doc.fecha);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const label = `${month} ${year}`;

      if (!monthlyData[label]) {
        monthlyData[label] = { name: label, recibos: 0, presupuestos: 0 };
      }

      const total =
        doc.documento_items?.reduce(
          (acc, item) =>
            acc + Number(item.cantidad) * Number(item.precio_unitario),
          0,
        ) || 0;

      if (doc.tipo === "recibo") {
        monthlyData[label].recibos += total;
        sumRecibos += total;
      } else {
        monthlyData[label].presupuestos += total;
        sumPres += total;
      }
    });

    setData(Object.values(monthlyData));
    setTotals({ totalRecibos: sumRecibos, totalPresupuestos: sumPres });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Estadísticas y Facturación
            </h2>
            <p className="text-slate-500">
              Visualiza el rendimiento de tu negocio
            </p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 bg-white border rounded-lg text-sm"
          >
            ← Volver
          </button>
        </div>

        {/* Resumen Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2 font-mono">
              Facturación Total (Recibos)
            </p>
            <p className="text-4xl font-black text-slate-800">
              ${totals.totalRecibos.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-2 font-mono">
              Total en Presupuestos
            </p>
            <p className="text-4xl font-black text-slate-800">
              ${totals.totalPresupuestos.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-8">
            Comparativa Mensual
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="recibos"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Recibos"
                />
                <Bar
                  dataKey="presupuestos"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Presupuestos"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Líneas */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-8">
            Tendencia de Ingresos
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="recibos"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{
                    r: 6,
                    fill: "#10b981",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 8 }}
                  name="Recibos"
                />
                <Line
                  type="monotone"
                  dataKey="presupuestos"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  strokeDasharray="5 5"
                  dot={{
                    r: 6,
                    fill: "#3b82f6",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  name="Presupuestos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
