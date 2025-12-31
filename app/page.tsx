import { FlowerDecor, PaperBackground } from "@/components/decor/SectionDecor";
import Audience from "@/components/sections/Audience";
import Conditions from "@/components/sections/Conditions";
import ContactCTA from "@/components/sections/ContactCTA";
import Hero from "@/components/sections/Hero";
import HowWeWork from "@/components/sections/HowWeWork";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-[var(--ingenium-ink)]">
      <main>
        <PaperBackground variant="hero">
          <FlowerDecor position="hero-left" />
          <Hero />
        </PaperBackground>
        <PaperBackground variant="section">
          <FlowerDecor position="section-left" />
          <HowWeWork />
        </PaperBackground>
        <PaperBackground variant="section">
          <FlowerDecor position="section-right" />
          <Audience />
        </PaperBackground>
        <PaperBackground variant="section">
          <FlowerDecor position="section-left" />
          <Conditions />
        </PaperBackground>
        <PaperBackground variant="section">
          <FlowerDecor position="section-top-right" />
          <ContactCTA />
        </PaperBackground>
      </main>
    </div>
  );
}
