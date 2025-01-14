import { defineFlow } from '@genkit-ai/flow';
import { gemini15Flash } from '@genkit-ai/vertexai';
import { defineDotprompt } from '@genkit-ai/dotprompt'
import {MovieFlowInputSchema, MovieFlowOutputSchema} from './movieFlowTypes'
import { MovieFlowPromptText } from './prompts';

export const MovieFlowPrompt = defineDotprompt(
    {
      name: 'movieFlow',
      model: gemini15Flash,
      input: {
        schema: MovieFlowInputSchema,
      },
      output: {
        format: 'json',
        schema: MovieFlowOutputSchema,
      },  
    }, 
   MovieFlowPromptText
)
  export const MovieFlow = defineFlow(
    {
      name: 'movieQAFlow',
      inputSchema: MovieFlowInputSchema,
      outputSchema: MovieFlowOutputSchema
    },
    async (input) => {
      try {
        const response = await MovieFlowPrompt.generate({ input: input });
        console.log(response.output(0))
        return response.output(0);
      } catch (error) {
        console.error("Error generating response:", error);
        return { 
          relevantMovies: [],
          answer: "",
          justification: ""
         }; 
      }
    }
  );
  