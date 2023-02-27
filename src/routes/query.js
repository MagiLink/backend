import express from 'express';
import { addComponentToDatabase,  queryComponentDatabase } from '../repositories/query-logic.js'


const router = express.Router();

// TODO: Add disconnecting functionality

// https://github.com/redis/node-redis/blob/master/examples/search-knn.js
addComponentToDatabase('a', [0.02, 0.59], "hello");
addComponentToDatabase('b', [0.03, 0.14], "my");
addComponentToDatabase('c', [0.6, 0.4], "name");

router.post('/', async (req, res, next) => {
   const response = await queryComponentDatabase(req.body['embedding']);
   console.log(response);
   res.send(response);
});


export default router;
