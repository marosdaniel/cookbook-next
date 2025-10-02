import clientPromise from '../mongodb';

const DB_NAME = process.env.MONGODB_DB ?? 'cookbook';

export const getDb = async () => {
  const client = await clientPromise;
  return client.db(DB_NAME);
};
