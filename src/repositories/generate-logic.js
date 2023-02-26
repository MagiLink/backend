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
        model: 'text-davinci-003',
        prompt: `Create a React component styled with the style prop using the following prompt: "${prompt}" Make the generated component as an anonymous arrow function that doesn't have a name so it is instantly invoked and also when using React specific functions, append 'React.' to the front.`,
        temperature: 0,
        max_tokens: 250,
        frequency_penalty: 0.25,
    });

    return response.data.choices[0].text;
};
