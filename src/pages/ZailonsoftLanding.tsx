import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import Product from "@/components/Product";
import { Services } from "@/components/Services";
import { Process } from "@/components/Process";
import { Cases } from "@/components/Cases";
import { About } from "@/components/About";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { AuroraBackground } from "@/components/AuroraBackground";

const ZailonsoftLanding = () => {
  return (
    <main className="relative min-h-screen text-foreground">
      <AuroraBackground />
      <Navbar />
      <Hero />
      <Services />
      <Product />
      <Process />
      <Cases />
      <About />
      <FAQ />
      <FinalCTA />
      <Footer />
      <WhatsappFloat />
    </main>
  );
};

export default ZailonsoftLanding;
