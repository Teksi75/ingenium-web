import { FloralDecor, PaperBackground } from "@/components/FloralDecor";
import ContactCTA from "@/components/sections/ContactCTA";
import FloralSeparator from "@/components/sections/FloralSeparator";
import Hero from "@/components/sections/Hero";
import IngeniumSectionRenderer from "@/components/sections/IngeniumSectionRenderer";
import StickyNav from "@/components/sections/StickyNav";
import { ingeniumSections } from "@/data/ingeniumSections";

export default function Home() {
  const mainSections = ingeniumSections.filter((section) => section.id !== "faq");
  const faqSection = ingeniumSections.find((section) => section.id === "faq");

  return (
    <div className="min-h-screen bg-paper text-[#3f2f20]">
      <main>
        <StickyNav />
        <PaperBackground variant="hero" allowOverflow>
          <FloralDecor variant="leftTop" />
          <Hero />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <FloralDecor variant="leftMid" />
          {mainSections.map((section) => (
            <IngeniumSectionRenderer key={section.id} section={section} />
          ))}
          {faqSection && <IngeniumSectionRenderer section={faqSection} />}
        </PaperBackground>
        <FloralSeparator />
        <ContactCTA />
      </main>
    </div>
  );
}
