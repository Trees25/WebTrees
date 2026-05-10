import { motion } from "framer-motion";
import FaultyTerminal from "./components/FaultyTerminal"; // Ajustá la ruta
import TrueFocus from "./components/TrueFocus"; // Ajustá la ruta
import Services from "./components/Services";
import About from "./components/About";
import ProjectsPreview from "./components/ProjectsPreview";
import Clients from "./components/Clients";
import Contact from "./components/Contact";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function Home() {
  return (
    <div className="w-full">
      {/* =========================================
          SECCIÓN 1: HERO (Inicio con Terminal)
      ========================================= */}
      <section
        id="inicio"
        // min-h-[calc(100vh-80px)] asume que tu Navbar mide 80px (h-20)
        className="relative min-h-[100vh] w-full flex items-center justify-center overflow-hidden"
      >
        {/* 1. Fondo de Terminal (Capa 0) */}
        <FaultyTerminal />

        {/* 2. Textos interactivos (Capa 1) */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl pointer-events-none">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Soluciones Innovadoras en
            <br />
            {/* Contenedor del TrueFocus */}
            <div className="mt-4 flex justify-center text-[#5EADF2]">
              <TrueFocus
                sentence="Software Hardware"
                manualMode={false}
                blurAmount={5}
                borderColor="white"
                animationDuration={2}
              />
            </div>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 max-w-2xl leading-relaxed">
            Desarrollo web, software a medida y mantenimiento de hardware para
            tu negocio.
          </p>

          <a
            href="#contacto"
            className="pointer-events-auto bg-[#5EADF2] text-[#101726] px-8 py-3 text-sm md:text-base rounded-full font-bold hover:bg-[#3D8BF2] transition-colors shadow-lg"
          >
            Contáctanos
          </a>
        </div>
      </section>

      {/* =========================================
          SECCIÓN 2: SERVICIOS (Scroll abajo)
      ========================================= */}
      <Services />

      {/* =========================================
          SECCIÓN 3: ABOUT (Scroll abajo)
      ========================================= */}
      <About />

      {/* =========================================
          SECCIÓN 4: PROJECTS (Scroll abajo)
      ========================================= 
      <ProjectsPreview />*/}

      {/* =========================================
          SECCIÓN 5: Clients (Scroll abajo)
      ========================================= */}
      <Clients />

      {/* =========================================
          SECCIÓN 6: CONTACTO (Scroll abajo)
      ========================================= */}
      <Contact />
    </div>
  );
}
