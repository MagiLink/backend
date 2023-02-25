import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
});

export const generateComponentFromPrompt = async (prompt) => {
    console.log(configuration.apiKey);
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        model: 'code-davinci-002',
        prompt: `/* Javascript language */\n/* Create a React component with tailwind */\n/* ${prompt} */\n/* Create any component that might be needed */\n const OurComponent = (props) => {`,
        temperature: 0.25,
        max_tokens: 750,
        frequency_penalty: 0.25,
    });

    return response.data.choices[0].text;
};
