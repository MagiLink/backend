import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const OPENAI_KEY = process.env.OPENAI_KEY;
const config = new Configuration({
    apiKey: OPENAI_KEY,
});

export const generateComponentFromPrompt = async (prompt) => {
    const openai = new OpenAIApi(config);
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: `ONLY RESPOND WITH CODE, IGNORE ANY IMPORTS AND EXPORTS AND START THE CODE WITH  \`() => {\`: Create a React component styled with the style prop using the following prompt: \`${prompt}\` Make the generated component as an anonymous arrow function that doesn't have a name so it is instantly invoked and also when using React specific functions, append 'React.' to the front. IMPLEMENT ALL FUNCTIONS, NO EMPTY FUNCTIONS.`,
            },
        ],
        temperature: 0,
        frequency_penalty: 0.25,
    });

    let returnedCode = response.data.choices[0].message.content;

    // Remove dots and newlines from the start of the code
    while (returnedCode.charAt(0) == '.' || returnedCode.charAt(0) == ',' || returnedCode.charAt(0) == '\n') {
        returnedCode = returnedCode.substring(1);
    }

    return returnedCode;
};
