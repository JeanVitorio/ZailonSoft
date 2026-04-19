import { useEffect, useRef } from "react";

/**
 * SpaceField — fundo cinematográfico contínuo:
 * - Estrelas em parallax
 * - Meteoros aleatórios em trajetória curva
 * - Neblina sutil
 * Tudo renderizado em canvas para performance.
 */
export const SpaceField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    type Star = { x: number; y: number; z: number; r: number; tw: number };
    type Meteor = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      curve: number;
      size: number;
    };

    const stars: Star[] = Array.from({ length: 220 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.9 + 0.1,
      r: Math.random() * 1.4 + 0.2,
      tw: Math.random() * Math.PI * 2,
    }));

    const meteors: Meteor[] = [];
    const spawnMeteor = () => {
      const fromTop = Math.random() > 0.5;
      const startX = fromTop ? Math.random() * width : width + 40;
      const startY = fromTop ? -40 : Math.random() * height * 0.5;
      const speed = 2 + Math.random() * 3;
      meteors.push({
        x: startX,
        y: startY,
        vx: -speed * (0.6 + Math.random() * 0.6),
        vy: speed * (0.6 + Math.random() * 0.6),
        life: 0,
        maxLife: 120 + Math.random() * 80,
        curve: (Math.random() - 0.5) * 0.02,
        size: 1 + Math.random() * 2,
      });
    };

    let scrollY = 0;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let frame = 0;
    const render = () => {
      frame++;
      // trail
      ctx.fillStyle = "rgba(5, 5, 7, 0.35)";
      ctx.fillRect(0, 0, width, height);

      // nebula
      const grd = ctx.createRadialGradient(
        width * 0.7,
        height * 0.3,
        0,
        width * 0.7,
        height * 0.3,
        Math.max(width, height) * 0.6
      );
      grd.addColorStop(0, "rgba(255, 90, 54, 0.05)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      // stars (queda contínua + parallax do scroll)
      for (const s of stars) {
        s.tw += 0.02;
        const parallax = (scrollY * 0.15 * s.z) % height;
        const fallOffset = (frame * s.z * 0.6) % height;
        const y = (s.y + parallax + fallOffset) % height;
        const alpha = 0.5 + Math.sin(s.tw) * 0.5;
        ctx.beginPath();
        ctx.arc(s.x, y, s.r * s.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * s.z})`;
        ctx.fill();
      }

      // spawn meteors
      if (Math.random() < 0.018) spawnMeteor();

      // draw meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.vx += m.curve;
        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        const tailLen = 80;
        const tailX = m.x - m.vx * tailLen * 0.25;
        const tailY = m.y - m.vy * tailLen * 0.25;
        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, "rgba(255, 170, 120, 0.95)");
        grad.addColorStop(0.4, "rgba(255, 90, 54, 0.6)");
        grad.addColorStop(1, "rgba(255, 90, 54, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // head
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 220, 200, 0.9)";
        ctx.fill();

        if (m.life > m.maxLife || m.x < -100 || m.y > height + 100) {
          meteors.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
};
