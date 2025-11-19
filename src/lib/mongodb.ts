import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | undefined;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

export const getClient = async (): Promise<MongoClient> => {
  if (process.env.NODE_ENV === 'development') {
    if (!globalThis._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalThis._mongoClientPromise = client.connect();
    }
    return globalThis._mongoClientPromise;
  } else {
    if (clientPromise === undefined) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
};

export default getClient;
