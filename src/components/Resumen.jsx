import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Header from "../components/HeaderAdmin";
import { useProfile } from "../hooks/useProfile";
import logoTrees from "../assets/Trees_logo.webp";

export default function Resumen() {
  const [documentos, setDocumentos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();

  useEffect(() => {
    if (profile?.empresa_id) {
      cargarDocumentos();
    }
  }, [profile]);

  const cargarDocumentos = async () => {
    if (!profile?.empresa_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("documentos")
      .select(
        `
        *,
        clientes(nombre, dni_cuit),
        documento_items(*),
        creador:perfiles_usuario!creado_por(nombre_usuario, apellido_usuario)
      `,
      )
      .eq("empresa_id", profile.empresa_id)
      .order("creado_en", { ascending: false });

    if (!error) {
      setDocumentos(data || []);
    }
    setLoading(false);
  };

  const calcularTotal = (items) =>
    items?.reduce(
      (acc, item) =>
        acc +
        (Number(item.cantidad) || 0) * (Number(item.precio_unitario) || 0),
      0,
    ) || 0;

  const eliminarDocumento = async (id) => {
    if (!window.confirm("¿Estás seguro que querés eliminar este documento?"))
      return;
    const { error } = await supabase.from("documentos").delete().eq("id", id);
    if (!error) cargarDocumentos();
  };

  const editarDocumento = (doc) => {
    const payload = {
      extra: {
        id: doc.id,
        numero: doc.numero,
        cliente_id: doc.cliente_id,
        fecha: doc.fecha,
        perfil_pago_id: doc.perfil_pago_id,
        observaciones: doc.observaciones,
        estado: doc.estado,
      },
      filas: doc.documento_items || [],
    };

    if (doc.tipo === "presupuesto") {
      localStorage.setItem("presupuesto_activo", JSON.stringify(payload));
      navigate("/presupuesto");
    } else {
      localStorage.setItem("recibo_activo", JSON.stringify(payload));
      navigate("/recibo");
    }
  };

  const convertirARecibo = async (presupuesto) => {
    if (!window.confirm("¿Convertir este presupuesto en un recibo oficial?"))
      return;

    setLoading(true);
    try {
      if (!profile?.empresa_id)
        throw new Error("No tenés una empresa asociada.");

      const { data: ultimosRecibos } = await supabase
        .from("documentos")
        .select("numero")
        .eq("tipo", "recibo")
        .eq("empresa_id", profile.empresa_id)
        .order("numero", { ascending: false })
        .limit(1);

      const proximoNumero = (ultimosRecibos?.[0]?.numero || 0) + 1;

      const { data: nuevoRecibo, error: errDoc } = await supabase
        .from("documentos")
        .insert({
          tipo: "recibo",
          numero: proximoNumero,
          cliente_id: presupuesto.cliente_id,
          perfil_pago_id: presupuesto.perfil_pago_id,
          observaciones: presupuesto.observaciones || "",
          estado: "pendiente",
          empresa_id: profile.empresa_id,
          creado_por: profile.user_id,
        })
        .select()
        .single();

      if (errDoc) throw errDoc;

      if (presupuesto.documento_items?.length > 0) {
        const items = presupuesto.documento_items.map((item) => ({
          documento_id: nuevoRecibo.id,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        }));

        const { error: errItems } = await supabase
          .from("documento_items")
          .insert(items);
        if (errItems) throw errItems;
      }

      await supabase
        .from("documentos")
        .update({ estado: "pagado" })
        .eq("id", presupuesto.id);

      alert(`¡Recibo #${proximoNumero} generado con éxito!`);
      cargarDocumentos();
    } catch (err) {
      console.error(err);
      alert("Error al convertir el presupuesto");
    } finally {
      setLoading(false);
    }
  };

  const generarPDF = async (doc) => {
    const pdf = new jsPDF();
    const isRecibo = doc.tipo === "recibo";

    const fechaLimpia = doc.fecha.includes('T') ? doc.fecha.split('T')[0] : doc.fecha;
    const [year, month, day] = fechaLimpia.split("-");
    const fechaFormateada = `${day}/${month}/${year}`;

    let logoBase64 = null;
    try {
      logoBase64 = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = logoTrees;
      });
    } catch (e) {
      console.warn("No se pudo cargar el logo:", e);
    }

    // Encabezado
    if (isRecibo) {
      pdf.setFillColor(37, 99, 235); // blue-600
    } else {
      pdf.setFillColor(30, 41, 59); // slate-800
    }
    pdf.rect(0, 0, 210, 40, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text(doc.tipo.toUpperCase(), 15, 20);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`N°: ${doc.numero.toString().padStart(6, "0")}`, 15, 28);
    pdf.text(`Fecha: ${fechaFormateada}`, 15, 34);

    if (logoBase64) {
      pdf.addImage(logoBase64, "PNG", 150, 5, 45, 30, undefined, "FAST");
    }

    // Datos del cliente
    pdf.setTextColor(30, 41, 59);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(isRecibo ? "RECIBÍ DE:" : "CLIENTE", 15, 50);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Nombre: ${doc.clientes?.nombre || "No especificado"}`, 15, 57);
    if (doc.clientes?.dni_cuit && !isRecibo) {
      pdf.text(`DNI/CUIT: ${doc.clientes.dni_cuit}`, 15, 63);
    }

    // Tabla de ítems
    const tableBody = (doc.documento_items || []).map((item) => [
      item.cantidad?.toString() || "0",
      item.descripcion || "-",
      `$${Number(item.precio_unitario)?.toFixed(2) || "0.00"}`,
      `$${((Number(item.cantidad) || 0) * (Number(item.precio_unitario) || 0)).toFixed(2)}`,
    ]);

    const total = calcularTotal(doc.documento_items);

    autoTable(pdf, {
      head: [["Cant.", "Descripción", isRecibo ? "Importe" : "P. Unitario", "Subtotal"]],
      body: tableBody,
      startY: isRecibo ? 70 : 80,
      headStyles: { 
        fillColor: isRecibo ? [59, 130, 246] : [44, 62, 80], 
        textColor: 255, 
        fontStyle: "bold" 
      },
      bodyStyles: { textColor: 50 },
      alternateRowStyles: { fillColor: isRecibo ? [239, 246, 255] : [245, 247, 250] },
      foot: [
        [
          {
            content: isRecibo ? "TOTAL RECIBIDO" : "TOTAL",
            colSpan: 3,
            styles: { halign: "right", fontStyle: "bold", textColor: 255 },
          },
          {
            content: `$${total.toFixed(2)}`,
            styles: { fontStyle: "bold", textColor: 255 },
          },
        ],
      ],
      footStyles: { fillColor: isRecibo ? [59, 130, 246] : [44, 62, 80] },
    });

    const finalY = pdf.lastAutoTable.finalY + 15;

    // Observaciones
    if (doc.observaciones) {
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 41, 59);
      pdf.text("OBSERVACIONES", 15, finalY);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const textLines = pdf.splitTextToSize(doc.observaciones, 180);
      pdf.text(textLines, 15, finalY + 6);
    }

    // Pie de página
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text("Gracias por confiar en nosotros.", 105, 285, { align: "center" });

    return pdf;
  };

  const descargarPDF = async (doc) => {
    const pdf = await generarPDF(doc);
    pdf.save(`${doc.tipo.toUpperCase()}_${doc.numero.toString().padStart(6, "0")}.pdf`);
  };

  const compartirWhatsApp = async (doc) => {
    setLoading(true);
    try {
      const pdf = await generarPDF(doc);
      const blob = pdf.output("blob");
      
      const fileName = `${doc.tipo}_${doc.numero}_${Date.now()}.pdf`;
      const { data, error } = await supabase.storage
        .from("documentos")
        .upload(fileName, blob, {
          contentType: "application/pdf",
          upsert: true
        });
        
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from("documentos")
        .getPublicUrl(fileName);
        
      const publicUrl = publicUrlData.publicUrl;
      
      const total = calcularTotal(doc.documento_items).toFixed(2);
      const mensaje = `Hola ${doc.clientes?.nombre || ""}! Te envío el ${doc.tipo} #${doc.numero} por un total de $${total}.\n\nPuedes verlo y descargarlo aquí: ${publicUrl}`;
      const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Error al generar o subir el PDF para WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    const dataExcel = filtrados.map((doc) => ({
      Numero: doc.numero,
      Tipo: doc.tipo.toUpperCase(),
      Cliente: doc.clientes?.nombre || "S/N",
      Fecha: doc.fecha,
      Total: calcularTotal(doc.documento_items),
      Estado: doc.estado.toUpperCase(),
      Creador: doc.creador
        ? `${doc.creador.nombre_usuario} ${doc.creador.apellido_usuario}`
        : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resumen");
    XLSX.writeFile(wb, "Resumen_Trees.xlsx");
  };

  const filtrados = documentos.filter((doc) => {
    const matchBusqueda =
      doc.clientes?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.numero.toString().includes(busqueda);
    const matchTipo = filtroTipo === "todos" || doc.tipo === filtroTipo;
    return matchBusqueda && matchTipo;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 text-slate-900 dark:text-slate-100">
      <Header />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                Resumen General
              </h2>
              <p className="text-slate-500 dark:text-slate-400">Historial de documentos emitidos</p>
              {profileError && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
                  <p className="font-bold text-sm">Estado del Perfil:</p>
                  <p className="text-xs">{profileError}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                className="px-4 py-2 text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded-lg shadow-sm hover:bg-blue-100 transition-all active:scale-95"
                onClick={() => navigate("/presupuesto")}
              >
                + Presupuesto
              </button>
              <button
                className="px-4 py-2 text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg shadow-sm hover:bg-emerald-100 transition-all active:scale-95"
                onClick={() => navigate("/recibo")}
              >
                + Recibo
              </button>
              <button
                className="px-4 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:bg-slate-100 dark:bg-slate-800 transition-all active:scale-95"
                onClick={exportarExcel}
              >
                📊 Excel
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

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input
              className="w-full pl-4 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-transparent focus:bg-white dark:bg-slate-900 focus:border-blue-500 rounded-xl outline-none transition-all"
              placeholder="Buscar por cliente o número..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none border border-transparent focus:border-blue-500"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="presupuesto">Presupuestos</option>
            <option value="recibo">Recibos</option>
          </select>
          <button
            className="px-6 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 transition-colors"
            onClick={() => {
              setBusqueda("");
              setFiltroTipo("todos");
              cargarDocumentos();
            }}
          >
            Limpiar
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-medium">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Doc
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    Monto
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtrados.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 dark:bg-slate-950 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                          #{doc.numero}
                        </span>
                        <span
                          className={`w-fit px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${doc.tipo === "presupuesto" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}
                        >
                          {doc.tipo}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-700 dark:text-slate-200 font-bold">
                        {doc.clientes?.nombre || "Consumidor Final"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {doc.clientes?.dni_cuit || ""}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(doc.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-4 px-6">
                      {doc.creador ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {doc.creador.nombre_usuario?.[0]}
                            {doc.creador.apellido_usuario?.[0]}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {doc.creador.nombre_usuario}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">Sistema</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900 dark:text-slate-100 text-right">
                      $
                      {calcularTotal(doc.documento_items).toLocaleString(
                        "es-AR",
                        { minimumFractionDigits: 2 },
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => descargarPDF(doc)}
                          className="p-2 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-all"
                          title="Descargar PDF"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                        </button>
                        <button
                          onClick={() => compartirWhatsApp(doc)}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                          title="Compartir por WhatsApp"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                          </svg>
                        </button>
                        
                        {doc.tipo === "presupuesto" && (
                          <button
                            onClick={() => convertirARecibo(doc)}
                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all flex items-center justify-center gap-1"
                            title="Generar Recibo desde Presupuesto"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          </button>
                        )}
                        
                        <button
                          onClick={() => editarDocumento(doc)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => eliminarDocumento(doc.id)}
                          className="p-2 bg-red-50 text-red-400 hover:bg-red-100 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400 italic"
                    >
                      No se encontraron registros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
