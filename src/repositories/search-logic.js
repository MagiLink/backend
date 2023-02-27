import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const OPENAI_KEY = process.env.OPENAI_KEY;
const config = new Configuration({
    apiKey: OPENAI_KEY,
});

export const embedPrompt = async (prompt) => {
    const openai = new OpenAIApi(config);
    const response = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: prompt,
    });

    return response.data.data[0].embedding;
};

export const getTopComponents = async (prompt, topK) => {
    // TODO: Implement query logic here.
    // TODO: integrate with Redis vector similarity search

    return getMockComponents(prompt, topK)
}


function getMockComponents(prompt, topK) {
    const exampleComponents = [];
    for (let i = 0; i < 100; i++) {
        exampleComponents.push(`example code nr {i+1}`);
    }

    const matches = [];
    for (let i = 0; i < topK; i++) {
        const randomIndex = Math.random() * exampleComponents.length;
        const component = exampleComponents.splice(randomIndex, 1);

        const match = {
            "prompt": "example prompt",
            "component": component,
            "score": Math.random()
        };

        matches.push(match);
    }

    return matches;
}