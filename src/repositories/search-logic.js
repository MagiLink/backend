import { Configuration, OpenAIApi } from 'openai';
import { queryComponentDatabase } from '../repositories/query-logic.js';


import dotenv from 'dotenv';
dotenv.config();
const OPENAI_KEY = process.env.OPENAI_KEY;
const config = new Configuration({
    apiKey: OPENAI_KEY,
});

// TODO: Move to query-logic.js
export const embedPrompt = async (prompt) => {
    const openai = new OpenAIApi(config);
    const response = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: prompt,
    });

    return response.data.data[0].embedding;
};

export const getTopComponents = async (prompt, topK) => {
    const embedding = await embedPrompt(prompt);

    console.log(`Getting top ${topK} components matching prompt: '${prompt}'...`);
    const allMatches = await queryComponentDatabase(embedding)
    console.log("Found the following prompts:");
    console.log(allMatches);

    if (allMatches['total'] === 0) {
        console.log("No matches found!");
        return [];
    }

    const matches = allMatches['documents'].slice(0, topK);
    return matches;
};


export const getMockComponents = async (prompt, topK) => {
    const embedding = embedPrompt(prompt);

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
};

const createSearchMatch = async (prompt, component, score, upvotes, username, name, category) => {
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
};