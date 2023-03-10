import { createClient, SchemaFieldTypes, VectorAlgorithms } from 'redis';
import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_EMBEDDING_DIM } from './constants.js';

// Configure Redis
const REDISHOST = process.env.REDIS_HOST;
const REDISPASSWORD = process.env.REDIS_PASSWORD;
const REDISPORT = process.env.REDIS_PORT;
const REDISUSER = process.env.REDIS_USER;
const REDISURL = `redis://${REDISUSER}:${REDISPASSWORD}@${REDISHOST}:${REDISPORT}`;
const client = createClient({
    url: REDISURL,
});


// Configure OpenAI
const OPENAI_KEY = process.env.OPENAI_KEY;
const config = new Configuration({
    apiKey: OPENAI_KEY,
});


const arrayToFloat32Buffer = (arr) => {
    return Buffer.from(new Float32Array(arr).buffer);
}


export const initiateQueryClient = async () => {
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


const getAllHashesFromDatabase = async () => {
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


const simpleHashing = (str) => {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}


export const addComponentToDatabase = async ({ name, prompt, embedding, component, category }) => {
    // IMPORTANT:
    // Do not call multiple instances of this function at once using Promise.all,
    // since it will assign the same id to each element. 

    const blob = arrayToFloat32Buffer(embedding);
    const id = simpleHashing(prompt + ' ' + component)

    const compInDB = await getComponentFromHash(`magilink:component:${id}$`);

    if (compInDB['name'] === undefined) {
        client.hSet(`magilink:component:${id}$`, {
            name: name,
            embedding: blob,
            prompt: prompt,
            component: component,
            category: category,
            upvotes: 0,
        });
        console.log(`Added component with name: ${name} and id ${id}`);
    } else {
        console.log('Component already in DB');
    }
}


const getComponentFromHash = async (hashKey) => {
    return { id: hashKey, ...await client.hGetAll(hashKey) };
}


export const deleteComponentWithHash = async (hashKey) => {
    client.del(hashKey);
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



export const incrementUpvoteFromHash = async (hashKey) => {
    await client.hIncrBy(hashKey, 'upvotes', 1);
}

export const decrementUpvoteFromHash = async (hashKey) => {
    await client.hIncrBy(hashKey, 'upvotes', -1);
}


export const embedPrompt = async (prompt) => {
    const openai = new OpenAIApi(config);
    const response = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: prompt,
    });

    return response.data.data[0].embedding;
};


const distToScore = (dist) => {
    const tempScore = (1 - dist/0.3);
    return tempScore < 0 ? 0 : tempScore;
}

const queryComponentDatabase = async (embedding) => {
    const blob = arrayToFloat32Buffer(embedding);
    const queryString = '*=>[KNN 4 @embedding $BLOB AS dist]'

    const results = await client.ft.search('idx:component-db', queryString, {
        PARAMS: {
            BLOB: blob
        },
        SORTBY: 'dist',
        DIALECT: 2,
        RETURN: ['dist', 'name', 'prompt', 'category', 'upvotes', 'component'],
    });


    if (results['total'] === 0) {
        return [];
    }

    const processed = results['documents'].map((item) => {
        return {
            id: item.id,
            name: item.value.name,
            score: distToScore(parseFloat(item.value.dist)),
            prompt: item.value.prompt,
            category: item.value.category,
            upvotes: parseInt(item.value.upvotes, 10) || 0,
            component: item.value.component,
            username: 'anon',
        }
    });

    return processed;
}


export const getTopComponents = async (prompt, topK) => {
    const embedding = await embedPrompt(prompt);

    console.log(`Getting top ${topK} components matching prompt: '${prompt}'...`);
    const allMatches = await queryComponentDatabase(embedding)
    console.log("Found the following prompts:");
    console.log(allMatches);

    if (allMatches.length === 0) {
        console.log("No matches found!");
        return [];
    }

    const matches = allMatches.slice(0, topK);
    return matches;
};


export const getMockComponents = async (prompt, topK) => {
    const exampleComponents = [];
    for (let i = 0; i < 100; i++) {
        exampleComponents.push(`example code nr {i+1}`);
    }

    const matches = [];
    for (let i = 0; i < topK; i++) {
        const randomIndex = Math.random() * exampleComponents.length;
        const component = exampleComponents.splice(randomIndex, 1)[0];

        const match = createSearchMatch("example prompt", component, Math.random(), 0, "anon", "...", "mock");
        matches.push(match);
    }

    return matches;
};


const createSearchMatch = async (prompt, component, score, upvotes, username, name, category) => {
    const match = {
        "prompt": prompt,
        "component": component,
        "score": score,
        "upvotes": upvotes,
        "username": username,
        "name": name,
        "category": category
    };

    return match;
};
