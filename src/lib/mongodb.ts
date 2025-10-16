import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
	throw new Error('Please add your Mongo URI to .env.local');
}

export const getClient = async (): Promise<MongoClient> => {
	if (process.env.NODE_ENV === 'development') {
		// @ts-expect-error Global augmentation for MongoDB client promise in development
		if (!global._mongoClientPromise) {
			client = new MongoClient(uri, options);
			// @ts-expect-error Global augmentation for MongoDB client promise in development
			global._mongoClientPromise = client.connect();
		}
		// @ts-expect-error Global augmentation for MongoDB client promise in development
		clientPromise = global._mongoClientPromise;
	} else {
		if (!clientPromise) {
			client = new MongoClient(uri, options);
			clientPromise = client.connect();
		}
	}
	return clientPromise;
};

export default getClient;
