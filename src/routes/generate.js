import express from 'express';
import { generateComponentFromPrompt } from '../repositories/generate-logic.js';

const router = express.Router();

/* POST a prompt. */
router.post('/', async (req, res, next) => {
    const generated_code = await generateComponentFromPrompt(req.body.prompt);
    const result = { prompt: req.body.prompt, generated_code: generated_code };
    res.send(result);
});

export default router;
