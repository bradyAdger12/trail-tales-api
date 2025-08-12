import { openAI, gpt4oMini } from "genkitx-openai";
import { genkit } from "genkit";

// configure a Genkit instance
export const ai = genkit({
    plugins: [
        openAI({ apiKey: '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' })
    ],
    model: gpt4oMini, // set default model
});