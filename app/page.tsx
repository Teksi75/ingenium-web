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
import Image from "next/image";

export default function Home() {
  return (
    <div className="site-stage min-h-screen bg-paper text-[var(--ink-800)]">
      <main className="relative z-10">
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
      <footer className="relative z-10 px-6 pb-16 pt-4">
        <div className="mx-auto flex max-w-[74rem] items-center justify-center">
          <a
            href="https://www.instagram.com/ingenium_barbaratomba?igsh=ZDhzMWhuNTdzMWp3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Ingenium"
            className="inline-flex items-center justify-center rounded-full border border-[#d5bc99] bg-white/72 p-3 text-[var(--ink-600)] shadow-[0_10px_22px_rgba(91,60,30,0.14)] transition hover:-translate-y-0.5 hover:border-[#bf8e57] hover:text-[var(--brand-copper)]"
          >
            <Image
              src="/media/ingenium/icons/instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </a>
        </div>
      </footer>
    </div>
  );
}
