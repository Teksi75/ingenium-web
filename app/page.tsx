import { FloralDecor, PaperBackground } from "@/components/FloralDecor";
import FloralSeparator from "@/components/sections/FloralSeparator";
import ContactCTA from "@/components/sections/ContactCTA";
import ExamsSection from "@/components/sections/ExamsSection";
import FamiliesSection from "@/components/sections/FamiliesSection";
import FaqSection from "@/components/sections/FaqSection";
import GroupsSection from "@/components/sections/GroupsSection";
import Hero from "@/components/sections/Hero";
import InterviewSection from "@/components/sections/InterviewSection";
import PedagogicSection from "@/components/sections/PedagogicSection";
import ProposalsSection from "@/components/sections/ProposalsSection";
import StickyNav from "@/components/sections/StickyNav";
import SupportSection from "@/components/sections/SupportSection";
import TechnologySection from "@/components/sections/TechnologySection";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-[#3f2f20]">
      <main>
        <PaperBackground variant="hero" allowOverflow>
          <FloralDecor variant="leftTop" />
          <Hero />
        </PaperBackground>
        <StickyNav />
        <PaperBackground variant="section" allowOverflow>
          <FloralDecor variant="leftMid" />
          <ProposalsSection />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <FloralDecor variant="rightTop" />
          <ExamsSection />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <SupportSection />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <InterviewSection />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <PedagogicSection />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <FloralDecor variant="rightBottom" />
          <TechnologySection />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <FamiliesSection />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <GroupsSection />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <FaqSection />
        </PaperBackground>
        <FloralSeparator />
        <ContactCTA />
      </main>
      <footer className="px-6 pb-16 pt-6">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <a
            href="https://www.instagram.com/ingenium_barbaratomba?igsh=ZDhzMWhuNTdzMWp3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Ingenium"
            className="inline-flex items-center justify-center text-[#6a5743] transition hover:text-[#B88A3B]"
          >
            <img
              src="/media/ingenium/icons/instagram.svg"
              alt="Instagram"
              width="24"
              height="24"
              className="h-6 w-6"
            />
          </a>
        </div>
      </footer>
    </div>
  );
}
