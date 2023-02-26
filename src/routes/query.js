import express from 'express';
import { Configuration, OpenAIApi } from 'openai'
import { createClient, SchemaFieldTypes, VectorAlgorithms } from 'redis'
const OPENAI_KEY = process.env.OPENAI_KEY;
const configuration = new Configuration({
    apiKey: OPENAI_KEY,
});


const REDISHOST = 'containers-us-west-86.railway.app'
const REDISPASSWORD = 'QSWJKohcVxwUnB2bKJyr'
const REDISPORT = '6947'
const REDISUSER = 'default'


const router = express.Router();
const client = createClient({
    url: `redis://${ REDISUSER }:${ REDISPASSWORD }@${ REDISHOST }:${ REDISPORT }`
});

const EMBEDDING_DIM = 2;          // TODO: Ask how to make global constants
const queryString = '*=>[KNN 4 @v $BLOB AS dist]';

function float32Buffer(arr) {
    return Buffer.from(new Float32Array(arr).buffer);
}

// Should we perhaps export the init function and call it externally?
async function init() { 
    await client.connect();         

    try {
        await client.ft.create('idx:component-db', {
            prompt: {
                type: SchemaFieldTypes.VECTOR,
                ALGORITHM: VectorAlgorithms.HNSW,       // https://www.pinecone.io/learn/hnsw/
                TYPE: 'FLOAT32',
                DIM: EMBEDDING_DIM,
                DISTANCE_METRIC: 'COSINE'
            },
            code: SchemaFieldTypes.TEXT
        }, {
            ON: 'HASH',
            PREFIX:'magilink:component'
        });
    } catch (e) {
        if (e.message === 'Index already exists') {
            console.log('Index exists already, skipped creation.');
        } else {
            console.log(e);
        }
    }

    // Add example data to test functionality
    await Promise.all([
        client.hSet('magilink:component:a', { prompt: float32Buffer([0.1, 0.1]) }),
        client.hSet('magilink:component:b', { prompt: float32Buffer([0.1, 0.4]) }),
        client.hSet('magilink:component:c', { prompt: float32Buffer([0.1, 0.6]) }),
        client.hSet('magilink:component:d', { prompt: float32Buffer([0.1, 0.8]) })
    ]);

    
}

await init();

// TODO: Add disconnecting functionality

// https://github.com/redis/node-redis/blob/master/examples/search-knn.js

router.get('/', async (req, res, next) => {
    const results = await client.ft.search('idx:component-db', queryString, {
        PARAMS: {
         BLOB: float32Buffer(['0.1', 0.1])
        },
        SORTBY: 'dist',
        DIALECT: 2,
        RETURN: ['dist']
     });
 
     console.log(JSON.stringify(results, null, 2));
     res.send("OK");
});

router.post('/store', async (req, res, next) => {
    const prompt = req.body['code'];
    console.log(prompt);

    res.send("OK");
})

export default router;