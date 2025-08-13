'use server';
/**
 * @fileOverview Un agente de IA para responder consultas sobre alojamientos.
 *
 * - accommodationChat - El flujo principal que maneja las conversaciones.
 * - AccommodationChatInput - El tipo de entrada para el flujo.
 * - AccommodationInfo - El tipo para la información del alojamiento.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AccommodationInfoSchema = z.object({
  name: z.string().describe('El nombre del alojamiento.'),
  description: z.string().describe('Una descripción detallada del alojamiento.'),
  amenities: z.string().describe('Una lista de servicios y comodidades que ofrece.'),
  location: z.string().describe('La ubicación del alojamiento.'),
});
export type AccommodationInfo = z.infer<typeof AccommodationInfoSchema>;

const AccommodationChatInputSchema = z.object({
  accommodationInfo: AccommodationInfoSchema,
  chatHistory: z.string().describe("El historial de la conversación hasta ahora, cada turno prefijado con 'user:' o 'assistant:'."),
  query: z.string().describe('La última pregunta del usuario.'),
});
export type AccommodationChatInput = z.infer<typeof AccommodationChatInputSchema>;


export async function accommodationChat(input: AccommodationChatInput): Promise<string> {
  const result = await accommodationChatFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'accommodationChatPrompt',
  input: { schema: AccommodationChatInputSchema },
  output: { schema: z.string() },
  prompt: `Eres un asistente de inteligencia artificial para un alojamiento turístico. Tu objetivo es responder las preguntas de los potenciales huéspedes de manera amable, clara y concisa, utilizando únicamente la información proporcionada sobre el alojamiento.

NUNCA inventes información que no se te ha dado (como precios, disponibilidad, políticas específicas, etc.). Si no sabes la respuesta a una pregunta, responde amablemente que no tienes esa información y que deben consultar directamente.

Aquí está la información del alojamiento:
- Nombre: {{{accommodationInfo.name}}}
- Descripción: {{{accommodationInfo.description}}}
- Servicios: {{{accommodationInfo.amenities}}}
- Ubicación: {{{accommodationInfo.location}}}

A continuación se presenta el historial de la conversación. La última línea es la pregunta actual del usuario que debes responder.

Historial de chat:
{{{chatHistory}}}
user: {{{query}}}
assistant:`,
});

const accommodationChatFlow = ai.defineFlow(
  {
    name: 'accommodationChatFlow',
    inputSchema: AccommodationChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
