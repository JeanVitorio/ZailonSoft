import { useEffect, useState } from "react";

const LINES = [
  { c: "muted", t: "// Construindo seu próximo ativo digital" },
  { c: "key",   t: "const " , v: "site", o: " = ", val: "new JVS({" },
  { c: "k",     t: "  objetivo: ", val: "'vender mais'," },
  { c: "k",     t: "  performance: ", val: "'<1s'," },
  { c: "k",     t: "  design: ", val: "'sob medida'," },
  { c: "k",     t: "  conversao: ", val: "'+312%'" },
  { c: "p",     t: "});" },
  { c: "muted", t: "" },
  { c: "ok",    t: "✓ Deploy realizado com sucesso." },
];

export const CodeWindow = () => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setShown((s) => (s < LINES.length ? s + 1 : s)), 280);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-border bg-card/85 shadow-elevated backdrop-blur-xl">
      <div
        aria-hidden
        className="absolute -inset-px -z-10 rounded-2xl opacity-60 blur-xl"
        style={{ background: "var(--gradient-orange)" }}
      />
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-[11px] font-medium text-muted-foreground">
          JVS@projeto:~ build.tsx
        </span>
      </div>
      {/* body */}
      <pre className="overflow-hidden p-5 font-mono text-[13px] leading-6 text-foreground/90">
        {LINES.slice(0, shown).map((l, idx) => (
          <div key={idx} className="whitespace-pre">
            {l.c === "muted" && <span className="text-muted-foreground">{l.t}</span>}
            {l.c === "ok" && <span className="text-[hsl(var(--success))]">{l.t}</span>}
            {l.c === "key" && (
              <>
                <span className="text-primary">{l.t}</span>
                <span className="text-foreground">{l.v}</span>
                <span className="text-muted-foreground">{l.o}</span>
                <span className="text-accent">{l.val}</span>
              </>
            )}
            {l.c === "k" && (
              <>
                <span className="text-foreground/80">{l.t}</span>
                <span className="text-accent">{l.val}</span>
              </>
            )}
            {l.c === "p" && <span className="text-muted-foreground">{l.t}</span>}
          </div>
        ))}
        {shown < LINES.length && (
          <span className="ml-0 inline-block h-4 w-2 translate-y-0.5 bg-primary animate-blink" />
        )}
      </pre>
    </div>
  );
};
