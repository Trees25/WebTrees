import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        setLoading(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from("perfiles_usuario")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!data) {
        setError("No tenés una empresa asociada.");
      } else {
        setError(null);
      }

      setProfile(data);
    } catch (err) {
      console.error("Error en useProfile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refreshProfile: fetchProfile };
}
