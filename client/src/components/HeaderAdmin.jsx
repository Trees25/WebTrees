import React from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";

import logoTrees from "../assets/logo_dark.png";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/admin";

  return (
    <header className="bg-white border-b border-slate-200 mb-8 py-4">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div
            className="cursor-pointer flex items-center gap-3 active:scale-95 transition-transform"
            onClick={() => navigate("/admin")}
          >
            <img
              src={logoTrees}
              alt="Logo Trees"
              className="h-10 w-auto"
            />
          </div>

          <nav className="hidden md:flex items-center gap-4">
            {!isHome && (
              <button
                onClick={() => navigate("/admin")}
                className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <span>🏠 Inicio</span>
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-100 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}
