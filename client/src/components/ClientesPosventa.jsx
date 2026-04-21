import React, { useEffect, useState } from "react";
import { supabasePosventa, authenticatePosventa } from "../lib/supabasePosventa";
import { supabase } from "../lib/supabase";
import Header from "./HeaderAdmin";
import { useNavigate } from "react-router-dom";

export default function ClientesPosventa() {
    const [clientes, setClientes] = useState([]);
    const [recibosPosventa, setRecibosPosventa] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dbError, setDbError] = useState(null);
    const [modalHistorial, setModalHistorial] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarClientesYRecibos();
    }, []);

    const cargarClientesYRecibos = async () => {
        if (!supabasePosventa) {
            console.warn("Cliente Supabase Posventa no inicializado. Faltan credenciales en .env");
            return;
        }

        setLoading(true);
        setDbError(null);
        try {
            // Autenticar posventa
            const authSuccess = await authenticatePosventa();
            if (!authSuccess) {
                console.warn("No se pudo iniciar sesión en posventa.");
            }

            // Consultar empresas
            const { data: dataEmpresas, error: errorEmpresas } = await supabasePosventa
                .from("empresa")
                .select(`*, usuarios (*)`);

            if (errorEmpresas) throw errorEmpresas;

            // Consultar recibos históricos de la DB principal para cruzar datos
            const { data: dataRecibos, error: errorRecibos } = await supabase
                .from("documentos")
                .select("id, fecha, cliente_libre, numero, total_calculado, observaciones") // Suponiendo totales u observaciones
                .eq("tipo", "recibo")
                .not("cliente_libre", "is", null)
                .order("fecha", { ascending: false });

            // Ignore recibos errors simply logging them
            if (errorRecibos) console.warn("Error cargando recibos:", errorRecibos);

            if (dataEmpresas) setClientes(dataEmpresas);
            if (dataRecibos) setRecibosPosventa(dataRecibos);

        } catch (error) {
            console.error("Error al cargar datos:", error.message);
            setDbError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerarRecibo = (cliente) => {
        const nombreEmpresa = cliente.nombre || cliente.razon_social || cliente.name || "Empresa sin nombre";
        navigate("/recibo", {
            state: {
                clientePredefinido: {
                    id_posventa: cliente.id,
                    nombre: nombreEmpresa,
                    dni_cuit: cliente.dni || cliente.cuit || "",
                    email: cliente.email || "",
                    nota: `Pago de suscripción - Posventa`
                }
            }
        });
    };

    const calcularEstado = (nombreEmpresa) => {
        const recibosCliente = recibosPosventa.filter(r => r.cliente_libre === nombreEmpresa);
        if (recibosCliente.length === 0) return { texto: "Sin registros", color: "bg-slate-100 text-slate-600" };

        const ultimoRecibo = recibosCliente[0]; // Están ordenados descendente
        if (!ultimoRecibo.fecha) return { texto: "Fecha inválida", color: "bg-slate-100 text-slate-600" };

        const fechaUltimoPago = new Date(ultimoRecibo.fecha);
        const hoy = new Date();
        const diasTranscurridos = (hoy - fechaUltimoPago) / (1000 * 60 * 60 * 24);

        if (diasTranscurridos <= 31) {
            return { texto: "Al Día", color: "bg-emerald-100 text-emerald-800 border-emerald-200 border" };
        } else {
            return { texto: "Vencido", color: "bg-red-100 text-red-800 border-red-200 border" };
        }
    };

    const abrirHistorial = (nombreEmpresa) => {
        const filtrados = recibosPosventa.filter(r => r.cliente_libre === nombreEmpresa);
        setModalHistorial({ nombre: nombreEmpresa, recibos: filtrados });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12 relative">
            <Header />
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Administrador de Suscripciones</h2>
                        <p className="text-slate-500">Control de clientes y pagos del sistema Posventa</p>
                    </div>
                    <button
                        className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                        onClick={() => navigate("/admin")}
                    >
                        ← Volver al Admin
                    </button>
                </div>

                {!supabasePosventa && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-6">
                        <strong>Atención:</strong> Faltan configurar las credenciales Posventa en el archivo <code>.env</code>.
                    </div>
                )}

                {dbError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6">
                        <strong>Error de Base de Datos Posventa:</strong> {dbError}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-700">Listado de Empresas Suscritas</h3>
                        <button 
                            onClick={cargarClientesYRecibos}
                            className="text-sm px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-600 transition-colors"
                        >
                            Actualizar Estados
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-slate-200">
                                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Empresa</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Contacto</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Estado de Pago</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-500">Analizando registros de suscripciones...</td>
                                    </tr>
                                )}
                                {!loading && clientes.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-400 italic">
                                            {supabasePosventa 
                                                ? "No se encontraron clientes de posventa."
                                                : "Conecta la base de datos para ver suscripciones."}
                                        </td>
                                    </tr>
                                )}
                                {!loading && clientes.map(cli => {
                                    const nombreEmpresa = cli.nombre || cli.razon_social || cli.name || "Empresa sin nombre";
                                    let email = "Sin email", phone = cli.telefono || cli.phone || "";
                                    
                                    if (cli.usuarios) {
                                        if (Array.isArray(cli.usuarios)) {
                                            const admin = cli.usuarios.find(u => u.rol === 'admin' || u.role === 'admin') || cli.usuarios[0];
                                            if (admin) {
                                                email = admin.email || admin.correo || email;
                                                phone = admin.telefono || admin.phone || phone;
                                            }
                                        } else {
                                            email = cli.usuarios.email || cli.usuarios.correo || email;
                                            phone = cli.usuarios.telefono || cli.usuarios.phone || phone;
                                        }
                                    }

                                    const estadoObj = calcularEstado(nombreEmpresa);

                                    return (
                                        <tr key={cli.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6 text-sm font-bold text-slate-900">
                                                {nombreEmpresa}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-500">
                                                <div>{email}</div>
                                                <div className="text-xs text-slate-400">{phone}</div>
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${estadoObj.color}`}>
                                                    {estadoObj.texto}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => abrirHistorial(nombreEmpresa)}
                                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors mr-2"
                                                >
                                                    Historial
                                                </button>
                                                <button
                                                    onClick={() => handleGenerarRecibo({ ...cli, nombre: nombreEmpresa, email })}
                                                    className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                                                >
                                                    + Nuevo Cobro
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Historial */}
            {modalHistorial && (
                <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                        <button 
                            onClick={() => setModalHistorial(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-xl font-bold"
                        >
                            ×
                        </button>
                        <h3 className="text-xl font-bold mb-1">Historial de Pagos</h3>
                        <p className="text-sm text-slate-500 mb-6">{modalHistorial.nombre}</p>

                        <div className="max-h-80 overflow-y-auto space-y-3">
                            {modalHistorial.recibos.length === 0 ? (
                                <p className="text-center py-8 text-slate-400 text-sm">Sin recibos registrados.</p>
                            ) : (
                                modalHistorial.recibos.map(r => (
                                    <div key={r.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50">
                                        <div>
                                            <p className="font-bold text-slate-700">Recibo N° {r.numero}</p>
                                            <p className="text-xs text-slate-500">{new Date(r.fecha).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-bold">Cobrado</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
