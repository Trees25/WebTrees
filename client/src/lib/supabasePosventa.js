import { createClient } from '@supabase/supabase-js';

// Cliente secundario para conectarse a la base de datos de Posventa
const supabasePosventaUrl = import.meta.env.VITE_SUPABASE_POSVENTA_URL;
const supabasePosventaKey = import.meta.env.VITE_SUPABASE_POSVENTA_KEY;
const posventaEmail = import.meta.env.VITE_POSVENTA_EMAIL;
const posventaPassword = import.meta.env.VITE_POSVENTA_PASSWORD;

// Creamos el cliente solo si las credenciales base existen
export const supabasePosventa = (supabasePosventaUrl && supabasePosventaKey) 
    ? createClient(supabasePosventaUrl, supabasePosventaKey, {
        auth: {
          persistSession: false, // No guardamos esta sesión en localStorage para no pisar la sesión principal del usuario
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      }) 
    : null;

// Función para asegurar que el cliente posventa esté logueado con la cuenta de servicio
let isPosventaAuthenticated = false;

export const authenticatePosventa = async () => {
    if (!supabasePosventa || !posventaEmail || !posventaPassword) return false;
    
    // Si ya validamos la sesión en esta carga de página, evitamos múltiples logins
    if (isPosventaAuthenticated) return true;

    try {
        const { data, error } = await supabasePosventa.auth.signInWithPassword({
            email: posventaEmail,
            password: posventaPassword
        });

        if (error) {
            console.error("Error al autenticar en Supabase Posventa:", error.message);
            return false;
        }

        isPosventaAuthenticated = true;
        return true;
    } catch (e) {
        console.error("Excepción al autenticar Posventa:", e);
        return false;
    }
};
