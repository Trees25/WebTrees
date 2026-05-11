import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Header from "../components/HeaderAdmin";
import { useProfile } from "../hooks/useProfile";

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
          observaciones: `Convertido desde Presupuesto #${presupuesto.numero}. ${presupuesto.observaciones || ""}`,
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

  const descargarPDF = (doc) => {
    const pdf = new jsPDF();

    // Función para formatear fecha sin errores de zona horaria
    const [year, month, day] = doc.fecha.split("-");
    const fechaFormateada = `${day}/${month}/${year}`;

    const title = doc.tipo.toUpperCase();

    // Logo
    const img = new Image();
    img.src = "/assets/logo.png";

    pdf.setFontSize(16);
    pdf.text(title, 14, 20);
    pdf.setFontSize(12);
    pdf.text(`N°: ${doc.numero}`, 14, 30);
    pdf.text(`Cliente: ${doc.clientes?.nombre || "N/A"}`, 14, 36);
    pdf.text(`Fecha: ${fechaFormateada}`, 14, 42);

    try {
      pdf.addImage(img, "PNG", 150, 10, 40, 20);
    } catch (e) {
      console.error("Error al cargar el logo en el PDF", e);
    }

    const body = (doc.documento_items || []).map((item) => [
      item.descripcion || "-",
      item.cantidad ?? 0,
      `$${Number(item.precio_unitario)?.toFixed(2) ?? "0.00"}`,
      `$${((Number(item.cantidad) || 0) * (Number(item.precio_unitario) || 0)).toFixed(2)}`,
    ]);

    autoTable(pdf, {
      head: [["Descripción", "Cantidad", "Precio", "Subtotal"]],
      body,
      startY: 50,
      foot: [
        [
          {
            content: "TOTAL",
            colSpan: 3,
            styles: { halign: "right", fontStyle: "bold" },
          },
          {
            content: `$${calcularTotal(doc.documento_items).toFixed(2)}`,
            styles: { fontStyle: "bold" },
          },
        ],
      ],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
    });

    pdf.save(`${doc.tipo}-${doc.numero}.pdf`);
  };

  const compartirWhatsApp = (doc) => {
    const total = calcularTotal(doc.documento_items).toFixed(2);
    const fechaStr = new Date(doc.fecha).toLocaleDateString();
    const mensaje = `Hola ${doc.clientes?.nombre || ""}! Te envío el ${doc.tipo} #${doc.numero} por un total de $${total}. (Generado el ${fechaStr})`;
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
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
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-900">
      <Header />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Resumen General
            </h2>
            <p className="text-slate-500">Historial de documentos emitidos</p>
            {profileError && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
                <p className="font-bold text-sm">Estado del Perfil:</p>
                <p className="text-xs">{profileError}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg shadow-sm hover:bg-emerald-100 transition-all active:scale-95"
              onClick={exportarExcel}
            >
              📊 Exportar Excel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
              onClick={() => navigate("/admin")}
            >
              ← Volver al Inicio
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input
              className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all"
              placeholder="Buscar por cliente o número..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-blue-500"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="presupuesto">Presupuestos</option>
            <option value="recibo">Recibos</option>
          </select>
          <button
            className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            onClick={() => {
              setBusqueda("");
              setFiltroTipo("todos");
              cargarDocumentos();
            }}
          >
            Limpiar
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-medium">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 mb-0.5">
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
                      <div className="text-sm text-slate-700 font-bold">
                        {doc.clientes?.nombre || "Consumidor Final"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {doc.clientes?.dni_cuit || ""}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(doc.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-4 px-6">
                      {doc.creador ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {doc.creador.nombre_usuario?.[0]}
                            {doc.creador.apellido_usuario?.[0]}
                          </div>
                          <span className="text-sm text-slate-600">
                            {doc.creador.nombre_usuario}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">Sistema</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900 text-right">
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
                          className="p-2 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
                          title="Descargar PDF"
                        >
                          📄
                        </button>
                        <button
                          onClick={() => compartirWhatsApp(doc)}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                          title="WhatsApp"
                        >
                          💬
                        </button>
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
