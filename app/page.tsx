import Audience from "@/components/sections/Audience";
import Conditions from "@/components/sections/Conditions";
import ContactCTA from "@/components/sections/ContactCTA";
import Hero from "@/components/sections/Hero";
import HowWeWork from "@/components/sections/HowWeWork";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F0EA] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_rgba(246,240,234,1))] text-[#3f2f20]">
      <main>
        <Hero />
        <HowWeWork />
        <Audience />
        <Conditions />
        <ContactCTA />
      </main>
    </div>
  );
}
