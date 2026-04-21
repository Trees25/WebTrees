import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useDocumento } from "../hooks/useDocumento";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/HeaderAdmin.jsx";

export default function Recibo() {
  const {
    contador,
    filas,
    clientes,
    perfilesPago,
    loading,
    actualizarFila,
    agregarFila,
    eliminarFila,
    calcularTotal,
    guardarDocumento,
    cargarDocumento,
    resetForm,
    servicios,
    setFilas,
  } = useDocumento("recibo");

  const [clienteId, setClienteId] = useState("");
  const [clienteLibre, setClienteLibre] = useState(""); // Para clientes de posventa que no están en la DB principal
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [observaciones, setObservaciones] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si venimos de Posventa con un cliente predefinido
    if (location.state?.clientePredefinido) {
      const p = location.state.clientePredefinido;
      setClienteLibre(p.nombre);
      if (p.nota) {
        setObservaciones(p.nota);
      }
      // Limpiamos el state para que no se vuelva a cargar si refresca
      window.history.replaceState({}, document.title);
    }
    const fromPresupuesto = localStorage.getItem("presupuesto_en_recibo");
    if (fromPresupuesto) {
      const parsed = JSON.parse(fromPresupuesto);
      setClienteId(parsed.cliente_id || "");
      setFecha(new Date().toISOString().split("T")[0]);
      if (Array.isArray(parsed.filas)) {
        setFilas(
          parsed.filas.map((f) => ({
            descripcion: f.descripcion,
            cantidad: f.cantidad,
            precio_unitario: f.precio_unitario,
          })),
        );
      }
      localStorage.removeItem("presupuesto_en_recibo");
    }

    const activo = localStorage.getItem("recibo_activo");
    if (activo) {
      const { extra, filas: filasGuardadas } = JSON.parse(activo);
      cargarDocumento({ ...extra, id: extra.id });
      setClienteId(extra.cliente_id || "");
      setFecha(extra.fecha || new Date().toISOString().split("T")[0]);
      setObservaciones(extra.observaciones || "");
      localStorage.removeItem("recibo_activo");
    }
  }, [cargarDocumento, setFilas]);

  const descargarPDF = () => {
    const doc = new jsPDF();
    const selectedCliente = clientes.find((c) => c.id === clienteId);

    // Formateo de fecha seguro
    const [year, month, day] = fecha.split("-");
    const fechaFormateada = `${day}/${month}/${year}`;

    const img = new Image();
    img.src = "/assets/logo.png";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`RECIBO`, 10, 10);
    doc.setFontSize(12);
    doc.text(`N°: ${contador}`, 10, 16);
    doc.text(`Fecha: ${fechaFormateada}`, 10, 22);

    try {
      doc.addImage(img, "PNG", 150, 5, 40, 20);
    } catch (e) {}

    doc.text(
      `Recibí de: ${selectedCliente?.nombre || clienteLibre || "No especificado"}`,
      10,
      35,
    );

    const tableBody = filas.map((f) => [
      f.cantidad.toString(),
      f.descripcion,
      `$${parseFloat(f.precio_unitario).toFixed(2)}`,
      `$${(f.cantidad * f.precio_unitario).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [["Cantidad", "Descripción", "Importe", "Subtotal"]],
      body: tableBody,
      startY: 50,
      foot: [
        [
          {
            content: "TOTAL RECIBIDO",
            colSpan: 3,
            styles: { halign: "right", fontStyle: "bold" },
          },
          {
            content: `$${calcularTotal().toFixed(2)}`,
            styles: { fontStyle: "bold" },
          },
        ],
      ],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
    });

    doc.save(`recibo_${contador}.pdf`);
  };

  const handleGuardar = async () => {
    if (
      (!clienteId && !clienteLibre) ||
      !fecha ||
      filas.some((f) => !f.descripcion)
    ) {
      alert("Faltan datos obligatorios");
      return;
    }

    await guardarDocumento({
      // Si hay un clienteLibre (de Posventa), lo guardamos como texto adicional si tu DB lo permite,
      // o preferimos forzar que se asocie a un cliente en DB.
      // Modifico para enviar el clienteId si existe, o null.
      cliente_id: clienteId || null,
      cliente_libre: clienteLibre, // Necesitaremos asegurar que hook/DB soporten esto, o usar nota
      fecha,
      observaciones: clienteLibre
        ? `Cliente Posventa: ${clienteLibre} | ${observaciones}`
        : observaciones,
      numero: contador,
    });
    navigate("/resumen");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 bg-white border rounded-lg text-sm transition-colors"
          >
            ← Inicio
          </button>
          <button
            onClick={() => navigate("/resumen")}
            className="px-4 py-2 bg-white border rounded-lg text-sm transition-colors"
          >
            Resumen
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 transition-colors">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 transition-colors">
              Generar Recibo
            </h2>
            <div className="bg-slate-100 px-4 py-2 rounded-lg font-bold transition-colors">
              N° {contador}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1 transition-colors">
                Recibí de *
              </label>

              {/* Si tenemos un cliente libre cargado, mostramos esto. Si no, el select tradicional */}
              {clienteLibre ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-700"
                    value={clienteLibre}
                  />
                  <button
                    onClick={() => setClienteLibre("")}
                    className="px-3 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                    title="Descartar cliente predefinido"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <select
                  className="w-full px-4 py-2 border rounded-lg bg-white transition-colors"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                >
                  <option value="">
                    Seleccionar cliente de la base de datos...
                  </option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 transition-colors">
                Fecha *
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg bg-white transition-colors"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 transition-colors">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Añadir desde Catálogo
            </label>
            <select
              className="w-full md:w-1/2 px-4 py-2 border rounded-lg bg-white transition-colors"
              value=""
              onChange={(e) => {
                const s = servicios.find((srv) => srv.id === e.target.value);
                if (s) {
                  if (filas.length === 1 && !filas[0].descripcion) {
                    setFilas([
                      {
                        descripcion: s.nombre,
                        cantidad: 1,
                        precio_unitario: s.precio,
                      },
                    ]);
                  } else {
                    setFilas([
                      ...filas,
                      {
                        descripcion: s.nombre,
                        cantidad: 1,
                        precio_unitario: s.precio,
                      },
                    ]);
                  }
                }
              }}
            >
              <option value="">Seleccionar un servicio...</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} - ${Number(s.precio).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <table className="w-full mb-6 text-left">
            <thead>
              <tr className="border-b text-slate-600 transition-colors">
                <th className="py-2">Descripción</th>
                <th className="py-2 w-24 text-center">Cant.</th>
                <th className="py-2 w-32 text-right px-2">Importe</th>
                <th className="py-2 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-50 transition-colors"
                >
                  <td className="py-3">
                    <input
                      className="w-full border-none outline-none bg-transparent"
                      placeholder="Item..."
                      value={f.descripcion}
                      onChange={(e) =>
                        actualizarFila(i, "descripcion", e.target.value)
                      }
                    />
                  </td>
                  <td className="py-3 text-center">
                    <input
                      className="w-20 text-center bg-slate-50 rounded border"
                      type="number"
                      value={f.cantidad}
                      onChange={(e) =>
                        actualizarFila(i, "cantidad", e.target.value)
                      }
                    />
                  </td>
                  <td className="py-3 text-right">
                    <input
                      className="w-28 text-right bg-slate-50 rounded px-2 border"
                      type="number"
                      value={f.precio_unitario}
                      onChange={(e) =>
                        actualizarFila(i, "precio_unitario", e.target.value)
                      }
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => eliminarFila(i)}
                      className="text-red-400"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={agregarFila}
            className="text-blue-600 text-sm font-bold"
          >
            + Agregar fila
          </button>

          <div className="flex justify-between items-center mt-8 pt-8 border-t">
            <div className="text-2xl font-bold">
              Total:{" "}
              <span className="text-emerald-600">
                ${calcularTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGuardar}
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-lg"
              >
                {loading ? "Guardando..." : "Guardar Recibo"}
              </button>
              <button
                onClick={descargarPDF}
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow-lg"
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
