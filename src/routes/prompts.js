import express from 'express';
import { Configuration, OpenAIApi } from 'openai';
const OPENAI_KEY = process.env.OPENAI_KEY;
const configuration = new Configuration({
    apiKey: OPENAI_KEY,
});

export const router = express.Router();

/* GET prompts */
router.get('/', async (req, res, next) => {
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        model: 'code-davinci-002',
        prompt: '/* Javascript language */\n/* Create a React component with tailwind */\n/* Big circular button that opens a modal with a text field */\n/* Create any component that might be needed */\n const OurComponent = (props) => {',
        temperature: 0.25,
        max_tokens: 750,
        frequency_penalty: 0.25,
    });

    res.send(response.data.choices[0].text);
});

export default router;
