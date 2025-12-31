import { FlowerDecor, PaperBackground } from "@/components/decor/SectionDecor";
import Audience from "@/components/sections/Audience";
import Conditions from "@/components/sections/Conditions";
import ContactCTA from "@/components/sections/ContactCTA";
import Hero from "@/components/sections/Hero";
import HowWeWork from "@/components/sections/HowWeWork";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-[#3f2f20]">
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
        <Conditions />
        <ContactCTA />
      </main>
    </div>
  );
}
