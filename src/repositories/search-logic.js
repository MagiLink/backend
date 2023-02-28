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
        const component = exampleComponents.splice(randomIndex, 1)[0];

        const match = createSearchMatch("example prompt", component, Math.random(), 0, "anon", "...", "mock");
        matches.push(match);
    }

    return matches;
}

function createSearchMatch(prompt, component, score, upvotes, username, name, category) {
    const match = {
        "prompt": prompt,
        "component": component,
        "score": score,
        "upvotes": upvotes,
        "username": username,
        "name": name,
        "category": category
    };

    return match;
}