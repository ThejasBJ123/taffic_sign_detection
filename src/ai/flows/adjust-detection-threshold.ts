'use server';

/**
 * @fileOverview Allows the admin to adjust the confidence threshold for traffic signal detections.
 *
 * - adjustDetectionThreshold - A function that handles the adjustment of the detection threshold.
 * - AdjustDetectionThresholdInput - The input type for the adjustDetectionThreshold function.
 * - AdjustDetectionThresholdOutput - The return type for the adjustDetectionThreshold function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustDetectionThresholdInputSchema = z.object({
  threshold: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'The new confidence threshold for traffic signal detections. Must be a value between 0 and 1.'
    ),
});
export type AdjustDetectionThresholdInput = z.infer<
  typeof AdjustDetectionThresholdInputSchema
>;

const AdjustDetectionThresholdOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the threshold was successfully updated.'),
  message: z
    .string()
    .describe('A message indicating the result of the threshold adjustment.'),
});
export type AdjustDetectionThresholdOutput = z.infer<
  typeof AdjustDetectionThresholdOutputSchema
>;

export async function adjustDetectionThreshold(
  input: AdjustDetectionThresholdInput
): Promise<AdjustDetectionThresholdOutput> {
  return adjustDetectionThresholdFlow(input);
}

const adjustDetectionThresholdPrompt = ai.definePrompt({
  name: 'adjustDetectionThresholdPrompt',
  input: {schema: AdjustDetectionThresholdInputSchema},
  output: {schema: AdjustDetectionThresholdOutputSchema},
  prompt: `You are an administrator adjusting the confidence threshold for traffic signal detections.
  The current confidence threshold will be updated to the new threshold provided.

  New Threshold: {{{threshold}}}.
  Respond with a JSON object with "success" set to true and a message confirming the update of the threshold.`,
});

const adjustDetectionThresholdFlow = ai.defineFlow(
  {
    name: 'adjustDetectionThresholdFlow',
    inputSchema: AdjustDetectionThresholdInputSchema,
    outputSchema: AdjustDetectionThresholdOutputSchema,
  },
  async input => {
    const {output} = await adjustDetectionThresholdPrompt(input);
    return output!;
  }
);
