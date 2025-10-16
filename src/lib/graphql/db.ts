import getClient from '../mongodb';

const DB_NAME = process.env.MONGODB_DB ?? 'cookbook';

export const getDb = async () => {
	const clientPromise = await getClient();
	return clientPromise.db(DB_NAME);
};
