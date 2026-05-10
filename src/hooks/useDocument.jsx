import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useProfile } from "./useProfile";

export function useDocumento(tipo) {
  const { profile } = useProfile();
  const tabla = tipo === "recibo" ? "recibos" : "presupuestos";
  const tablaFilas = tipo === "recibo" ? "recibo_filas" : "presupuesto_filas";

  const [contador, setContador] = useState(1);
  const [filas, setFilas] = useState([]);
  const [listado, setListado] = useState([]);
  const [documentoExtra, setDocumentoExtra] = useState({});
  const [id, setId] = useState(null);

  // ---------------------------------------
  //  CARGA INICIAL
  // ---------------------------------------
useEffect(() => {
  if (profile?.empresa_id) {
    listarDocumentos();
    obtenerContador();
  }
}, [profile]);

  const obtenerContador = async () => {
    if (!profile?.empresa_id) return;
    const { count } = await supabase
      .from(tabla)
      .select("*", { count: "exact", head: true })
      .eq("empresa_id", profile?.empresa_id);

    setContador((count || 0) + 1);
  };

  const listarDocumentos = async () => {
    if (!profile?.empresa_id) return;
    const { data, error } = await supabase
      .from(tabla)
      .select("*")
      .eq("empresa_id", profile?.empresa_id)
      .order("creado_en", { ascending: false });

    if (!error) setListado(data);
  };

  const actualizarFila = (index, campo, valor) => {
    const nuevas = [...filas];
    nuevas[index][campo] =
      campo === "cantidad" || campo === "precio"
        ? parseFloat(valor) || 0
        : valor;
    setFilas(nuevas);
  };

  const agregarFila = () => {
    setFilas([...filas, { descripcion: "", cantidad: 1, precio: 0 }]);
  };

  const eliminarFila = (index) => {
    const nuevas = [...filas];
    nuevas.splice(index, 1);
    setFilas(nuevas);
  };

  const calcularTotal = () =>
    filas.reduce((t, f) => t + (f.cantidad || 0) * (f.precio || 0), 0);

  // ---------------------------------------
  // GUARDAR DOCUMENTO
  // ---------------------------------------
  const guardarDocumento = async (extra) => {
    if (!profile?.empresa_id) return alert("No tenés una empresa asociada.");
    try {
      // ================================
      // 🔄 ACTUALIZAR DOCUMENTO EXISTENTE
      // ================================
      if (id) {
        const { error: errorUpdate } = await supabase
          .from(tabla)
          .update({
            cliente: extra.cliente,
            fecha: extra.fecha,
          })
          .eq("id", id);

        if (errorUpdate) {
          alert("Error al actualizar documento: " + errorUpdate.message);
          return;
        }

        // Eliminar filas antiguas
        await supabase.from(tablaFilas).delete().eq(`${tipo}_id`, id);

        // Insertar filas nuevas
        const filasAInsertar = filas.map((f) => ({
          [`${tipo}_id`]: id,
          descripcion: f.descripcion,
          cantidad: f.cantidad,
          precio: f.precio,
        }));

        await supabase.from(tablaFilas).insert(filasAInsertar);

        alert("Documento actualizado con éxito");
        setId(null);
        obtenerContador();
        listarDocumentos();
        return;
      }

      // ================================
      // 🆕 CREAR DOCUMENTO NUEVO
      // ================================
      const { data: doc, error } = await supabase
        .from(tabla)
        .insert([
          {
            numero: extra.numero || contador,
            cliente: extra.cliente,
            fecha: extra.fecha,
            creado_en: new Date().toISOString(),
            empresa_id: profile?.empresa_id
          },
        ])
        .select()
        .single();

      if (error) {
        alert("Error al guardar: " + error.message);
        return;
      }

      const filasAInsertar = filas.map((f) => ({
        [`${tipo}_id`]: doc.id,
        descripcion: f.descripcion,
        cantidad: f.cantidad,
        precio: f.precio,
      }));

      await supabase.from(tablaFilas).insert(filasAInsertar);

      alert("Documento guardado con éxito");
      obtenerContador();
      listarDocumentos();
    } catch (error) {
      alert("Error inesperado: " + error.message);
    }
  };

  // ---------------------------------------
  // EDITAR DOCUMENTO
  // ---------------------------------------
  const cargarDocumento = async (doc) => {
    if (!doc) return;

    setId(doc.id);
    setDocumentoExtra(doc);

    // Traer filas desde la tabla correspondiente
    const { data: filasDB } = await supabase
      .from(tablaFilas)
      .select("*")
      .eq(`${tipo}_id`, doc.id);

    if (filasDB && filasDB.length > 0) {
      setFilas(
        filasDB.map((f) => ({
          descripcion: f.descripcion,
          cantidad: Number(f.cantidad),
          precio: Number(f.precio),
        }))
      );
    } else {
      setFilas([{ descripcion: "", cantidad: 1, precio: 0 }]);
    }
  };

  return {
    contador,
    filas,
    listado,
    actualizarFila,
    agregarFila,
    eliminarFila,
    calcularTotal,
    guardarDocumento,
    setDocumentoExtra,
    documentoExtra,
    setFilas,
    cargarDocumento,
  };
}
