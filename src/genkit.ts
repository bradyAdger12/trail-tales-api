import googleAI, { gemini20Flash } from "@genkit-ai/googleai";
import { genkit } from "genkit";

// configure a Genkit instance
export const ai = genkit({
    plugins: [
        googleAI({ apiKey: 'AIzaSyCfJcBQUv0i1OSQ6j3IJ7cnR_Gmpz6bAe4' }),
        // openAI({ apiKey: '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' })
    ],
    model: gemini20Flash, // set default model
});