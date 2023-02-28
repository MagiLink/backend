import { createClient, SchemaFieldTypes, VectorAlgorithms } from 'redis';
import { OPENAI_EMBEDDING_DIM } from './constants.js';

const REDISHOST = process.env.REDIS_HOST;
const REDISPASSWORD = process.env.REDIS_PASSWORD;
const REDISPORT = process.env.REDIS_PORT;
const REDISUSER = process.env.REDIS_USER;
const REDISURL = `redis://${REDISUSER}:${REDISPASSWORD}@${REDISHOST}:${REDISPORT}`;

const client = createClient({
    url: REDISURL,
});

const queryString = '*=>[KNN 4 @embedding $BLOB AS dist]';

export const arrayToFloat32Buffer = (arr) => {
    return Buffer.from(new Float32Array(arr).buffer);
}

const initiateQueryClient = async () => {
    await client.connect();

    try {
        await client.ft.create(
            'idx:component-db',
            {
                embedding: {
                    type: SchemaFieldTypes.VECTOR,
                    ALGORITHM: VectorAlgorithms.HNSW, // https://www.pinecone.io/learn/hnsw/
                    TYPE: 'FLOAT32',
                    DIM: OPENAI_EMBEDDING_DIM,
                    DISTANCE_METRIC: 'COSINE',
                },
                component: SchemaFieldTypes.TEXT,
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
}

export const getAllHashesFromDatabase = async () => {
    // https://redis.io/commands/scan/

    const allHashes = [];
    let cursor = 0;

    do {
        const hashes = await client.scan(cursor, {TYPE: 'hash'});
        allHashes.push(...hashes['keys']);
        cursor = hashes['cursor'];
    } while (cursor != 0);

    return allHashes;
}

export const addComponentToDatabase = async ({ name, prompt, embedding, component }) => {
    // IMPORTANT:
    // Do not call multiple instances of this function at once using Promise.all,
    // since it will assign the same id to each element. 

    //const hashes = await client.scan(0, {TYPE: 'hash'});
    const hashes = await getAllHashesFromDatabase();
    const numHashes = hashes.length;
    const blob = arrayToFloat32Buffer(embedding);
    const id = numHashes;

    client.hSet(`magilink:component:${numHashes}$`, {
        name: name,
        embedding: blob,
        prompt: prompt,
        component: component,
    });
    console.log(`Added component with name: ${name} and id ${id}`);
}

export const queryComponentDatabase = async (embedding) => {

    const blob = arrayToFloat32Buffer(embedding);

    const results = await client.ft.search('idx:component-db', queryString, {
        PARAMS: {
            BLOB: blob
        },
        SORTBY: 'dist',
        DIALECT: 2,
        RETURN: ['dist'],
    });

    return results;
}


export const getComponentFromHash = async (hashKey) => {
    return { id: hashKey, ...await client.hGetAll(hashKey) };
}


export const getAllComponents = async () => {
    const hashes = await getAllHashesFromDatabase();

    const results = [];
    await Promise.all(hashes.map(async (hashKey) => {
        const value = await getComponentFromHash(hashKey)
        results.push(value)
    }));

    return results
}

// Should we perhaps export the init function and call it externally?
await initiateQueryClient();
