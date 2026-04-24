import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import Trees_logo from "../assets/Trees_logo.webp";
import { motion } from "framer-motion";

// IDs corregidos (asegúrate de que tus etiquetas <section> tengan id="inicio", id="servicios", etc.)
const navItems = [
  { name: "Inicio", href: "/#inicio" },
  { name: "Servicios", href: "/#servicios" },
  { name: "Nosotros", href: "/#nosotros" },
  { name: "Portafolio", href: "/proyectos" },
  { name: "Clientes", href: "/#clientes" },
  { name: "Contacto", href: "/#contacto" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const location = useLocation();

  // Calculamos el índice activo leyendo la URL real
  const calculatedIndex = navItems.findIndex((item) => {
    // Si estamos en home sin ancla, marca Inicio
    if (
      location.pathname === "/" &&
      location.hash === "" &&
      item.name === "Inicio"
    )
      return true;
    // Si coincide exacto (ej. /#servicios o /proyectos)
    if (item.href === location.pathname + location.hash) return true;
    // Si coincide solo la ruta principal
    if (item.href === location.pathname) return true;
    return false;
  });

  // Si no encuentra coincidencia obvia, cae por defecto en Inicio (0)
  const activeIndex = calculatedIndex !== -1 ? calculatedIndex : 0;

  return (
    <>
      {/* Placeholder para evitar que el content salte debajo del navbar fixed */}
      <div className="h-20 w-full" />
      <nav className="fixed top-0 z-50 w-full border-b bg-[#101725] text-white backdrop-blur">
        <div className="container mx-auto flex h-20 items-center px-4">
          {/* Logo */}
          <div className="flex flex-1 items-center justify-start">
            <Link to="/#inicio" className="flex items-center gap-2 group">
              <img
                src={Trees_logo}
                alt="logo trees"
                className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex justify-center gap-2">
            {navItems.map((item, index) => {
              const isActive = index === activeIndex;
              const isHovered = index === hoveredIndex;

              return (
                <div
                  key={item.name}
                  // El div ya no tiene padding ni cursor pointer, solo actúa como contenedor relativo
                  className="relative flex items-center justify-center rounded-full"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Fondo animado al pasar el mouse */}
                  {isHovered && !isActive && (
                    <motion.div
                      layoutId="hoverBackground"
                      className="absolute inset-0 bg-white/10 rounded-full z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Fondo animado del ítem activo */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBackground"
                      className="absolute inset-0 bg-white rounded-full z-0"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}

                  {/* Fondo animado del ítem activo (alternativas sin animacion jodete lauta XD)
                {isActive && (
                  <motion.div
                    key={`active-${index}`}  // key único por índice, no layoutId compartido
                    className="absolute inset-0 bg-white rounded-full z-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                  />
                )} */}

                  <Link
                    to={item.href}
                    className={`relative z-10 px-4 py-2 block text-sm font-bold transition-colors duration-300 ${
                      isActive
                        ? "text-[#101726]"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Mobile Menu (Sheet) */}
          <div className="flex flex-1 items-center justify-end">
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[250px] bg-[#101725] text-white"
                >
                  <div className="flex flex-col gap-4 mt-8 ml-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-semibold"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
