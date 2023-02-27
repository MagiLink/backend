import express from 'express';
import { embedPrompt, getTopComponents } from '../repositories/search-logic.js';

const router = express.Router();

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

    const prompt = req.body["prompt"];
    const topK = req.body["top_k"];

    const embedding = await embedPrompt(prompt);
    const matches = await getTopComponents(embedding, topK);

    res.send({'matches': matches});
});


export default router;