import { Link } from "react-router-dom";
import FaultyTerminal from "./FaultyTerminal";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden font-mono z-50">
      <FaultyTerminal />
      
      <div className="z-10 text-center flex flex-col items-center p-8 bg-black/60 backdrop-blur-sm border border-slate-800 rounded-xl">
        <h1 className="text-6xl md:text-8xl font-bold text-[#5EADF2] mb-2 tracking-widest animate-pulse">
          404
        </h1>
        <h2 className="text-xl md:text-3xl text-slate-300 mb-6 uppercase tracking-widest">
          Destino Desconocido
        </h2>
        <div className="w-16 h-1 bg-[#5EADF2] mb-6"></div>
        <p className="text-slate-400 mb-8 max-w-md">
          La ruta que intentas acceder no existe en nuestros registros o ha sido movida.
        </p>
        
        <Link 
          to="/"
          className="px-6 py-3 bg-transparent border border-[#5EADF2] text-[#5EADF2] hover:bg-[#5EADF2] hover:text-black transition-all duration-300 uppercase tracking-widest text-sm font-bold"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
