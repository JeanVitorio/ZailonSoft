import { useEffect, useRef } from 'react';

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    interface Star { x: number; y: number; r: number; speed: number; opacity: number; twinkleSpeed: number; phase: number; }
    interface Meteor { x: number; y: number; length: number; speed: number; opacity: number; angle: number; life: number; maxLife: number; }

    const stars: Star[] = Array.from({ length: 200 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.15 + 0.02,
      opacity: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    const meteors: Meteor[] = [];
    let lastMeteor = 0;

    const spawnMeteor = (time: number) => {
      if (time - lastMeteor < 3000 + Math.random() * 5000) return;
      lastMeteor = time;
      meteors.push({
        x: Math.random() * w * 1.2,
        y: -20,
        length: 80 + Math.random() * 120,
        speed: 4 + Math.random() * 6,
        opacity: 0.6 + Math.random() * 0.4,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: 60 + Math.random() * 40,
      });
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      stars.forEach(s => {
        const flicker = Math.sin(time * s.twinkleSpeed + s.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * flicker})`;
        ctx.fill();
      });

      spawnMeteor(time);

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life++;
        const progress = m.life / m.maxLife;
        const fade = progress < 0.1 ? progress / 0.1 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        const dx = Math.cos(m.angle) * m.speed;
        const dy = Math.sin(m.angle) * m.speed;
        m.x += dx;
        m.y += dy;

        const grad = ctx.createLinearGradient(
          m.x, m.y,
          m.x - Math.cos(m.angle) * m.length,
          m.y - Math.sin(m.angle) * m.length
        );
        grad.addColorStop(0, `rgba(255, 120, 50, ${m.opacity * fade})`);
        grad.addColorStop(0.3, `rgba(255, 200, 150, ${m.opacity * fade * 0.6})`);
        grad.addColorStop(1, `rgba(255, 200, 150, 0)`);

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - Math.cos(m.angle) * m.length, m.y - Math.sin(m.angle) * m.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 180, ${m.opacity * fade})`;
        ctx.fill();

        if (m.life >= m.maxLife) meteors.splice(i, 1);
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
