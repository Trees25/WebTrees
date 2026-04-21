// src/components/PrivateRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PrivateRoute({ children }) {
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setCheckingSession(false);
    };

    checkUser();

    // Listener por si el usuario cambia (logout o login en otra pestaña)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setCheckingSession(false);
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (checkingSession) return <p className="text-center mt-5">Cargando...</p>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
