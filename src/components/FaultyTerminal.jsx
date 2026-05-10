import { useEffect, useRef } from "react";

export default function FaultyTerminal() {
  const canvasRef = useRef(null);

  // ==========================================
  // CONFIGURACIÓN DE COLORES (Cambia aquí)
  // ==========================================
  const theme = {
    background: "#000000", // Color del fondo
    text: "#101726", // Color de las letras normales
    highlight: "#5EADF2", // Color de los destellos (glitch)
    scanlinesOpacity: 0.3, // Opacidad de las rayas horizontales
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    let animationFrameId;

    const chars = "010189ABCDTREESF><=*#".split("");
    const fontSize = 18;
    let columns, rows, grid;

    const resizeAndInit = () => {
      const width = canvas.parentElement.offsetWidth || window.innerWidth;
      const height = canvas.parentElement.offsetHeight || window.innerHeight;

      canvas.width = width;
      canvas.height = height;

      columns = Math.floor(width / fontSize) + 1;
      rows = Math.floor(height / fontSize) + 1;
      grid = new Array(columns * rows)
        .fill(0)
        .map(() => chars[Math.floor(Math.random() * chars.length)]);

      // Usamos el color del tema
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, width, height);
    };

    window.addEventListener("resize", resizeAndInit);
    setTimeout(resizeAndInit, 100);

    const draw = () => {
      if (!grid) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const updates = Math.floor(grid.length * 0.05);
      for (let i = 0; i < updates; i++) {
        const index = Math.floor(Math.random() * grid.length);
        const x = (index % columns) * fontSize + fontSize / 2;
        const y = Math.floor(index / columns) * fontSize + fontSize / 2;

        // Limpieza con el color del tema
        ctx.fillStyle = theme.background;
        ctx.fillRect(x - fontSize / 2, y - fontSize / 2, fontSize, fontSize);

        const char = chars[Math.floor(Math.random() * chars.length)];
        grid[index] = char;

        // Colores del tema para las letras
        ctx.fillStyle = Math.random() > 0.95 ? theme.highlight : theme.text;
        ctx.fillText(char, x, y);
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeAndInit);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme.background, theme.text, theme.highlight]); // Se reinicia si cambias el tema

  return (
    <div
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ backgroundColor: theme.background }} // Sincronizado
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full opacity-80 object-cover"
      />

      {/* FILTRO 1: Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          opacity: theme.scanlinesOpacity,
          backgroundImage:
            "linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.8) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* FILTRO 2: Viñeta (Sincronizada con theme.background) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 10%, ${theme.background} 95%)`,
        }}
      />
    </div>
  );
}
