import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Layers, Smartphone, Monitor } from "lucide-react";

import molinautos1 from "../assets/molinaautos1.webp";
import anti_robo_auto from "../assets/anti-robo-auto.webp";
import kaiserjagger1 from "../assets/kaiserjagger.webp";
import pos_ventaLogo from "../assets/posventa1.webp";
import sistNN from "../assets/sist_nn_lubri.webp";
import sist_cortineria from "../assets/sist_cortineria.webp";
import sist_allpack from "../assets/sist_allpack.webp";

// Datos combinados simulados
const allProjects = [
  { id: 1, title: "Portafolio - KaiserJagger", category: "Páginas Web", imgSrc: kaiserjagger1, link: "https://kaiserjagger.com", status: "Finalizado" },
  { id: 2, title: "Landing Page - Anti-Robo-Auto", category: "Páginas Web", imgSrc: anti_robo_auto, link: "#", status: "Finalizado" },
  { id: 3, title: "Landing Page - Molina Autos", category: "Sistemas Personalizados", imgSrc: molinautos1, link: "https://molinaautos.com", status: "Finalizado" },
  { id: 4, title: "Pos Venta", category: "Aplicación Web", imgSrc: pos_ventaLogo, link: "#", status: "En Desarrollo" },
  { id: 5, title: "Sistema de Gestion de Stock - NN Lubricentro", category: "Sistemas Personalizados", imgSrc: sistNN, link: "#", status: "En Desarrollo" },
  { id: 6, title: "Generador de Presupuestos - Cortineria San Juan", category: "Sistemas Personalizados", imgSrc: sist_cortineria, link: "#", status: "Finalizado" },
  { id: 7, title: "Sistema POS/ERP con Facturación (ARCA) - Allpack", category: "Aplicación Web", imgSrc: sist_allpack, link: "#", status: "Finalizado" },
];

const categories = ["Todos", "Páginas Web", "Aplicación Web", "Sistemas Personalizados"];

const categoryIcons = {
  "Todos": <Layers size={18} />,
  "Páginas Web": <Monitor size={18} />,
  "Aplicación Web": <Smartphone size={18} />,
  "Sistemas Personalizados": <Monitor size={18} />,
};

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("Todos");

  useEffect(() => {
    document.title = "Proyectos & Portafolio | WEB-TREES";
  }, []);

  const filteredProjects = allProjects.filter((project) =>
    activeCategory === "Todos" ? true : project.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-[#101726] pt-24 pb-20 relative overflow-hidden">
      {/* Decoraciones de Fondo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5EADF2]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#296cf2]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
            Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5EADF2] to-[#296cf2]">Trabajos</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Descubrí cómo ayudamos a marcas y negocios a escalar al siguiente nivel a través
            del diseño moderno y desarrollo robusto.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${isActive
                  ? "bg-[#5EADF2] text-[#101726] shadow-[0_0_20px_rgba(94,173,242,0.4)]"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
              >
                {categoryIcons[cat]}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid Animada */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative bg-[#162032] border border-white/5 hover:border-white/20 rounded-3xl overflow-hidden shadow-lg transition-colors aspect-auto"
              >
                {/* Imagen del Proyecto */}
                <div className="relative h-64 w-full overflow-hidden bg-[#101726]/50 flex items-center justify-center">
                  <img
                    src={project.imgSrc}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />

                  {/* Hover Gradiente y Botón */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101726] via-[#101726]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {project.link !== "#" ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-[#101726] bg-[#5EADF2] px-5 py-2.5 rounded-xl hover:bg-white hover:text-[#101726] transition-colors"
                        >
                          Visitar Sitio <ExternalLink size={16} />
                        </a>
                      ) : (
                        <span className="inline-block text-sm font-bold text-gray-400 bg-white/10 px-5 py-2.5 rounded-xl">
                          {project.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 relative z-10 bg-gradient-to-b from-[#162032]/0 to-[#162032]">
                  <span className="text-[#5EADF2] text-xs font-bold uppercase tracking-widest mb-2 block">
                    {project.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State visual */}
        {filteredProjects.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-gray-400 text-lg">Próximamente estaremos subiendo más trabajos.</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
