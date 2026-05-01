import { AddressInfo } from 'net';
import { app } from './app';
import { AppDataSource } from './shared/database/data-source';
import cors from '@fastify/cors';

app.register(cors, {
  origin: '*',
});
// Run the server!
const start = async () => {
  try {
    // Initialize database
    await AppDataSource.initialize();
    app.log.info('Database connected!');

    await app.listen({ port: 3000 });
    const address = app.server.address() as AddressInfo;
    app.log.info(`server listening on ${address?.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
