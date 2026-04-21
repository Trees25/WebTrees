import React from "react";
import { motion } from "framer-motion";
import { Globe, Laptop, Smartphone, Wrench } from "lucide-react";
// Variantes para la orquestación en cascada
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Retraso entre cada tarjeta
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const ServiceItem = ({ icon, title, description }) => (
  <motion.article
    variants={cardVariants}
    whileHover={{
      y: -10,
      boxShadow: "0 25px 50px -12px rgba(94, 173, 242, 0.15)",
      borderColor: "rgba(94, 173, 242, 0.3)",
    }}
    className="relative group bg-[#162032] p-8 rounded-3xl shadow-xl border border-white/5 flex flex-col items-center text-center transition-colors duration-300 h-full"
  >
    {/* 2. Aplicamos el color celeste (text-[#5EADF2]) al contenedor. 
        Los íconos de Lucide usan "currentColor", así que absorberán este color automáticamente */}
    <div className="w-20 h-20 mb-6 bg-[#1a2841] text-white rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-[#5EADF2]/20 transition-all duration-300">
      {icon}
    </div>

    <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
    <p className="text-gray-400 mb-8 leading-relaxed flex-grow">
      {description}
    </p>

    <a
      href="#contacto"
      className="mt-auto px-6 py-3 bg-transparent border-2 border-[#5EADF2] text-[#5EADF2] font-semibold rounded-xl hover:bg-[#5EADF2] hover:text-[#101726] transition-all duration-300 w-full"
    >
      Conocer más
    </a>
  </motion.article>
);
const Services = () => (
  // El padding superior e inferior (py-24) le da aire respecto al Hero
  <section
    id="servicios"
    className="py-24  bg-[#101726] relative z-10 scroll-mt-10"
  >
    <div className="container mx-auto px-4">
      {/* Título de la Sección */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="text-[#5EADF2] font-bold tracking-widest uppercase text-sm">
          Soluciones Integrales
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-6">
          Nuestros Servicios
        </h2>
        <div className="w-24 h-1.5 bg-[#5EADF2] mx-auto rounded-full opacity-80"></div>
      </motion.div>

      {/* Grilla de Tarjetas Orquestada */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }} // Dispara un poco antes de verlas completas
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
      >
        <ServiceItem
          icon={<Globe className=" w-10 h-10" strokeWidth={1.5} />}
          title="Desarrollo Web"
          description="Diseñamos sitios web modernos, rápidos y optimizados para destacar tu marca en internet."
        />
        <ServiceItem
          icon={<Laptop className=" w-10 h-10" strokeWidth={1.5} />}
          title="Software a Medida"
          description="Creamos sistemas de gestión, facturación e inventario adaptados exactamente a tu operativa."
        />
        <ServiceItem
          icon={<Smartphone className=" w-10 h-10" strokeWidth={1.5} />}
          title="Apps Móviles"
          description="Llevamos tu negocio al bolsillo de tus clientes con aplicaciones robustas en React Native."
        />
        <ServiceItem
          icon={<Wrench className=" w-10 h-10" strokeWidth={1.5} />}
          title="Soporte Técnico"
          description="Mantenimiento preventivo y correctivo de hardware para que tu empresa nunca se detenga."
        />
      </motion.div>
    </div>
  </section>
);

export default Services;
