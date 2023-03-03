import express from 'express';
import { generateComponentFromPrompt } from '../repositories/generate-logic.js';

const router = express.Router();

/**
 * @swagger
 * /generate:
 *   post:
 *     summary: Use this to generate a component from a prompt.
 *     requestBody:
 *       description: Embedded prompt corresponding to this component.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       '200':
 *         description: An object containing the prompt and generated component.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prompt:
 *                   type: string
 *                 component:
 *                   type: string
 */

router.post('/', async (req, res, next) => {
    try {
        const generated_code = await generateComponentFromPrompt(req.body.prompt);
        const result = { prompt: req.body.prompt, component: generated_code };
        res.send(result);
    } catch (e) {
        next(e);
    }
});

export default router;
