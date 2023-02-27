import { createClient, SchemaFieldTypes, VectorAlgorithms } from 'redis';

const REDISHOST = process.env.REDIS_HOST;
const REDISPASSWORD = process.env.REDIS_PASSWORD;
const REDISPORT = process.env.REDIS_PORT;
const REDISUSER = process.env.REDIS_USER;
const REDISURL = `redis://${REDISUSER}:${REDISPASSWORD}@${REDISHOST}:${REDISPORT}`;

const client = createClient({
    url: REDISURL,
});

const OPENAI_EMBEDDING_DIM = 1536; // TODO: Ask how to make global constants
const queryString = '*=>[KNN 4 @prompt $BLOB AS dist]';

export const arrayToFloat32Buffer = (arr) => {
    return Buffer.from(new Float32Array(arr).buffer);
}

const initiateQueryClient = async () => {
    await client.connect();

    try {
        await client.ft.create(
            'idx:component-db',
            {
                prompt: {
                    type: SchemaFieldTypes.VECTOR,
                    ALGORITHM: VectorAlgorithms.HNSW, // https://www.pinecone.io/learn/hnsw/
                    TYPE: 'FLOAT32',
                    DIM: OPENAI_EMBEDDING_DIM,
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
}

export const addComponentToDatabase = async (id, embedding, component) => {

    const blob = arrayToFloat32Buffer(embedding);

    client.hSet(`magilink:component:${id}$`, {
        embedding: blob,
        component: component,
    });
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

// Should we perhaps export the init function and call it externally?
await initiateQueryClient();
