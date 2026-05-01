import fastify from 'fastify';

export const app = fastify({ logger: true });

// Declare a route
app.get('/', async (request, reply) => {
  return { hello: 'world' };
});
