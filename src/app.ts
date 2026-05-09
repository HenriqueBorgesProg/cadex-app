import fastify from 'fastify';
import { pointsRoutes } from './modules/points/routes/points-routes';

export const app = fastify({ logger: true });

// Declare a route
app.register(pointsRoutes, { prefix: '/points' });
app.get('/', async (request, reply) => {
  return { hello: 'world' };
});
