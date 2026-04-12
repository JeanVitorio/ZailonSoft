import { useEffect, useRef, useState } from 'react';
import earthImg from '@/assets/earth-space.jpg';
import skyImg from '@/assets/sky-clouds.jpg';

/**
 * Full-screen background that uses real 4K images:
 * - Earth from space (grows as you scroll)
 * - Sky with clouds (fades in during atmosphere phase)
 * - Canvas-drawn birds and wind particles
 */
export function EarthJourney() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const earthRef = useRef<HTMLImageElement | null>(null);
  const skyRef = useRef<HTMLImageElement | null>(null);
  const scrollRef = useRef(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    // Preload images
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

    // Stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.7 + 0.2,
      twinkle: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    // Birds
    const birds = Array.from({ length: 12 }, () => ({
      x: Math.random(),
      y: 0.25 + Math.random() * 0.35,
      speed: 0.0002 + Math.random() * 0.0003,
      wingPhase: Math.random() * Math.PI * 2,
      size: 4 + Math.random() * 6,
    }));

    // Wind particles
    const windParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 2 + Math.random() * 5,
      length: 20 + Math.random() * 40,
      opacity: 0.08 + Math.random() * 0.15,
    }));

    const handleScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = docH > 0 ? Math.min(window.scrollY / docH, 1) : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const sp = scrollRef.current;

      const spacePhase = Math.max(0, 1 - sp * 3); // stars fade 0-0.33
      const earthScale = 0.15 + sp * 2.5; // Earth grows from small to huge
      const earthOpacity = Math.max(0, 1 - (sp - 0.55) * 3); // Earth fades out 0.55-0.88
      const skyPhase = Math.max(0, (sp - 0.4) * 2.5); // sky appears 0.4-0.8
      const birdPhase = Math.max(0, (sp - 0.65) * 4); // birds 0.65-0.9
      const windPhase = Math.max(0, (sp - 0.2) * 1.2);

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

      // === EARTH IMAGE ===
      if (earthRef.current && earthOpacity > 0) {
        const earth = earthRef.current;
        const size = Math.min(w, h) * earthScale;
        const cx = w / 2 - size / 2;
        const cy = h * 0.6 - size / 2 + (1 - earthScale) * h * 0.3;

        ctx.save();
        ctx.globalAlpha = Math.min(1, earthOpacity);

        // Glow behind earth
        const glowSize = size * 1.15;
        const glowGrad = ctx.createRadialGradient(w / 2, h * 0.6 + (1 - earthScale) * h * 0.3, size * 0.4, w / 2, h * 0.6 + (1 - earthScale) * h * 0.3, glowSize * 0.6);
        glowGrad.addColorStop(0, `rgba(100, 180, 255, ${0.25 * earthOpacity})`);
        glowGrad.addColorStop(1, 'rgba(100, 180, 255, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        // Draw earth as circle
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.6 + (1 - earthScale) * h * 0.3, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(earth, cx, cy, size, size);
        ctx.restore();
      }

      // === SKY WITH CLOUDS IMAGE ===
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

      // === BIRDS (canvas-drawn) ===
      if (birdPhase > 0) {
        const bAlpha = Math.min(1, birdPhase);
        birds.forEach(b => {
          const bx = ((b.x + time * b.speed) % 1.3) - 0.15;
          const by = b.y;
          const wing = Math.sin(time * 0.006 + b.wingPhase) * b.size;
          ctx.save();
          ctx.globalAlpha = bAlpha * 0.7;
          ctx.strokeStyle = 'rgba(20, 20, 30, 0.8)';
          ctx.lineWidth = 2;
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
        const wAlpha = Math.min(0.2, windPhase * 0.2);
        windParticles.forEach(wp => {
          wp.x += wp.speed;
          wp.y += Math.sin(time * 0.001 + wp.x * 0.01) * 0.3;
          if (wp.x > w + 60) { wp.x = -60; wp.y = Math.random() * h; }
          ctx.beginPath();
          ctx.moveTo(wp.x, wp.y);
          ctx.lineTo(wp.x - wp.length, wp.y + wp.length * 0.05);
          ctx.strokeStyle = `rgba(255, 255, 255, ${wp.opacity * wAlpha})`;
          ctx.lineWidth = 0.6;
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
