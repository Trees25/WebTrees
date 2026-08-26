import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Layers, Smartphone, Monitor, X, Info } from "lucide-react";
import { allProjects } from "../data/projects.js";

const categories = ["Todos", "Páginas Web", "Aplicación Web", "Sistemas Personalizados"];

const categoryIcons = {
  "Todos": <Layers size={18} />,
  "Páginas Web": <Monitor size={18} />,
  "Aplicación Web": <Smartphone size={18} />,
  "Sistemas Personalizados": <Monitor size={18} />,
};

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    document.title = "Proyectos & Portafolio | WEB-TREES";
  }, []);

  // Bloquear el scroll cuando el modal está abierto
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedProject]);

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
                onClick={() => setSelectedProject(project)}
                className="group relative bg-[#162032] border border-white/5 hover:border-[#5EADF2]/40 cursor-pointer rounded-3xl overflow-hidden shadow-lg transition-all duration-300 aspect-auto hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(94,173,242,0.15)]"
              >
                {/* Imagen del Proyecto */}
                <div className="relative h-64 w-full overflow-hidden bg-[#101726]/50 flex items-center justify-center">
                  <img
                    src={project.imgSrc}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    width="600"
                    height="400"
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />

                  {/* Icono Info flotante */}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10">
                    <Info size={20} className="text-[#5EADF2]" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 relative z-10 bg-gradient-to-b from-[#162032]/0 to-[#162032]">
                  <span className="text-[#5EADF2] text-xs font-bold uppercase tracking-widest mb-2 block">
                    {project.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">{project.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mt-2">{project.description}</p>
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

      {/* Modal de Detalles del Proyecto */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-[#0a0f18]/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#162032] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10"
            >
              {/* Botón Cerrar */}
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>

              {/* Imagen en Modal */}
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-[#101726]/50 relative overflow-hidden">
                <img
                  src={selectedProject.imgSrc}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#162032] to-transparent md:hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#162032] hidden md:block" />
              </div>

              {/* Contenido en Modal */}
              <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
                <span className="text-[#5EADF2] text-xs font-bold uppercase tracking-widest mb-3 block">
                  {selectedProject.category}
                </span>
                
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {selectedProject.title}
                </h3>
                
                <div className="w-12 h-1 bg-gradient-to-r from-[#5EADF2] to-[#296cf2] rounded-full mb-6" />
                
                <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8">
                  {selectedProject.description}
                </p>

                <div className="mt-auto flex flex-col sm:flex-row gap-4 items-center">
                  {selectedProject.link !== "#contacto" && selectedProject.link !== "#" ? (
                    <a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-[#101726] bg-[#5EADF2] px-6 py-3.5 rounded-xl hover:bg-white transition-colors"
                    >
                      Visitar Proyecto <ExternalLink size={18} />
                    </a>
                  ) : selectedProject.link === "#contacto" ? (
                    <a
                      href="/#contacto"
                      onClick={() => setSelectedProject(null)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-[#101726] bg-[#5EADF2] px-6 py-3.5 rounded-xl hover:bg-white transition-colors"
                    >
                      Solicitar Demo <ExternalLink size={18} />
                    </a>
                  ) : null}

                  <span className="w-full sm:w-auto flex justify-center text-sm font-bold text-gray-400 bg-white/5 px-6 py-3.5 rounded-xl border border-white/10">
                    Estado: {selectedProject.status}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
