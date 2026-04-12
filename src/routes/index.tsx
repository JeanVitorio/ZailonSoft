import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { LoadingExperience } from "@/components/LoadingExperience";
import { StarField } from "@/components/StarField";
import { SkyGradient } from "@/components/SkyGradient";
import { HeroSection } from "@/components/HeroSection";
import { ProblemSection } from "@/components/ProblemSection";
import { RevelationSection } from "@/components/RevelationSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ClimaxSection } from "@/components/ClimaxSection";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ZailonSoft — Engenharia Digital de Alta Performance" },
      { name: "description", content: "Sites, Landing Pages e Soluções Web sob medida que geram resultados reais. Atendimento exclusivo." },
      { property: "og:title", content: "ZailonSoft — Engenharia Digital de Alta Performance" },
      { property: "og:description", content: "Sites, Landing Pages e Soluções Web que convertem." },
    ],
  }),
});

function Index() {
  const [loaded, setLoaded] = useState(false);
  const handleComplete = useCallback(() => setLoaded(true), []);

  return (
    <>
      {!loaded && <LoadingExperience onComplete={handleComplete} />}

      <div className={`transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <SkyGradient />
        <StarField />
        <div className="relative scan-overlay" style={{ zIndex: 1 }}>
          <HeroSection />
          <ProblemSection />
          <RevelationSection />
          <ProjectsSection />
          <ClimaxSection />

          <footer className="py-10 sm:py-12 px-4 sm:px-6 text-center" style={{ background: 'var(--void-deep)' }}>
            <p className="text-[10px] sm:text-xs tracking-widest uppercase" style={{ color: 'var(--ash)' }}>
              © {new Date().getFullYear()} ZailonSoft · Todos os direitos reservados
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
