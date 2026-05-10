// points-routes.ts
import { FastifyInstance } from "fastify";
import { PointsController } from "../controller/points-controller";

export async function pointsRoutes(app: FastifyInstance) {
  const pointsController = new PointsController();

  app.post("/", pointsController.create.bind(pointsController));
  app.get("/", pointsController.findAll.bind(pointsController));
}
