import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/sections/hero';
import { BenefitsSection } from "@/components/sections/benefits";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { FaqSection } from "@/components/sections/faq";
import { DemoSection } from "@/components/sections/demo";

type SectionKey = "benefits" | "testimonials" | "faq" | "demo";

const sectionComponents: Record<SectionKey, React.ReactNode> = {
  benefits: <BenefitsSection />,
  testimonials: <TestimonialsSection />,
  faq: <FaqSection />,
  demo: <DemoSection />,
};

const ALL_SECTIONS: SectionKey[] = ["benefits", "testimonials", "faq", "demo"];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <>
          {ALL_SECTIONS.map((sectionKey) => (
            <section
              id={sectionKey}
              key={sectionKey}
              className="animate-fade-in"
            >
              {sectionComponents[sectionKey]}
            </section>
          ))}
        </>
      </main>
      <Footer />
    </div>
  );
}
