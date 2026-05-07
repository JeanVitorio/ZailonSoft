import { useEffect, useState } from "react";

const WORDS = ["vendem mais", "convertem", "impressionam", "escalam", "geram receita"];

export const RotatingWords = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-grid align-bottom" style={{ minWidth: "8ch" }}>
      {WORDS.map((w, idx) => (
        <span
          key={w}
          aria-hidden={idx !== i}
          className="col-start-1 row-start-1 transition-all duration-700"
          style={{
            opacity: idx === i ? 1 : 0,
            transform: `translateY(${idx === i ? "0" : idx < i ? "-18px" : "18px"})`,
            filter: idx === i ? "blur(0)" : "blur(8px)",
          }}
        >
          <span className="gradient-text animate-gradient-shift bg-[linear-gradient(110deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--primary-deep)),hsl(var(--primary)))] bg-clip-text text-transparent">
            {w}
          </span>
        </span>
      ))}
    </span>
  );
};
