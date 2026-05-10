import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, Rocket } from "lucide-react";

// 1. Sub-componente Interno: Misión y Visión
const MissionVisionContent = () => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="space-y-8"
  >
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[#5EADF2]">
        <Target size={28} />
        <h3 className="text-2xl font-black uppercase tracking-wider">Misión</h3>
      </div>
      <p className="text-slate-300 leading-relaxed text-lg border-l-2 border-[#5EADF2]/30 pl-4">
        Transformar los desafíos tecnológicos de nuestros clientes en{" "}
        <span className="text-white font-semibold">soluciones innovadoras</span>{" "}
        y eficientes, integrando software y hardware con calidad superior.
      </p>
    </div>

    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[#5EADF2]">
        <Eye size={28} />
        <h3 className="text-2xl font-black uppercase tracking-wider">Visión</h3>
      </div>
      <p className="text-slate-300 leading-relaxed text-lg border-l-2 border-[#5EADF2]/30 pl-4">
        Ser referentes en desarrollo tecnológico integral, impulsando la{" "}
        <span className="text-white font-semibold">transformación digital</span>{" "}
        que potencie el crecimiento y la competitividad.
      </p>
    </div>
  </motion.div>
);

// 2. Sub-componente Interno: Badge Decorativo
const TechBadge = () => (
  <div className="relative w-full h-full flex items-center justify-center min-h-[300px]">
    <div className="absolute w-64 h-64 bg-[#5EADF2]/10 rounded-full blur-3xl" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-[#5EADF2] rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_#5EADF2]">
        <Rocket size={40} className="text-[#101726]" strokeWidth={2.5} />
      </div>
      <h4 className="text-3xl font-black text-white mb-1">+5 Años</h4>
      <p className="text-[#5EADF2] font-mono tracking-widest uppercase text-xs">
        Innovando en San Juan
      </p>
    </div>
  </div>
);

// 3. Sub-componente Interno: Tarjeta de Equipo
const TeamCard = ({ name, title, avatarUrl, handle, link }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 text-center group transition-all"
  >
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 bg-[#5EADF2] blur-2xl opacity-10 group-hover:opacity-30 transition-opacity" />
      <img
        src={avatarUrl}
        alt={name}
        className="relative w-full h-full object-cover rounded-3xl border-2 border-white/10"
      />
    </div>
    <h4 className="text-2xl font-bold text-white mb-1">{name}</h4>
    <p className="text-[#5EADF2] font-medium mb-4">{title}</p>
    <div className="text-slate-400 text-sm mb-6 font-mono">@{handle}</div>
    <button
      onClick={() => window.open(link, "_blank")}
      className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-[#5EADF2] hover:text-[#101726] font-bold transition-all"
    >
      Contact Me
    </button>
  </motion.div>
);

// COMPONENTE PRINCIPAL (EXPORT DEFAULT)
const About = () => {
  return (
    <section
      id="nosotros"
      className="py-24 bg-[#101726] text-white scroll-mt-20 overflow-hidden"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Cabecera */}
        <div className="text-center mb-20">
          <span className="text-[#5EADF2] font-mono tracking-[0.3em] uppercase text-sm">
            Nuestra Esencia
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-4">
            Sobre Nosotros
          </h2>
          <div className="w-24 h-1.5 bg-[#5EADF2] mx-auto mt-6 rounded-full" />
        </div>

        {/* Grid de Misión/Visión y Badge */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <MissionVisionContent />
          <TechBadge />
        </div>

        {/* Sección Equipo */}
        <div className="space-y-16">
          <div className="text-center">
            <h3 className="text-3xl md:text-4xl font-black text-white">
              Nuestro Equipo
            </h3>
            <p className="text-slate-400 mt-2">
              Expertos dedicados a potenciar tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
            <TeamCard
              name="Juan Mondre"
              title="Desarrollador FullStack"
              handle="juanmondre"
              avatarUrl="/assets/Juan_Mondre1.png"
              link="https://linktr.ee/JuanMondre"
            />
            <TeamCard
              name="Nicolás Andreolli"
              title="Desarrollador Fullstack"
              handle="nico_andreolli"
              avatarUrl="/assets/Nicolas_Andreolli1.png"
              link="https://linktr.ee/NicolasAndreolli"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
