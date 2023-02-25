import express from 'express';
import { generateComponentFromPrompt } from '../repositories/generate-logic.js';

const router = express.Router();

/* POST a prompt. */
router.post('/', (req, res, next) => {
    const result = generateComponentFromPrompt(req.body.prompt);
    res.send(JSON.parse({ result: result }));
});

export default router;
