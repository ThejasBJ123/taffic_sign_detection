'use server';

/**
 * @fileOverview An AI agent for detecting traffic signals, signs, and lights from a live video stream.
 *
 * - detectTrafficSignals - A function that handles the detection of traffic signals.
 * - DetectTrafficSignalsInput - The input type for the detectTrafficSignals function.
 * - DetectTrafficSignalsOutput - The return type for the detectTrafficSignals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectTrafficSignalsInputSchema = z.object({
  frameDataUri: z
    .string()
    .describe(
      "A frame from the live video stream, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  confidenceThreshold: z.number().describe('The minimum confidence threshold for detections.'),
});
export type DetectTrafficSignalsInput = z.infer<typeof DetectTrafficSignalsInputSchema>;

const DetectTrafficSignalsOutputSchema = z.object({
  detections: z.array(
    z.object({
      class: z.string().describe('The class of the detected object (e.g., STOP, RED_LIGHT).'),
      confidence: z.number().describe('The confidence score of the detection.'),
      bbox: z.array(z.number()).length(4).describe('The bounding box of the detected object [x, y, width, height].'),
    })
  ).describe('An array of detected traffic signals, signs, and lights.'),
});
export type DetectTrafficSignalsOutput = z.infer<typeof DetectTrafficSignalsOutputSchema>;

export async function detectTrafficSignals(input: DetectTrafficSignalsInput): Promise<DetectTrafficSignalsOutput> {
  return detectTrafficSignalsFlow(input);
}

const detectTrafficSignalsPrompt = ai.definePrompt({
  name: 'detectTrafficSignalsPrompt',
  input: {schema: DetectTrafficSignalsInputSchema},
  output: {schema: DetectTrafficSignalsOutputSchema},
  prompt: `You are an AI agent specializing in detecting traffic signals, signs, and lights from a live video stream.

You will receive a frame from the video stream as a data URI and a confidence threshold.

Your task is to identify and locate traffic signals, signs, and lights within the frame. Only return detections with confidence scores above the given threshold.

Return the detections as a JSON array, including the class, confidence, and bounding box for each detected object.

Frame: {{media url=frameDataUri}}
Confidence Threshold: {{{confidenceThreshold}}}

Example output:
[
  {
    "class": "STOP",
    "confidence": 0.95,
    "bbox": [100, 200, 50, 50]
  },
  {
    "class": "RED_LIGHT",
    "confidence": 0.80,
    "bbox": [300, 400, 30, 30]
  }
]`,
});

const detectTrafficSignalsFlow = ai.defineFlow(
  {
    name: 'detectTrafficSignalsFlow',
    inputSchema: DetectTrafficSignalsInputSchema,
    outputSchema: DetectTrafficSignalsOutputSchema,
  },
  async input => {
    const {output} = await detectTrafficSignalsPrompt(input);
    return output!;
  }
);
