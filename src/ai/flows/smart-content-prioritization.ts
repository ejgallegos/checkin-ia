'use server';

/**
 * @fileOverview A flow to dynamically order landing page content based on user navigation history and analysis of successful SaaS landing pages.
 *
 * - prioritizeContent - A function that prioritizes the landing page content.
 * - PrioritizeContentInput - The input type for the prioritizeContent function.
 * - PrioritizeContentOutput - The return type for the prioritizeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeContentInputSchema = z.object({
  userNavigationHistory: z
    .string()
    .describe('The user navigation history on the landing page.'),
  saasLandingPagesAnalysis: z
    .string()
    .describe('The content analysis of successful SaaS landing pages.'),
  contentSections: z
    .array(z.string())
    .describe('The content sections of the landing page.'),
});
export type PrioritizeContentInput = z.infer<typeof PrioritizeContentInputSchema>;

const PrioritizeContentOutputSchema = z.object({
  prioritizedContentSections: z
    .array(z.string())
    .describe('The prioritized content sections of the landing page.'),
});
export type PrioritizeContentOutput = z.infer<typeof PrioritizeContentOutputSchema>;

export async function prioritizeContent(input: PrioritizeContentInput): Promise<PrioritizeContentOutput> {
  return prioritizeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeContentPrompt',
  input: {schema: PrioritizeContentInputSchema},
  output: {schema: PrioritizeContentOutputSchema},
  prompt: `You are an AI expert in optimizing landing page content for SaaS products.

  Given the user's navigation history, an analysis of successful SaaS landing pages, and the available content sections on this landing page, determine the optimal order of the content sections to maximize the likelihood of user registration or demo booking.

  User Navigation History: {{{userNavigationHistory}}}
  Successful SaaS Landing Pages Analysis: {{{saasLandingPagesAnalysis}}}
  Content Sections: {{#each contentSections}}{{{this}}}, {{/each}}

  Prioritized Content Sections (in optimal order):
  `,
});

const prioritizeContentFlow = ai.defineFlow(
  {
    name: 'prioritizeContentFlow',
    inputSchema: PrioritizeContentInputSchema,
    outputSchema: PrioritizeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
