import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  console.log("Checking All Data...");
  
  const { data: ingresos } = await supabase.from('pagos_proyectos').select('*');
  console.log("Ingresos:");
  ingresos?.forEach(i => {
      console.log(`- Ingreso: $${i.monto} (${i.tipo_pago || 'proyecto'}) el ${i.fecha_pago}`);
  });

  const { data: prov } = await supabase.from('pagos_proveedores').select('*');
  console.log("\nEgresos Proveedores:");
  prov?.forEach(e => {
      console.log(`- Proveedor: $${e.monto} en mes ${e.mes}`);
  });
  
  const { data: pers } = await supabase.from('pagos_personal').select('*');
  console.log("\nEgresos Personal:");
  pers?.forEach(e => {
      console.log(`- Personal: $${e.monto} en mes ${e.mes}`);
  });

  const { data: apps } = await supabase.from('pagos_apps').select('*');
  console.log("\nEgresos Apps:");
  apps?.forEach(e => {
      console.log(`- Apps: $${e.monto} en mes ${e.mes}`);
  });
}

check();
