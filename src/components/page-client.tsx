"use client";

import { useState, useEffect, useRef } from "react";
import { BenefitsSection } from "@/components/sections/benefits";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { FaqSection } from "@/components/sections/faq";
import { ContactSection } from "@/components/sections/contact";
import { Skeleton } from "./ui/skeleton";

type SectionKey = "benefits" | "testimonials" | "faq" | "contact";

const sectionComponents: Record<SectionKey, React.ReactNode> = {
  benefits: <BenefitsSection />,
  testimonials: <TestimonialsSection />,
  faq: <FaqSection />,
  contact: <ContactSection />,
};

const ALL_SECTIONS: SectionKey[] = ["benefits", "testimonials", "faq", "contact"];

export function PageClient() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container max-w-7xl py-12 space-y-12">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
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
  );
}
