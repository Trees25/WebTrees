import React from 'react';
import { motion } from 'framer-motion';

// Imágenes de los clientes (asegúrate de que correspondan a /assets/)
import asocSarLogo from '../assets/AsocSar_logo-1.webp';
import biscuiLogo from '../assets/Biscui_logo.webp';
import ilCapitanoLogo from '../assets/Ilcapitano_logo.webp';
import miPanaleraLogo from '../assets/MiPañalera_logo.webp';
import molinautosLogo from '../assets/molinautos_logo.webp';
import logoNN from "../assets/logoNNLubri.webp";
import AllPackLogo from "../assets/AllPack_logo.webp";
import logo_cortineria from "../assets/logo_cortineria.webp";

const clients = [
  { id: 1, src: asocSarLogo, alt: "Asociación Sanjuanina" },
  { id: 2, src: biscuiLogo, alt: "Biscui" },
  { id: 3, src: ilCapitanoLogo, alt: "Il Capitano" },
  { id: 4, src: miPanaleraLogo, alt: "Mi Pañalera" },
  { id: 5, src: molinautosLogo, alt: "Molinautos" },
  { id: 7, src: logoNN, alt: "NN Lubricentro" },
  { id: 8, src: AllPackLogo, alt: "Allpack" },
  { id: 9, src: logo_cortineria, alt: "Cortineria" },
];

export default function Clients() {
  // Duplicamos el array para lograr el efecto infinito sin cortes
  const duplicatedClients = [...clients, ...clients];

  return (
    <section id="clientes" className="py-24 bg-[#101726] relative z-10 scroll-mt-10 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Título de la Sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#5EADF2] font-bold tracking-widest uppercase text-sm">
            Confían en nosotros
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-6">
            Nuestros Clientes
          </h2>
          <div className="w-24 h-1.5 bg-[#5EADF2] mx-auto rounded-full opacity-80" />
        </motion.div>

        {/* Carrusel Contenedor */}
        <div className="relative max-w-6xl mx-auto overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-16 md:before:w-32 before:bg-gradient-to-r before:from-[#101726] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-16 md:after:w-32 after:bg-gradient-to-l after:from-[#101726] after:to-transparent">

          {/* Pista del Carrusel (Framer Motion) */}
          <motion.div
            className="flex items-center gap-10 w-max"
            animate={{
              x: ["0%", "-50%"]
            }}
            transition={{
              ease: "linear",
              duration: 20,  // Velocidad de scroll
              repeat: Infinity,
            }}
          >
            {duplicatedClients.map((client, index) => (
              <div
                key={`${client.id}-${index}`}
                className="flex-shrink-0 flex items-center justify-center w-[120px] md:w-[180px] hover:scale-110 transition-transform duration-300"
              >
                <img
                  src={client.src}
                  alt={client.alt}
                  className="max-h-20 md:max-h-28 w-auto object-contain opacity-40 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 drop-shadow-xl"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
