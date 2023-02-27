import express from 'express';
import { createClient, SchemaFieldTypes, VectorAlgorithms } from 'redis';

const REDISHOST = process.env.REDIS_HOST;
const REDISPASSWORD = process.env.REDIS_PASSWORD;
const REDISPORT = process.env.REDIS_PORT;
const REDISUSER = process.env.REDIS_USER;
const REDISURL = `redis://${REDISUSER}:${REDISPASSWORD}@${REDISHOST}:${REDISPORT}`;

const router = express.Router();
const client = createClient({
    url: REDISURL,
});

const EMBEDDING_DIM = 2; // TODO: Ask how to make global constants
const queryString = '*=>[KNN 4 @prompt $BLOB AS dist]';

function float32Buffer(arr) {
    return Buffer.from(new Float32Array(arr).buffer);
}

// Should we perhaps export the init function and call it externally?
async function init() {
    await client.connect();

    try {
        await client.ft.create(
            'idx:component-db',
            {
                prompt: {
                    type: SchemaFieldTypes.VECTOR,
                    ALGORITHM: VectorAlgorithms.HNSW, // https://www.pinecone.io/learn/hnsw/
                    TYPE: 'FLOAT32',
                    DIM: EMBEDDING_DIM,
                    DISTANCE_METRIC: 'COSINE',
                },
                code: SchemaFieldTypes.TEXT,
            },
            {
                ON: 'HASH',
                PREFIX: 'magilink:component',
            },
        );
    } catch (e) {
        if (e.message === 'Index already exists') {
            console.log('Index exists already, skipped creation.');
        } else {
            console.log(e);
        }
    }

    // Add example data to test functionality
    await Promise.all([
        client.hSet('magilink:component:a', { prompt: float32Buffer([0.1, 0.2]) }),
        client.hSet('magilink:component:b', { prompt: float32Buffer([0.1, 0.4]) }),
        client.hSet('magilink:component:c', { prompt: float32Buffer([0.1, 0.1]) }),
        client.hSet('magilink:component:d', { prompt: float32Buffer([0.1, 0.8]) }),
    ]);
}

await init();

// TODO: Add disconnecting functionality

// https://github.com/redis/node-redis/blob/master/examples/search-knn.js

router.get('/', async (req, res, next) => {
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


export default router;
