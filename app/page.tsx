import Audience from "@/components/sections/Audience";
import Conditions from "@/components/sections/Conditions";
import ContactCTA from "@/components/sections/ContactCTA";
import Hero from "@/components/sections/Hero";
import HowWeWork from "@/components/sections/HowWeWork";
import { FlowerDecor, PaperBackground } from "@/components/decor/SectionDecor";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-[#3f2f20]">
      <main>
        <PaperBackground variant="hero">
          <FlowerDecor position="hero-left" />
          <div className="relative z-10">
            <Hero />
          </div>
        </PaperBackground>
        <PaperBackground variant="section">
          <FlowerDecor position="section-left" />
          <div className="relative z-10">
            <HowWeWork />
          </div>
        </PaperBackground>
        <PaperBackground variant="section">
          <FlowerDecor position="section-right" />
          <div className="relative z-10">
            <Audience />
          </div>
        </PaperBackground>
        <Conditions />
        <ContactCTA />
      </main>
    </div>
  );
}
