import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function ProjectsPreview() {
  return (
    <section
      id="portafolio"
      className="py-24 bg-[#101726] relative z-10 scroll-mt-10 overflow-hidden"
    >
      {/* Fondo y Blur sutil general */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#5EADF2]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          // Tarjeta principal contenedora
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-16 lg:p-20 shadow-2xl overflow-hidden"
        >
          {/* Brillo interno de la tarjeta en la esquina */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5EADF2]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          {/* Contenedor Flex: Texto a la izquierda, Botón a la derecha */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            {/* --- TEXTO (Izquierda) --- */}
            <div className="flex-1 text-center lg:text-left">
              {/* Etiqueta de Confianza */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5EADF2]/10 border border-[#5EADF2]/20 text-[#5EADF2] mb-6">
                <ShieldCheck size={18} />
                <span className="font-mono text-xs font-bold uppercase tracking-widest">
                  Excelencia Garantizada
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Resultados que <br className="hidden md:block" />
                <span className="text-[#5EADF2]">hablan por sí solos.</span>
              </h2>

              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Nos enorgullece entregar soluciones tecnológicas robustas, a
                medida y altamente confiables. Cada línea de código y cada
                configuración refleja nuestro compromiso absoluto con el éxito
                de tu negocio.
              </p>
            </div>

            {/* --- BOTÓN (Derecha) --- */}
            <div className="flex-shrink-0">
              <Link
                to="/proyectos"
                className="group flex items-center gap-4 px-8 py-5 bg-[#5EADF2] text-[#101726] font-black rounded-2xl hover:bg-[#3D8BF2] transition-all duration-300 shadow-[0_0_30px_rgba(94,173,242,0.2)] hover:shadow-[0_0_40px_rgba(94,173,242,0.4)] hover:-translate-y-1"
              >
                Ver Portafolio
                <ArrowRight
                  size={24}
                  className="transform transition-transform group-hover:translate-x-2"
                />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
