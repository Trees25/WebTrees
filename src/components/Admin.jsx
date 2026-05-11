import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./HeaderAdmin";
import { supabase } from "../lib/supabase";
import { useProfile } from "../hooks/useProfile";

export default function Admin() {
  const navigate = useNavigate();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();
  const [stats, setStats] = useState({ budgets: 0, receipts: 0, clients: 0 });

  useEffect(() => {
    if (profile?.empresa_id) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    const { count: budgets } = await supabase
      .from("documentos")
      .select("*", { count: "exact", head: true })
      .eq("tipo", "presupuesto")
      .eq("empresa_id", profile.empresa_id);
    const { count: receipts } = await supabase
      .from("documentos")
      .select("*", { count: "exact", head: true })
      .eq("tipo", "recibo")
      .eq("empresa_id", profile.empresa_id);
    const { count: clients } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true })
      .eq("empresa_id", profile.empresa_id);

    setStats({
      budgets: budgets || 0,
      receipts: receipts || 0,
      clients: clients || 0,
    });
  };

  const adminCards = [
    {
      title: "Presupuesto",
      desc: "Crear nuevo presupuesto",
      icon: "📄",
      color: "blue",
      path: "/presupuesto",
    },
    {
      title: "Recibo",
      desc: "Registrar un pago/recibo",
      icon: "💰",
      color: "emerald",
      path: "/recibo",
    },
    {
      title: "Resumen",
      desc: "Ver historial y estados",
      icon: "📊",
      color: "indigo",
      path: "/resumen",
    },
    {
      title: "Clientes",
      desc: "Administrar base de clientes",
      icon: "👥",
      color: "rose",
      path: "/clientes",
    },
    {
      title: "Catálogo",
      desc: "Servicios y precios",
      icon: "📦",
      color: "amber",
      path: "/catalogo",
    },
    {
      title: "Cuentas",
      desc: "Perfiles de pago y CBU",
      icon: "💳",
      color: "cyan",
      path: "/perfiles",
    },
  ];

  if (profileLoading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-900">
      <Header />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Panel de Control
            </h2>
            <p className="text-slate-500">
              Bienvenido,{" "}
              {profile?.nombre_usuario && profile?.apellido_usuario
                ? `${profile.nombre_usuario} ${profile.apellido_usuario}`
                : profile?.nombre_usuario || profile?.email || "Usuario"}
            </p>
          </div>
          {profile?.empresa_id && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/perfil-usuario")}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
              >
                👤 Mi Perfil
              </button>
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-emerald-700 font-bold text-sm">
                  Equipo: Trees
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard label="Presupuestos" value={stats.budgets} color="blue" />
          <StatCard label="Recibos" value={stats.receipts} color="emerald" />
          <StatCard label="Clientes" value={stats.clients} color="indigo" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, idx) => (
            <div
              key={idx}
              className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
              onClick={() => navigate(card.path)}
            >
              <div className="relative">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 mb-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
            Sistemas Integrados
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Módulos y conexiones con software externo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
            onClick={() => navigate("/clientes-posventa")}
          >
            <div className="absolute top-6 right-6 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </div>
            <div className="relative">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                ⚙️
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Posventa
              </h3>
              <p className="text-sm text-slate-600">
                Suscripciones y clientes del sistema Posventa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${colors[color]}`}
      >
        {label[0]}
      </div>
    </div>
  );
}
