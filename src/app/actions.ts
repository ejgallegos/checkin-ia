'use server';

import { prioritizeContent, type PrioritizeContentInput, type PrioritizeContentOutput } from '@/ai/flows/smart-content-prioritization';

const saasLandingPagesAnalysis = 'Successful SaaS landing pages often feature benefits and social proof (testimonials) prominently. A clear call to action and easy contact options are crucial. FAQs are typically placed lower on the page.';

export async function runPrioritizeContent(navigationHistory: string, contentSections: string[]): Promise<string[]> {
    const input: PrioritizeContentInput = {
        userNavigationHistory: navigationHistory,
        saasLandingPagesAnalysis,
        contentSections,
    };

    try {
        const result: PrioritizeContentOutput = await prioritizeContent(input);
        // Basic validation to ensure the output is usable
        if (result && Array.isArray(result.prioritizedContentSections) && result.prioritizedContentSections.length === contentSections.length) {
            return result.prioritizedContentSections;
        }
        return contentSections;
    } catch (error) {
        console.error("Error prioritizing content:", error);
        return contentSections;
    }
}
