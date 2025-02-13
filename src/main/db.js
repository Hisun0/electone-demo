import { Client } from 'pg';

export default async () => {
  const client = new Client({
    user: 'volkovradion',
    password: 'volkovradion',
    host: 'localhost',
    port: '5432',
    database: 'postgres',
  });

  await client.connect();
  return client;
};
