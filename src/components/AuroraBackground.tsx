// Global animated background — aurora orbs + drifting grid + noise
export const AuroraBackground = () => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0 bg-background" />

      {/* drifting grid */}
      <div
        className="absolute inset-0 opacity-[0.18] animate-grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border) / 0.55) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.55) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 80%)",
        }}
      />

      {/* aurora orbs */}
      <div className="absolute -top-40 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px] animate-aurora-1" />
      <div className="absolute top-1/3 -left-40 h-[520px] w-[720px] rounded-full bg-accent/20 blur-[140px] animate-aurora-2" />
      <div className="absolute bottom-0 -right-40 h-[560px] w-[800px] rounded-full bg-primary-deep/25 blur-[140px] animate-aurora-3" />

      {/* subtle noise */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] mix-blend-overlay" />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,hsl(var(--background))_100%)]" />
    </div>
  );
};
