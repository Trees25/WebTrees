import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, Rocket } from "lucide-react";
import Juan_Mondre from "../assets/Juan_Mondre.webp";
import Nico_Andreolli from "../assets/Nicolas_Andreolli.webp";
import Lautaro_Lopez from "../assets/Lopez_Lautaro.webp";
import Guille_Gomez from "../assets/Gomez_Guille.webp";

// 1. Misión y Visión (Solo la versión de la derecha con íconos)
const MissionVisionContent = () => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="space-y-12"
  >
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[#5EADF2]">
        <Target size={32} strokeWidth={2.5} />
        <h3 className="text-2xl font-black uppercase tracking-tighter">
          Misión
        </h3>
      </div>
      <p className="text-slate-300 leading-relaxed text-lg border-l-4 border-[#5EADF2]/20 pl-6">
        Transformar los desafíos tecnológicos de nuestros clientes en{" "}
        <span className="text-white font-semibold">soluciones innovadoras</span>{" "}
        y eficientes, integrando software y hardware con calidad superior.
      </p>
    </div>

    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[#5EADF2]">
        <Eye size={32} strokeWidth={2.5} />
        <h3 className="text-2xl font-black uppercase tracking-tighter">
          Visión
        </h3>
      </div>
      <p className="text-slate-300 leading-relaxed text-lg border-l-4 border-[#5EADF2]/20 pl-6">
        Ser referentes en desarrollo tecnológico integral, impulsando la{" "}
        <span className="text-white font-semibold">transformación digital</span>{" "}
        que potencie el crecimiento y la competitividad.
      </p>
    </div>
  </motion.div>
);

// 2. Badge (+5 años)
const TechBadge = () => (
  <div className="relative w-full flex items-center justify-center py-10">
    <div className="absolute w-72 h-72 bg-[#5EADF2]/10 rounded-full blur-[100px]" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center text-center max-w-[280px]">
      <div className="w-20 h-20 bg-[#5EADF2] rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_-10px_#5EADF2]">
        <Rocket size={44} className="text-[#101726]" strokeWidth={2.5} />
      </div>
      <h4 className="text-5xl font-black text-white mb-2">+5 Años</h4>
      <p className="text-[#5EADF2] font-mono tracking-widest uppercase text-[10px] font-bold">
        Innovando en San Juan
      </p>
    </div>
  </div>
);

// 3. Tarjeta de Equipo
const TeamCard = ({ name, title, avatarUrl, handle, link }) => (
  <motion.div
    whileHover={{ y: -10 }}
    // h-full para que todas midan lo mismo, flex-col para controlar el orden
    className="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 text-center group transition-all flex flex-col h-full"
  >
    <div className="relative w-32 h-32 mx-auto mb-6 shrink-0">
      <div className="absolute inset-0 bg-[#5EADF2] blur-2xl opacity-10 group-hover:opacity-30 transition-opacity" />
      <img
        src={avatarUrl}
        alt={name}
        className="relative w-full h-full object-cover rounded-3xl border-2 border-white/10"
      />
    </div>

    {/* Contenedor del nombre con altura mínima para 2 líneas aprox */}
    <div className="min-h-[64px] flex items-center justify-center mb-1">
      <h4 className="text-xl lg:text-2xl font-bold text-white leading-tight">
        {name}
      </h4>
    </div>

    {/* Título y Handle */}
    <p className="text-[#5EADF2] font-medium mb-2">{title}</p>
    <div className="text-slate-400 text-sm mb-6 font-mono">@{handle}</div>

    {/* mt-auto empuja el botón al final de la tarjeta sin importar el texto de arriba */}
    <button
      onClick={() => window.open(link, "_blank")}
      className="mt-auto w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-[#5EADF2] hover:text-[#101726] font-bold transition-colors duration-500 ease-in-out  shrink-0"
    >
      Contact Me
    </button>
  </motion.div>
);

// --- COMPONENTE FINAL ---
export default function About() {
  return (
    <section
      id="nosotros"
      className="py-24 bg-[#101726] text-white scroll-mt-10 overflow-hidden"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Título principal de la sección */}
        <div className="text-center mb-24">
          <span className="text-[#5EADF2] font-mono tracking-[0.4em] uppercase text-xs font-bold">
            Nuestra Esencia
          </span>
          <h2 className="text-5xl md:text-7xl font-black text-white mt-4">
            Sobre Nosotros
          </h2>
          <div className="w-24 h-2 bg-[#5EADF2] mx-auto mt-8 rounded-full" />
        </div>

        {/* Misión/Visión y Badge alineados en grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center mb-40">
          <MissionVisionContent />
          <TechBadge />
        </div>

        {/* Sección de Equipo */}
        <div className="space-y-10">
          <div className="text-center">
            <h3 className="text-4xl md:text-5xl font-black text-white">
              Nuestro Equipo
            </h3>
            <p className="text-slate-400 mt-4 text-lg">
              Expertos dedicados a potenciar tu visión tecnológica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-stretch justify-items-center">
            <TeamCard
              name="Juan Mondre"
              title="Desarrollador FullStack"
              handle="juanmondre"
              avatarUrl={Juan_Mondre}
              link="https://linktr.ee/JuanMondre"
            />
            <TeamCard
              name="Nicolás Andreolli"
              title="Desarrollador Fullstack"
              handle="nico_andreolli"
              avatarUrl={Nico_Andreolli}
              link="https://linktr.ee/NicolasAndreolli"
            />
            <TeamCard
              name="Lautaro López"
              title="Desarrollador FullStack"
              handle="lautarolopez"
              avatarUrl={Lautaro_Lopez}
              link="https://www.linkedin.com/in/lautaro-l%C3%B3pez-49a5861a3/"
            />
            <TeamCard
              name="Guillermo Gómez"
              title="Desarrollador Fullstack"
              handle="guillermogomez"
              avatarUrl={Guille_Gomez}
              link="https://www.linkedin.com/in/guillermo-g%C3%B3mez-2a86a134a/"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
