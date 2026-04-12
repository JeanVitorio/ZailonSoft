import { useEffect, useState } from 'react';

export function SkyGradient() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH > 0) {
        setScrollProgress(Math.min(window.scrollY / docH, 1));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transition from deep void to dawn sky
  const bgColor = `oklch(${0.02 + scrollProgress * 0.35} ${0.003 + scrollProgress * 0.02} ${250 - scrollProgress * 30})`;

  return (
    <div
      className="fixed inset-0 transition-colors duration-300 pointer-events-none"
      style={{ zIndex: -1, backgroundColor: bgColor }}
    />
  );
}
