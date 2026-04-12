import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { LoadingExperience } from "@/components/LoadingExperience";
import { EarthJourney } from "@/components/EarthJourney";
import { HeroSection } from "@/components/HeroSection";
import { ProblemSection } from "@/components/ProblemSection";
import { WhySection } from "@/components/WhySection";
import { RevelationSection } from "@/components/RevelationSection";
import { ServicesSection } from "@/components/ServicesSection";
import { ProcessSection } from "@/components/ProcessSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { UrgencySection } from "@/components/UrgencySection";
import { GuaranteeSection } from "@/components/GuaranteeSection";
import { ExclusivitySection } from "@/components/ExclusivitySection";
import { FAQSection } from "@/components/FAQSection";
import { ClimaxSection } from "@/components/ClimaxSection";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ZailonSoft Engenharia Digital de Alta Performance" },
      { name: "description", content: "Sites, Landing Pages e Soluções Web sob medida que geram resultados reais. Atendimento exclusivo." },
      { property: "og:title", content: "ZailonSoftSS Engenharia Digital de Alta Performance" },
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
        <EarthJourney />
        <div className="relative" style={{ zIndex: 1 }}>
          <HeroSection />
          <ProblemSection />
          <WhySection />
          <RevelationSection />
          <ServicesSection />
          <ProcessSection />
          <ProjectsSection />
          <TestimonialsSection />
          <UrgencySection />
          <GuaranteeSection />
          <ExclusivitySection />
          <FAQSection />
          <ClimaxSection />

          <footer className="py-10 sm:py-14 px-4 sm:px-6 text-center relative">
            <div className="max-w-4xl mx-auto">
              <p className="text-3xl sm:text-4xl font-black text-gradient-ember mb-3">ZAILONSOFT</p>
              <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-ash-light font-semibold mb-6">
                Engenharia Digital de Alta Performance
              </p>
              <div className="h-px w-24 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, oklch(0.65 0.22 30 / 0.5), transparent)' }} />
              <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-ash">
                © {new Date().getFullYear()} ZailonSoft · Todos os direitos reservados
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
