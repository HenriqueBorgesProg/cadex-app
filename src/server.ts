import { AddressInfo } from 'net';
import { app } from './app';
import cors from '@fastify/cors';

app.register(cors, {
  origin: '*',
});
// Run the server!
const start = async () => {
  try {
    await app.listen({ port: 3000 });
    const address = app.server.address() as AddressInfo;
    app.log.info(`server listening on ${address?.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
