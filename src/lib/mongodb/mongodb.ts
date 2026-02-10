import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const options = {};

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalThis._mongoClientPromise = client.connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the promise for MongoDB adapter (NextAuth v5)
export const mongoClient = clientPromise;

export const getClient = async (): Promise<MongoClient> => {
  return clientPromise;
};

export default getClient;
