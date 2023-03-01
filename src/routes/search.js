import express from 'express';
import { getMockComponents, getTopComponents } from '../repositories/library-logic.js';

const router = express.Router();

/**
 * @swagger
 * /search:
 *   post:
 *     summary: Use this to search for components.
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
 *               top_k:
 *                 type: number
 *     responses:
 *       '200':
 *         description: A list of component-score pairs, sorted by score.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       embedding:
 *                         type: array
 *                         items:
 *                           type: number
 *                       component:
 *                         type: string
 *                       score:
 *                         type: number
 */

router.post('/', async (req, res, next) => {
    /*
     *  Expects JSON packet with following:
     *      "prompt": Raw string representing a search.
     *      "top_k": Expected number of returned component-score pairs, sorted by score.
     *
     *  Returns a sorted list of JSON packets containing:
     *      "embedding": Embedded prompt corresponding to this compoment.
     *      "component": Text string containing JavaScript code matching the prompt.
     *      "score": Number representing how closely this prompt matches the given one.
     */

    const prompt = req.body['prompt'];
    const topK = req.body['top_k'];

    const matches = await getTopComponents(prompt, topK);

    res.send({ matches: matches });
});

router.post('/mock', async (req, res, next) => {
    const prompt = req.body['prompt'];
    const topK = req.body['top_k'];

    const matches = await getMockComponents(prompt, topK);

    res.send({ matches: matches });
})

export default router;
