import fastify from 'fastify';
import { pointsRoutes } from './modules/points/routes/points-routes';
import { errorHandler } from './shared/http/error-handler';
import { networkRoutes } from './modules/network/routes/network-routes';

export const app = fastify({ logger: true });

app.setErrorHandler(errorHandler);
app.register(pointsRoutes, { prefix: '/points' });
app.register(networkRoutes, { prefix: '/network' });

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});
