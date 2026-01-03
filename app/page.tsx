import { FloralDecor, PaperBackground } from "@/components/FloralDecor";
import Audience from "@/components/sections/Audience";
import ContactCTA from "@/components/sections/ContactCTA";
import Faq from "@/components/sections/Faq";
import FamiliesSchools from "@/components/sections/FamiliesSchools";
import FloralSeparator from "@/components/sections/FloralSeparator";
import Hero from "@/components/sections/Hero";
import InitialInterview from "@/components/sections/InitialInterview";
import PedagogicalFocus from "@/components/sections/PedagogicalFocus";
import Proposals from "@/components/sections/Proposals";
import SmallGroups from "@/components/sections/SmallGroups";
import StickyNav from "@/components/sections/StickyNav";
import Technology from "@/components/sections/Technology";

export default function Home() {
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
          <Audience />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <PedagogicalFocus />
        </PaperBackground>
        <FloralSeparator />
        <PaperBackground variant="section" allowOverflow>
          <Proposals />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <SmallGroups />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <FamiliesSchools />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <Technology />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <InitialInterview />
        </PaperBackground>
        <PaperBackground variant="section" allowOverflow>
          <Faq />
        </PaperBackground>
        <ContactCTA />
      </main>
    </div>
  );
}
