import express from 'express';
import {
    getAllComponents,
    addComponentToDatabase,
    incrementUpvoteFromHash,
    decrementUpvoteFromHash,
    embedPrompt,
    getMockComponents,
    getTopComponents,
    deleteComponentWithHash,
 } from '../repositories/library-logic.js';

const router = express.Router();

/**
 * @swagger
 * /library:
 *   get:
 *     summary: Use this to get all of the components saved in the DB.
 *   post:
 *     summary: Use this to save a component to the DB.
 *     requestBody:
 *       description: A JSON object of the component to be saved
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               prompt:
 *                 type: string
 *               component:
 *                 type: string
 *     responses:
 *       '201':
 *         description: "All good!"
 *       '500':
 *         description: Something went wrong with creating the object in the DB
 * /library/:id:
 *   delete:
 *     summary: Delete component with id
 * /library/test:
 *   post:
 *     summary: Use this to add some test data to the DB
 */

router.get('/', async (req, res, next) => {
    const components = await getAllComponents();
    res.send(components);
});

router.post('/', async (req, res, next) => {
    try {
        const name = req.body.name;
        const prompt = req.body.prompt;
        const component = req.body.component;
        const embedding = await embedPrompt(prompt);
        const category = req.body.category

        const componentRequest = {
            name: name,
            prompt: prompt,
            embedding: embedding,
            component: component,
            category: category,
        };
        await addComponentToDatabase(componentRequest);
        console.log(`Adding prompt '${prompt}'`);
        res.status(201);
        res.send('All good!');
    } catch (e) {
        next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    const hashId = req.params.id;
    try {
        await deleteComponentWithHash(hashId);
        res.send('Component deleted!')
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /library/{id}/upvote:
 *   post:
 *     summary: Use this to upvote a component.
 *     responses:
 *       '200':
 *         description: 'component: {hashId} upvoted'
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             prompt:
 *               type: string
 *             component:
 *               type: string
 *       '500':
 *         description: 'error: something went wrong'
 */

router.post(':id/upvote', async (req, res, next) => {
    const hashId = req.params.id;

    try {
        await incrementUpvoteFromHash(hashId);
        console.log('everything should be good');
        res.status(200);
        res.send(`component: ${hashId} down voted`);
    } catch (e) {
        next(e)
    }
});

/**
 * @swagger
 * /library/{id}/downvote:
 *   post:
 *     summary: Use this to downvote a component.
 *     responses:
 *       '200':
 *         description: 'component: {hashId} downvoted'
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             prompt:
 *               type: string
 *             component:
 *               type: string
 *       '500':
 *         description: 'error: something went wrong'
 */

router.post(':id/downvote', async (req, res, next) => {
    const hashId = req.params.id;

    try {
        await decrementUpvoteFromHash(hashId);
        console.log('everything should be good');
        res.status(200);
        res.send(`component: ${hashId} down voted`);
    } catch (e) {
        next(e);
    }
});

router.post('/test', async (req, res, next) => {
    try {
        await addComponentToDatabase({ name: 'a', prompt: 'foo foo a', embedding: [0.02, 0.59], component: 'hello', category: 'foo' }),
        await addComponentToDatabase({ name: 'b', prompt: 'bar bar b', embedding: [0.03, 0.14], component: 'my', category: 'foo' }),
        await addComponentToDatabase({ name: 'c', prompt: 'baz baz c', embedding: [0.6, 0.4], component: 'name', category: 'foo' }),
        res.send('OK!');
    } catch (e) {
        next(e);
    }
});



/**
 * @swagger
 * /library/search:
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

router.post('/search', async (req, res, next) => {
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

    try {
        const matches = await getTopComponents(prompt, topK);
        res.send({ matches: matches });
    } catch (e) {
        next(e);
    }
});

router.post('/search/mock', async (req, res, next) => {
    const prompt = req.body['prompt'];
    const topK = req.body['top_k'];

    try {
        const matches = await getMockComponents(prompt, topK);
        res.send({ matches: matches });
    } catch (e) {
        next(e);
    }
})

export default router;
