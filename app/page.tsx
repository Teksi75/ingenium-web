import Audience from "@/components/sections/Audience";
import Conditions from "@/components/sections/Conditions";
import ContactCTA from "@/components/sections/ContactCTA";
import Hero from "@/components/sections/Hero";
import HowWeWork from "@/components/sections/HowWeWork";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F0EA] text-[#3f2f20]">
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
