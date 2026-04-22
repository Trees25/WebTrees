import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight } from "lucide-react";

import anti_robo_autoLogo from "../assets/anti-robo-auto.webp";
import certibankosLogo from "../assets/certibankos.webp";
import molinautosLogo from "../assets/molinaautos1.webp";

const projects = [
  {
    id: 1,
    title: "Anti-Robo-Auto",
    imgSrc: anti_robo_autoLogo,
  },
  {
    id: 2,
    title: "CertibankOS",
    imgSrc: certibankosLogo,
  },
  {
    id: 3,
    title: "Molina Autos",
    imgSrc: molinautosLogo,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
};

export default function ProjectsPreview() {
  return (
    <section
      id="portafolio"
      className="py-24 bg-[#101726] relative z-10 scroll-mt-10 overflow-hidden"
    >
      {/* Fondo y Blur sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#5EADF2]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-6">
            Nuestros Trabajos
          </h2>
          <div className="w-24 h-1.5 bg-[#5EADF2] mx-auto rounded-full opacity-80" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-xl"
            >
              {/* Contenedor Imagen */}
              <div className="relative aspect-1 w-auto overflow-hidden bg-[#162032] flex items-center justify-center">
                {/* Fallback en caso de que imgSrc no resuelva bien temporalmente */}
                <img
                  src={project.imgSrc}
                  alt={project.title}
                  className="relative z-10 w-auto h-auto object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="text-slate-500 mt-auto font-mono text-xs absolute uppercase opacity-30">
                  {project.title}
                </div>
              </div>

              {/* Contenido Info */}
              <div className="p-6">
                <p className="text-[#5EADF2] text-xs font-bold uppercase tracking-wider mb-2">
                  {project.category}
                </p>
                <h3 className="text-xl font-bold text-white group-hover:text-[#5EADF2] transition-colors">
                  {project.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Botón Ver Más */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center"
        >
          <Link
            to="/proyectos"
            className="group flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-[#5EADF2] text-[#5EADF2] font-semibold rounded-2xl hover:bg-[#5EADF2] hover:text-[#101726] transition-all duration-300 shadow-[0_0_0_transparent] hover:shadow-[0_0_30px_rgba(94,173,242,0.3)]"
          >
            Presiona aqui para poder ver nuestro trabajo
            <ArrowRight
              size={20}
              className="transform transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
