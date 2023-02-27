import express from 'express';
import { convertSearchToVector } from '../repositories/search-logic.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
    const searchString = req.body.search

    // We get a high dimensional representation of our search string
    const searchVector = await convertSearchToVector(searchString);


    // TODO: integrate with Redis vector similarity search

    res.send('Blocked until Redis is ready!')
});

export default router;