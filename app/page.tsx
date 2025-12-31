import { FloralDecor, PaperBackground } from "@/components/FloralDecor";
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
          <FloralDecor variant="leftTop" />
          <Hero />
        </PaperBackground>
        <PaperBackground variant="section">
          <FloralDecor variant="leftMid" />
          <HowWeWork />
        </PaperBackground>
        <PaperBackground variant="section">
          <FloralDecor variant="rightBottom" />
          <Audience />
        </PaperBackground>
        <Conditions />
        <ContactCTA />
      </main>
    </div>
  );
}
