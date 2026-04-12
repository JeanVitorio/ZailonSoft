import { useEffect, useRef, useState } from 'react';

/**
 * Full-screen canvas that renders:
 * - Stars + meteors (space phase)
 * - Earth growing from tiny dot to filling the screen
 * - Atmosphere transition: blue sky, clouds, birds, tree tops
 * - Wind particles during descent
 */
export function EarthJourney() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const [, setTick] = useState(0);

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
    const stars = Array.from({ length: 250 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.7 + 0.2,
      twinkle: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    // Meteors
    interface Meteor { x: number; y: number; len: number; speed: number; opacity: number; angle: number; life: number; maxLife: number; }
    const meteors: Meteor[] = [];
    let lastMeteor = 0;

    // Clouds
    const clouds = Array.from({ length: 12 }, () => ({
      x: Math.random() * 2 - 0.5,
      y: 0.3 + Math.random() * 0.5,
      w: 0.15 + Math.random() * 0.25,
      h: 0.03 + Math.random() * 0.04,
      opacity: 0.3 + Math.random() * 0.5,
    }));

    // Birds
    const birds = Array.from({ length: 8 }, () => ({
      x: Math.random(),
      y: 0.3 + Math.random() * 0.3,
      speed: 0.0002 + Math.random() * 0.0003,
      wingPhase: Math.random() * Math.PI * 2,
      size: 3 + Math.random() * 4,
    }));

    // Wind particles
    const windParticles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 2 + Math.random() * 4,
      length: 15 + Math.random() * 30,
      opacity: 0.1 + Math.random() * 0.2,
    }));

    // Tree silhouettes
    const trees = Array.from({ length: 20 }, () => ({
      x: Math.random(),
      height: 0.05 + Math.random() * 0.1,
      width: 0.02 + Math.random() * 0.03,
      type: Math.random() > 0.5 ? 'pine' : 'round',
    }));

    const handleScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = docH > 0 ? Math.min(window.scrollY / docH, 1) : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const sp = scrollRef.current; // 0 = top (space), 1 = bottom (ground)

      // Phase calculations
      const spacePhase = Math.max(0, 1 - sp * 2.5); // stars visible 0-0.4
      const earthPhase = Math.min(1, Math.max(0, (sp - 0.05) * 2)); // earth grows 0.05-0.55
      const atmosPhase = Math.max(0, (sp - 0.4) * 2.5); // atmosphere 0.4-0.8
      const groundPhase = Math.max(0, (sp - 0.7) * 3.33); // ground details 0.7-1.0
      const windPhase = Math.max(0, (sp - 0.15) * 1.5); // wind effect starts early

      // === SKY BACKGROUND ===
      if (atmosPhase > 0) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        if (groundPhase > 0) {
          // Deeper in atmosphere
          skyGrad.addColorStop(0, `rgba(70, 130, 220, ${atmosPhase})`);
          skyGrad.addColorStop(0.4, `rgba(120, 180, 240, ${atmosPhase})`);
          skyGrad.addColorStop(0.7, `rgba(180, 220, 255, ${atmosPhase * 0.9})`);
          skyGrad.addColorStop(1, `rgba(200, 235, 255, ${atmosPhase * 0.8})`);
        } else {
          skyGrad.addColorStop(0, `rgba(10, 20, 60, ${atmosPhase * 0.5})`);
          skyGrad.addColorStop(0.5, `rgba(40, 80, 160, ${atmosPhase * 0.7})`);
          skyGrad.addColorStop(1, `rgba(80, 140, 220, ${atmosPhase})`);
        }
        ctx.fillStyle = skyGrad;
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

      // === METEORS ===
      if (spacePhase > 0.2) {
        if (time - lastMeteor > 2500 + Math.random() * 4000) {
          lastMeteor = time;
          meteors.push({
            x: Math.random() * w * 1.3, y: -20,
            len: 80 + Math.random() * 150, speed: 5 + Math.random() * 8,
            opacity: 0.5 + Math.random() * 0.5,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            life: 0, maxLife: 50 + Math.random() * 40,
          });
        }
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.life++;
          const progress = m.life / m.maxLife;
          const fade = progress < 0.1 ? progress / 0.1 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
          m.x += Math.cos(m.angle) * m.speed;
          m.y += Math.sin(m.angle) * m.speed;
          const grad = ctx.createLinearGradient(m.x, m.y, m.x - Math.cos(m.angle) * m.len, m.y - Math.sin(m.angle) * m.len);
          grad.addColorStop(0, `rgba(255, 130, 50, ${m.opacity * fade * spacePhase})`);
          grad.addColorStop(0.3, `rgba(255, 200, 150, ${m.opacity * fade * 0.5 * spacePhase})`);
          grad.addColorStop(1, 'rgba(255,200,150,0)');
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - Math.cos(m.angle) * m.len, m.y - Math.sin(m.angle) * m.len);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.stroke();
          // Head glow
          ctx.beginPath();
          ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 230, 180, ${m.opacity * fade * spacePhase})`;
          ctx.fill();
          if (m.life >= m.maxLife) meteors.splice(i, 1);
        }
      }

      // === EARTH ===
      if (earthPhase > 0 && earthPhase < 1) {
        const earthR = 30 + earthPhase * Math.max(w, h) * 1.2;
        const earthY = h * 0.85 + (1 - earthPhase) * h * 0.3;
        const earthX = w / 2;

        // Atmosphere glow
        const glowR = earthR + 20 + earthPhase * 40;
        const glowGrad = ctx.createRadialGradient(earthX, earthY, earthR, earthX, earthY, glowR);
        glowGrad.addColorStop(0, `rgba(100, 180, 255, ${0.3 * (1 - atmosPhase)})`);
        glowGrad.addColorStop(1, 'rgba(100, 180, 255, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(earthX, earthY, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Earth body
        const earthGrad = ctx.createRadialGradient(earthX - earthR * 0.3, earthY - earthR * 0.3, 0, earthX, earthY, earthR);
        earthGrad.addColorStop(0, `rgba(60, 140, 200, ${0.9 * (1 - atmosPhase * 0.8)})`);
        earthGrad.addColorStop(0.3, `rgba(30, 100, 170, ${0.9 * (1 - atmosPhase * 0.8)})`);
        earthGrad.addColorStop(0.6, `rgba(20, 80, 120, ${0.8 * (1 - atmosPhase * 0.8)})`);
        earthGrad.addColorStop(1, `rgba(5, 20, 50, ${0.9 * (1 - atmosPhase * 0.8)})`);
        ctx.beginPath();
        ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
        ctx.fillStyle = earthGrad;
        ctx.fill();

        // Land masses (abstract green patches)
        if (earthR > 60) {
          const landOpacity = Math.min(1, (earthPhase - 0.1) * 3) * (1 - atmosPhase * 0.8);
          ctx.save();
          ctx.beginPath();
          ctx.arc(earthX, earthY, earthR - 2, 0, Math.PI * 2);
          ctx.clip();
          
          const landPatches = [
            { cx: -0.2, cy: -0.2, r: 0.25 },
            { cx: 0.15, cy: 0.1, r: 0.2 },
            { cx: -0.1, cy: 0.3, r: 0.15 },
            { cx: 0.3, cy: -0.15, r: 0.12 },
          ];
          landPatches.forEach(lp => {
            ctx.beginPath();
            ctx.ellipse(earthX + lp.cx * earthR, earthY + lp.cy * earthR, lp.r * earthR, lp.r * earthR * 0.7, 0.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(40, 120, 60, ${0.5 * landOpacity})`;
            ctx.fill();
          });
          ctx.restore();
        }
      }

      // === CLOUDS ===
      if (groundPhase > 0) {
        clouds.forEach(c => {
          const cx = (c.x + time * 0.00002) % 1.5 - 0.25;
          const cy = c.y;
          const cw = c.w * w;
          const ch = c.h * h;
          const cloudOpacity = c.opacity * groundPhase;

          // Soft cloud shape using multiple overlapping ellipses
          ctx.save();
          ctx.globalAlpha = cloudOpacity;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          for (let j = 0; j < 5; j++) {
            ctx.beginPath();
            const ox = (j - 2) * cw * 0.2;
            const oy = Math.sin(j * 1.2) * ch * 0.3;
            const rw = cw * (0.3 + Math.sin(j * 0.8) * 0.1);
            const rh = ch * (0.8 + Math.cos(j) * 0.2);
            ctx.ellipse(cx * w + ox, cy * h + oy, rw, rh, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      // === BIRDS ===
      if (groundPhase > 0.3) {
        const birdOpacity = Math.min(1, (groundPhase - 0.3) * 3);
        birds.forEach(b => {
          const bx = ((b.x + time * b.speed) % 1.2) - 0.1;
          const by = b.y;
          const wing = Math.sin(time * 0.008 + b.wingPhase) * b.size;
          ctx.save();
          ctx.globalAlpha = birdOpacity * 0.6;
          ctx.strokeStyle = 'rgba(30, 30, 30, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(bx * w - b.size, by * h + wing);
          ctx.quadraticCurveTo(bx * w, by * h - Math.abs(wing) * 0.3, bx * w + b.size, by * h + wing);
          ctx.stroke();
          ctx.restore();
        });
      }

      // === TREES (bottom) ===
      if (groundPhase > 0.5) {
        const treeOpacity = Math.min(1, (groundPhase - 0.5) * 4);
        trees.forEach(t => {
          const tx = t.x * w;
          const th = t.height * h;
          const tw = t.width * w;
          const treeBottom = h;
          ctx.save();
          ctx.globalAlpha = treeOpacity * 0.7;
          
          if (t.type === 'pine') {
            // Pine tree
            ctx.fillStyle = 'rgba(20, 60, 30, 0.8)';
            ctx.beginPath();
            ctx.moveTo(tx, treeBottom - th);
            ctx.lineTo(tx - tw, treeBottom);
            ctx.lineTo(tx + tw, treeBottom);
            ctx.closePath();
            ctx.fill();
            // Trunk
            ctx.fillStyle = 'rgba(60, 40, 20, 0.6)';
            ctx.fillRect(tx - tw * 0.1, treeBottom - th * 0.15, tw * 0.2, th * 0.15);
          } else {
            // Round tree
            ctx.fillStyle = 'rgba(30, 80, 40, 0.7)';
            ctx.beginPath();
            ctx.arc(tx, treeBottom - th * 0.6, tw * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(50, 35, 15, 0.6)';
            ctx.fillRect(tx - tw * 0.12, treeBottom - th * 0.35, tw * 0.24, th * 0.35);
          }
          ctx.restore();
        });
      }

      // === WIND STREAKS ===
      if (windPhase > 0) {
        const wOpacity = Math.min(0.15, windPhase * 0.15);
        windParticles.forEach(wp => {
          wp.x += wp.speed;
          wp.y += Math.sin(time * 0.001 + wp.x * 0.01) * 0.5;
          if (wp.x > w + 50) { wp.x = -50; wp.y = Math.random() * h; }
          ctx.beginPath();
          ctx.moveTo(wp.x, wp.y);
          ctx.lineTo(wp.x - wp.length, wp.y + wp.length * 0.1);
          ctx.strokeStyle = `rgba(255, 255, 255, ${wp.opacity * wOpacity})`;
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
