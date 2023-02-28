import express from 'express';
import { getAllComponents, addComponentToDatabase, getComponentFromHash } from '../repositories/query-logic.js';
import { embedPrompt } from '../repositories/search-logic.js';

const router = express.Router();

/**
 * @swagger
 * /components:
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
 * /components/test:
 *   post:
 *     summary: Use this to add some test data to the DB
 */

router.get('/', async (req, res) => {
    const components = await getAllComponents();
    res.send(components);
});


router.post('/', async (req, res, next) => {
    const name = req.body.name;
    const prompt = req.body.prompt;
    const component = req.body.component;
    const embedding = await embedPrompt(prompt);

    const componentRequest = {
        name: name,
        prompt: prompt,
        embedding: embedding,
        component: component
    };

    try {
        await addComponentToDatabase(componentRequest);
        console.log(`Adding prompt '${prompt}'`)
        res.status(201);
        res.send('All good!')
    } catch (e) {
        res.status(500);
        res.send('Oh no!');
    }
});


router.post('/test', async (req, res) => {
    await addComponentToDatabase({ name: 'a', prompt: 'foo foo a', embedding: [0.02, 0.59], component: 'hello'}),
    await addComponentToDatabase({ name: 'b', prompt: 'bar bar b', embedding: [0.03, 0.14], component: 'my'}),
    await addComponentToDatabase({ name: 'c', prompt: 'baz baz c', embedding: [0.6, 0.4], component: 'name'}),

    res.send('OK!')
})

export default router
