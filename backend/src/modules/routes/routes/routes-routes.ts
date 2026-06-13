import { FastifyInstance } from "fastify";
import { RoutesController } from "../controller/routes-controller";

export async function routesRoutes(app: FastifyInstance) {
  const routesController = new RoutesController();

  app.post("/preview", routesController.preview.bind(routesController));
}
