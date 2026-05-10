import React, { useState } from "react";
// import { supabase } from "../../supabase"; // DESCOMENTA CUANDO SUPABASE ESTÉ LISTO
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El formato del correo electrónico es inválido.";
      isValid = false;
    }

    if (!message.trim()) {
      newErrors.message = "El mensaje es obligatorio.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setStatus("");

    try {
      // Simulación de envío (Reemplazar por Supabase)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      /*
      // Guardar en Supabase como Cliente (Lead)
      const { error: errInsert } = await supabase.from("clientes").insert([{
        nombre: name,
        email: email,
        direccion: `MENSAJE WEB: ${message}`,
        dni_cuit: 'LEAD',
        tipo: 'lead'
      }]);

      if (errInsert) throw errInsert;
      */

      setStatus("✅ ¡Gracias! Hemos recibido tu mensaje y nos contactaremos pronto.");
      setName("");
      setEmail("");
      setMessage("");
      setErrors({});
    } catch (error) {
      console.error("Error al guardar lead:", error);
      setStatus("❌ Hubo un problema al enviar tu mensaje. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <input
          type="text"
          placeholder="Tu Nombre"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: null })); }}
          className={`w-full p-4 rounded-xl bg-[#101726]/50 text-white border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#5EADF2]/20 focus:bg-[#101726] ${errors.name ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
            }`}
        />
        {errors.name && <p className="text-red-400 text-sm ml-2">{errors.name}</p>}
      </div>

      <div className="space-y-1">
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })); }}
          className={`w-full p-4 rounded-xl bg-[#101726]/50 text-white border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#5EADF2]/20 focus:bg-[#101726] ${errors.email ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
            }`}
        />
        {errors.email && <p className="text-red-400 text-sm ml-2">{errors.email}</p>}
      </div>

      <div className="space-y-1">
        <textarea
          placeholder="¿En qué te podemos ayudar?"
          rows="5"
          value={message}
          onChange={(e) => { setMessage(e.target.value); setErrors(prev => ({ ...prev, message: null })); }}
          className={`w-full p-4 rounded-xl bg-[#101726]/50 text-white border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#5EADF2]/20 focus:bg-[#101726] resize-none ${errors.message ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
            }`}
        />
        {errors.message && <p className="text-red-400 text-sm ml-2">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full group flex items-center justify-center gap-2 text-[#101726] font-bold px-6 py-4 rounded-xl transition-all duration-300 ${loading
            ? "bg-slate-600 cursor-not-allowed"
            : "bg-[#5EADF2] hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(94,173,242,0.4)]"
          }`}
      >
        {loading ? (
          <div className="h-5 w-5 rounded-full border-2 border-[#101726] border-t-transparent animate-spin" />
        ) : (
          <>
            Enviar Mensaje
            <Send size={18} className="transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </>
        )}
      </button>

      {status && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm p-4 rounded-xl border font-medium text-center ${status.includes("✅")
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : status.includes("❌")
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
            }`}
        >
          {status}
        </motion.p>
      )}
    </form>
  );
};

const ContactInfo = () => {
  return (
    <div className="flex flex-col justify-center h-full space-y-8 md:pl-12 mt-12 md:mt-0">
      <div>
        <span className="text-[#5EADF2] font-bold tracking-widest uppercase text-sm mb-2 block">
          Conversemos
        </span>
        <h3 className="text-3xl font-bold text-white mb-6">
          Contacta con Nuestro Equipo
        </h3>
        <p className="text-slate-400 leading-relaxed max-w-md">
          ¿Tienes un proyecto en mente o necesitas escalar tu negocio actual?
          Hablemos para encontrar la solución perfecta.
        </p>
      </div>

      <div className="space-y-6 pt-4">
        <a href="mailto:trees.sanjuan@gmail.com" className="group flex items-center gap-4 text-slate-300 hover:text-white transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#5EADF2] group-hover:border-[#5EADF2] group-hover:text-[#101726] transition-all duration-300">
            <Mail size={20} />
          </div>
          <span className="font-medium text-lg">trees.sanjuan@gmail.com</span>
        </a>

        <a href="tel:+542645851326" className="group flex items-center gap-4 text-slate-300 hover:text-white transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#5EADF2] group-hover:border-[#5EADF2] group-hover:text-[#101726] transition-all duration-300">
            <Phone size={20} />
          </div>
          <span className="font-medium text-lg">+54 2645851326</span>
        </a>

        <div className="group flex items-center gap-4 text-slate-300 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#5EADF2]/20 group-hover:text-[#5EADF2] transition-all duration-300">
            <MapPin size={20} />
          </div>
          <span className="font-medium text-lg">Los Tilos 1664 N, San Juan, Capital.</span>
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  return (
    <section id="contacto" className="py-24 bg-[#101726] relative z-10 scroll-mt-10 overflow-hidden">
      {/* Fondo y Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5EADF2]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:hidden"
        >
          <span className="text-[#5EADF2] font-bold tracking-widest uppercase text-sm">Contáctanos</span>
          <h2 className="text-4xl font-black text-white mt-2 mb-6">Ponte en Contacto</h2>
          <div className="w-24 h-1.5 bg-[#5EADF2] mx-auto rounded-full opacity-80" />
        </motion.div>

        <div className="flex flex-col md:flex-row max-w-6xl mx-auto rounded-[3rem] p-6 lg:p-12">
          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-[55%] relative"
          >
            <div className="absolute inset-0 bg-[#5EADF2]/10 blur-3xl rounded-[3rem] -z-10" />
            <div className="bg-[#162032]/80 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <ContactForm />
            </div>
          </motion.div>

          {/* Información */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-[45%]"
          >
            <ContactInfo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
