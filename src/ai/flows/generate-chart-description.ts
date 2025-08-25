'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a description of a chart from data.
 *
 * generateChartDescription - A function that generates a chart description.
 * GenerateChartDescriptionInput - The input type for the generateChartDescription function.
 * GenerateChartDescriptionOutput - The return type for the generateChartDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChartDescriptionInputSchema = z.object({
  data: z.string().describe('The JSON data for the chart.'),
  chartType: z.string().describe('The type of chart to be described (e.g., line, bar, pie).'),
});
export type GenerateChartDescriptionInput = z.infer<typeof GenerateChartDescriptionInputSchema>;

const GenerateChartDescriptionOutputSchema = z.object({
  description: z.string().describe('A textual description of the chart data and trends.'),
});
export type GenerateChartDescriptionOutput = z.infer<typeof GenerateChartDescriptionOutputSchema>;

export async function generateChartDescription(input: GenerateChartDescriptionInput): Promise<GenerateChartDescriptionOutput> {
  return generateChartDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChartDescriptionPrompt',
  input: {schema: GenerateChartDescriptionInputSchema},
  output: {schema: GenerateChartDescriptionOutputSchema},
  prompt: `You are an expert data analyst. Given the following data and chart type, generate a concise description of the chart, highlighting key trends and patterns.

Data: {{{data}}}
Chart Type: {{{chartType}}}

Description: `,
});

const generateChartDescriptionFlow = ai.defineFlow(
  {
    name: 'generateChartDescriptionFlow',
    inputSchema: GenerateChartDescriptionInputSchema,
    outputSchema: GenerateChartDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
