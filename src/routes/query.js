import express from 'express';
import { addComponentToDatabase,  queryComponentDatabase } from '../repositories/query-logic.js'


const router = express.Router();

// TODO: Add disconnecting functionality

// https://github.com/redis/node-redis/blob/master/examples/search-knn.js

router.get('/', async (req, res, next) => {
    /*
    const results = await client.ft.search('idx:component-db', queryString, {
        PARAMS: {
            BLOB: float32Buffer(['0.1', 0.1]),
        },
        SORTBY: 'dist',
        DIALECT: 2,
        RETURN: ['dist'],
    });

    console.log(results);
    res.send(results);
});
*/

/*

    // Add example data to test functionality
    await Promise.all([
        client.hSet('magilink:component:a', { prompt: arrayToFloat32Buffer([0.1, 0.2]) }),
        client.hSet('magilink:component:b', { prompt: arrayToFloat32Buffer([0.1, 0.4]) }),
        client.hSet('magilink:component:c', { prompt: arrayToFloat32Buffer([0.1, 0.1]) }),
        client.hSet('magilink:component:d', { prompt: arrayToFloat32Buffer([0.1, 0.8]) }),
    ]);
    */




export default router;
