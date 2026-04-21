import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#101725] border-t border-white/5 py-8 mt-auto relative z-50">
      <div className="container mx-auto px-4">
        <p className="text-slate-400 text-sm md:text-base font-medium text-center">
          &copy; 2026 <span className="text-[#5EADF2] font-bold tracking-wider">Trees Tech</span>. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
