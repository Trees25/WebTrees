import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useDocumento } from "../hooks/useDocumento";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderAdmin";

export default function Presupuesto() {
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
  } = useDocumento("presupuesto");

  const [clienteId, setClienteId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [perfilPagoId, setPerfilPagoId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const dataGuardada = localStorage.getItem("presupuesto_activo");
    if (dataGuardada) {
      const { extra, filas: filasGuardadas } = JSON.parse(dataGuardada);
      cargarDocumento({ ...extra, id: extra.id });
      setClienteId(extra.cliente_id || "");
      setFecha(extra.fecha || new Date().toISOString().split("T")[0]);
      setPerfilPagoId(extra.perfil_pago_id || "");
      setObservaciones(extra.observaciones || "");
      localStorage.removeItem("presupuesto_activo");
    }
  }, [cargarDocumento]);

  const descargarPDF = () => {
    const doc = new jsPDF();
    const selectedCliente = clientes.find((c) => c.id === clienteId);
    const selectedPerfil = perfilesPago.find((p) => p.id === perfilPagoId);

    // Formateo de fecha seguro
    const [year, month, day] = fecha.split("-");
    const fechaFormateada = `${day}/${month}/${year}`;

    const img = new Image();
    img.src = "/assets/logo.png";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`PRESUPUESTO`, 10, 10);
    doc.setFontSize(12);
    doc.text(`N°: ${contador}`, 10, 16);
    doc.text(`Fecha: ${fechaFormateada}`, 10, 22);

    try {
      doc.addImage(img, "PNG", 150, 5, 40, 20);
    } catch (e) {}

    doc.text(
      `Cliente: ${selectedCliente?.nombre || "No especificado"}`,
      10,
      35,
    );
    if (selectedCliente?.dni_cuit)
      doc.text(`DNI/CUIT: ${selectedCliente.dni_cuit}`, 10, 41);

    const tableBody = filas.map((f) => [
      f.cantidad.toString(),
      f.descripcion,
      `$${parseFloat(f.precio_unitario).toFixed(2)}`,
      `$${(f.cantidad * f.precio_unitario).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [["Cantidad", "Descripción", "P. Unitario", "Subtotal"]],
      body: tableBody,
      startY: 55,
      foot: [
        [
          {
            content: "TOTAL",
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

    const finalY = doc.lastAutoTable.finalY + 10;

    if (selectedPerfil) {
      let y = finalY;
      doc.setFont("helvetica", "bold");
      doc.text("DATOS DE PAGO", 10, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(`Alias: ${selectedPerfil.alias}`, 10, y);
      y += 6;
      doc.text(`Beneficiario: ${selectedPerfil.beneficiario}`, 10, y);
      y += 6;
      doc.text(`Banco: ${selectedPerfil.banco || "-"}`, 10, y);
      y += 6;
      doc.text(`CBU/Alias: ${selectedPerfil.cbu_alias || "-"}`, 10, y);
    }

    doc.save(`presupuesto_${contador}.pdf`);
  };

  const handleGuardar = async () => {
    if (!clienteId || !fecha || filas.some((f) => !f.descripcion)) {
      alert("Faltan datos obligatorios");
      return;
    }

    await guardarDocumento({
      cliente_id: clienteId,
      fecha,
      perfil_pago_id: perfilPagoId || null,
      observaciones,
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
            className="px-4 py-2 bg-white border rounded-lg text-sm"
          >
            ← Inicio
          </button>
          <button
            onClick={() => navigate("/resumen")}
            className="px-4 py-2 bg-white border rounded-lg text-sm"
          >
            Resumen
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 transition-colors">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              Generar Presupuesto
            </h2>
            <div className="bg-slate-100 px-4 py-2 rounded-lg font-bold transition-colors">
              N° {contador}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1 transition-colors">
                Cliente *
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg bg-white transition-colors"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
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
                  // Si la primera fila está vacía, la reemplazamos
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
                <th className="py-2 w-32 text-right px-2">Precio Unit.</th>
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

          <div className="mt-12 pt-8 border-t transition-colors">
            <h3 className="font-bold mb-4 transition-colors">
              💳 Datos de Pago
            </h3>
            <select
              className="w-full px-4 py-2 border rounded-lg bg-white mb-6 transition-colors"
              value={perfilPagoId}
              onChange={(e) => setPerfilPagoId(e.target.value)}
            >
              <option value="">Seleccionar cuenta...</option>
              {perfilesPago.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.alias} - {p.beneficiario}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center mt-8 pt-8 border-t transition-colors">
            <div className="text-2xl font-bold transition-colors">
              Total:{" "}
              <span className="text-blue-600">
                ${calcularTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGuardar}
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-lg"
              >
                {loading ? "Guardando..." : "Guardar"}
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
