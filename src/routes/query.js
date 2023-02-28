import express from 'express';
import { addComponentToDatabase,  queryComponentDatabase } from '../repositories/query-logic.js'


const router = express.Router();

// Testing route for redis database.
// Need to change DIM of redis database to 2 to test

// TODO: Add disconnecting functionality

// https://github.com/redis/node-redis/blob/master/examples/search-knn.js

router.post('/', async (req, res, next) => {
   await Promise.all([
      addComponentToDatabase('a', [0.02, 0.59], "hello"),
      addComponentToDatabase('b', [0.03, 0.14], "my"),
      addComponentToDatabase('c', [0.6, 0.4], "name"),
   ]);


   const response = await queryComponentDatabase(req.body['embedding']);
   console.log(response);
   res.send(response);
});


export default router;
