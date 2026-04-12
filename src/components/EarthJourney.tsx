import { useEffect, useRef, useState } from 'react';
import earthImg from '@/assets/earth-space.png';
import skyImg from '@/assets/sky-clouds.png';

/**
 * Full-screen background journey:
 * - Stars in deep space (first screen)
 * - Earth appears from second screen onward, growing as you scroll
 * - Sky with clouds fades in during atmosphere phase
 * - Canvas-drawn birds and wind particles
 */
export function EarthJourney() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const earthRef = useRef<HTMLImageElement | null>(null);
  const skyRef = useRef<HTMLImageElement | null>(null);
  const scrollRef = useRef(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    const earthImage = new Image();
    earthImage.src = earthImg;
    earthImage.onload = () => { earthRef.current = earthImage; setImagesLoaded(p => p + 1); };

    const skyImage = new Image();
    skyImage.src = skyImg;
    skyImage.onload = () => { skyRef.current = skyImage; setImagesLoaded(p => p + 1); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const stars = Array.from({ length: 250 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    const birds = Array.from({ length: 15 }, () => ({
      x: Math.random(),
      y: 0.2 + Math.random() * 0.4,
      speed: 0.0002 + Math.random() * 0.0004,
      wingPhase: Math.random() * Math.PI * 2,
      size: 5 + Math.random() * 8,
    }));

    const windParticles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 2 + Math.random() * 6,
      length: 25 + Math.random() * 50,
      opacity: 0.1 + Math.random() * 0.2,
    }));

    const handleScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = docH > 0 ? Math.min(window.scrollY / docH, 1) : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const sp = scrollRef.current;

      // Earth only appears AFTER first screen (sp > ~0.08)
      const earthAppear = Math.max(0, (sp - 0.08) * 1.2);
      const spacePhase = Math.max(0, 1 - sp * 3);
      const earthScale = 0.08 + earthAppear * 2.5;
      const earthOpacity = Math.min(1, earthAppear * 3) * Math.max(0, 1 - (sp - 0.55) * 3);
      const skyPhase = Math.max(0, (sp - 0.4) * 2.5);
      const birdPhase = Math.max(0, (sp - 0.65) * 4);
      const windPhase = Math.max(0, (sp - 0.15) * 1.5);

      // === SPACE BG ===
      if (spacePhase > 0) {
        ctx.fillStyle = `rgba(2, 3, 12, ${spacePhase})`;
        ctx.fillRect(0, 0, w, h);
      }

      // === STARS ===
      if (spacePhase > 0) {
        stars.forEach(s => {
          const flicker = Math.sin(time * s.twinkle + s.phase) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * flicker * spacePhase})`;
          ctx.fill();
        });
      }

      // === EARTH IMAGE (only from 2nd screen) ===
      if (earthRef.current && earthOpacity > 0) {
        const earth = earthRef.current;
        const size = Math.min(w, h) * earthScale;
        const centerY = h * 0.65 - size / 2 + (1 - earthScale) * h * 0.3;
        const cx = w / 2 - size / 2;

        ctx.save();
        ctx.globalAlpha = Math.min(1, earthOpacity);

        // Atmospheric glow
        const glowSize = size * 1.2;
        const glowGrad = ctx.createRadialGradient(
          w / 2, h * 0.65 + (1 - earthScale) * h * 0.3, size * 0.35,
          w / 2, h * 0.65 + (1 - earthScale) * h * 0.3, glowSize * 0.6
        );
        glowGrad.addColorStop(0, `rgba(80, 160, 255, ${0.3 * earthOpacity})`);
        glowGrad.addColorStop(0.5, `rgba(60, 120, 220, ${0.1 * earthOpacity})`);
        glowGrad.addColorStop(1, 'rgba(60, 120, 220, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        // Draw earth (no clipping needed — the PNG has transparent bg)
        ctx.drawImage(earth, cx, centerY, size, size);
        ctx.restore();
      }

      // === SKY WITH CLOUDS ===
      if (skyRef.current && skyPhase > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, skyPhase);
        const sky = skyRef.current;
        const skyAspect = sky.width / sky.height;
        const canvasAspect = w / h;
        let sw = w, sh = h;
        if (canvasAspect > skyAspect) {
          sh = w / skyAspect;
        } else {
          sw = h * skyAspect;
        }
        ctx.drawImage(sky, (w - sw) / 2, (h - sh) / 2, sw, sh);
        ctx.restore();
      }

      // === BIRDS ===
      if (birdPhase > 0) {
        const bAlpha = Math.min(1, birdPhase);
        birds.forEach(b => {
          const bx = ((b.x + time * b.speed) % 1.3) - 0.15;
          const by = b.y;
          const wing = Math.sin(time * 0.006 + b.wingPhase) * b.size;
          ctx.save();
          ctx.globalAlpha = bAlpha * 0.75;
          ctx.strokeStyle = 'rgba(15, 15, 25, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(bx * w - b.size * 1.5, by * h + wing);
          ctx.quadraticCurveTo(bx * w - b.size * 0.3, by * h - Math.abs(wing) * 0.5, bx * w, by * h);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(bx * w, by * h);
          ctx.quadraticCurveTo(bx * w + b.size * 0.3, by * h - Math.abs(wing) * 0.5, bx * w + b.size * 1.5, by * h + wing);
          ctx.stroke();
          ctx.restore();
        });
      }

      // === WIND STREAKS ===
      if (windPhase > 0) {
        const wAlpha = Math.min(0.25, windPhase * 0.25);
        windParticles.forEach(wp => {
          wp.x += wp.speed;
          wp.y += Math.sin(time * 0.001 + wp.x * 0.01) * 0.3;
          if (wp.x > w + 60) { wp.x = -60; wp.y = Math.random() * h; }
          ctx.beginPath();
          ctx.moveTo(wp.x, wp.y);
          ctx.lineTo(wp.x - wp.length, wp.y + wp.length * 0.04);
          ctx.strokeStyle = `rgba(255, 255, 255, ${wp.opacity * wAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
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
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [imagesLoaded]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
