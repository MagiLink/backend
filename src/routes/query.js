import express from 'express';
import { addComponentToDatabase, queryComponentDatabase } from '../repositories/query-logic.js';

const router = express.Router();

// TODO: Add disconnecting functionality

// https://github.com/redis/node-redis/blob/master/examples/search-knn.js
addComponentToDatabase('a', [0.02, 0.59], 'hello');
addComponentToDatabase('b', [0.03, 0.14], 'my');
addComponentToDatabase('c', [0.6, 0.4], 'name');

/**
 * @swagger
 * /query:
 *   post:
 *     summary: Use this to query the database
 *     requestBody:
 *       description: Embedded prompt corresponding to this component.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               component:
 *                 type: string
 *               score:
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
 *                       component:
 *                         type: string
 *                       score:
 *                         type: number
 */

router.post('/', async (req, res, next) => {
    console.log('Received request for query');
    const response = await queryComponentDatabase(req.body['embedding']);
    console.log('Response from query: ', response);
    res.send(response);
});

export default router;
