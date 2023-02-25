import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const OPENAI_KEY = process.env.OPENAI_KEY;
const config = new Configuration({
    apiKey: OPENAI_KEY,
});

export const generateComponentFromPrompt = async (prompt) => {
    console.log(config.apiKey);
    const openai = new OpenAIApi(config);
    const response = await openai.createCompletion({
        model: 'code-davinci-002',
        prompt: `/* Javascript language */\n/* Create a React component with tailwind */\n/* ${prompt} */\n/* Create any component that might be needed */\n const OurComponent = (props) => {`,
        temperature: 0.25,
        max_tokens: 750,
        frequency_penalty: 0.25,
    });

    return response.data.choices[0].text;
};
