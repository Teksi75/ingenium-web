import { Audience } from "@/components/sections/Audience";
import { Conditions } from "@/components/sections/Conditions";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { Hero } from "@/components/sections/Hero";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { Section } from "@/components/ui/Section";
import { ingeniumCopy } from "@/content/ingenium.copy";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F0EA] text-stone-800">
      <main>
        <Section>
          <Hero
            brandName={ingeniumCopy.brand.name}
            brandIntro={ingeniumCopy.brand.intro}
            title={ingeniumCopy.hero.title}
            subtitle={ingeniumCopy.hero.subtitle}
            ctaPrimary={ingeniumCopy.hero.ctaPrimary}
            ctaSecondary={ingeniumCopy.hero.ctaSecondary}
          />
        </Section>
        <HowWeWork
          title={ingeniumCopy.howWeWork.title}
          items={ingeniumCopy.howWeWork.items}
        />
        <Audience
          title={ingeniumCopy.audience.title}
          items={ingeniumCopy.audience.items}
        />
        <Conditions
          title={ingeniumCopy.conditions.title}
          bullets={ingeniumCopy.conditions.bullets}
          disclaimer={ingeniumCopy.conditions.disclaimer}
        />
        <ContactCTA
          title="Hablemos sobre tu consulta"
          body="Podés escribirnos para coordinar una entrevista y conocer la propuesta. Respondemos con información clara y personalizada."
          ctaLabel={ingeniumCopy.hero.ctaPrimary.label}
          ctaHref={ingeniumCopy.hero.ctaPrimary.href}
        />
      </main>
    </div>
  );
}
