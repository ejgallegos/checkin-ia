"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { runPrioritizeContent } from "@/app/actions";
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
  const [sectionsOrder, setSectionsOrder] = useState<SectionKey[]>(ALL_SECTIONS);
  const [loading, setLoading] = useState(true);
  const navigationHistory = useRef<string[]>([]);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const aiTriggered = useRef(false);

  const prioritizeContent = useCallback(async () => {
    if (aiTriggered.current) return;
    aiTriggered.current = true;
    
    const historyString = navigationHistory.current.join(", ");
    const newOrder = await runPrioritizeContent(historyString, ALL_SECTIONS);
    
    // Ensure the new order contains all sections to prevent breaking the page
    const isValidOrder = newOrder.length === ALL_SECTIONS.length && ALL_SECTIONS.every(sec => newOrder.includes(sec));

    if (isValidOrder) {
      setSectionsOrder(newOrder as SectionKey[]);
    } else {
      // Fallback to default order if AI returns invalid data
      aiTriggered.current = false; // allow retry
    }
  }, []);

  useEffect(() => {
    setLoading(false);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            entry.target.classList.remove("section-hidden");
            entry.target.classList.add("section-visible");
            if (!navigationHistory.current.includes(id)) {
              navigationHistory.current.push(id);
              if (navigationHistory.current.length >= 2 && !aiTriggered.current) {
                prioritizeContent();
              }
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [prioritizeContent, sectionsOrder]);

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
      {sectionsOrder.map((sectionKey) => (
        <section
          id={sectionKey}
          key={sectionKey}
          ref={(el) => (sectionRefs.current[sectionKey] = el)}
          className="section-hidden"
        >
          {sectionComponents[sectionKey]}
        </section>
      ))}
    </>
  );
}
