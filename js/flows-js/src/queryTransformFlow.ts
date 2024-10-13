import { defineFlow } from '@genkit-ai/flow';
import { gemini15Flash } from '@genkit-ai/vertexai';
import { defineDotprompt, promptRef } from '@genkit-ai/dotprompt'
import {QueryTransformFlowInputSchema, QueryTransformFlowOutputSchema} from './queryTransformTypes'
import { QueryTransformPromptText } from './prompts';
import { z } from 'zod';

export const QueryTransformPrompt = defineDotprompt(
  {
    name: 'queryTransformFlow',
    model: gemini15Flash,
    input: {
      schema: QueryTransformFlowInputSchema,
    },
    output: {
      format: 'json',
      schema: QueryTransformFlowOutputSchema,
    },  
  }, 
 QueryTransformPromptText
)

export const QueryTransformFlow = defineFlow(
  {
    name: 'queryTransformFlow',
    inputSchema: z.string(), //what should this be?
    outputSchema: z.string(), // what should this be?
  },
  async (input) => {
    // Missing flow invocation
        
     // Just returning hello world
     return "Hello World"
  }
);