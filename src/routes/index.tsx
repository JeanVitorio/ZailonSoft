import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { LoadingExperience } from "@/components/LoadingExperience";
import { StarField } from "@/components/StarField";
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
      { name: "description", content: "Transformamos presença digital em máquinas de conversão. Resultados reais, não sites bonitos." },
      { property: "og:title", content: "ZailonSoft — Engenharia Digital de Alta Performance" },
      { property: "og:description", content: "Transformamos presença digital em máquinas de conversão." },
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
        <StarField />
        <div className="relative scan-overlay" style={{ zIndex: 1 }}>
          <HeroSection />
          <ProblemSection />
          <RevelationSection />
          <ProjectsSection />
          <ClimaxSection />

          {/* Footer */}
          <footer className="py-12 px-6 text-center" style={{ background: 'var(--void-deep)' }}>
            <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--ash)' }}>
              © {new Date().getFullYear()} ZailonSoft · Todos os direitos reservados
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
