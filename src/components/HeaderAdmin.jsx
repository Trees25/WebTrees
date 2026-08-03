import React from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Trees_logo.webp";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/gestion-interna";

  return (
    <header className="bg-white dark:bg-slate-950 mb-8 py-4 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex justify-end items-center">
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}
