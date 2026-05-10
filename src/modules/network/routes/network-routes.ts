import { FastifyInstance } from "fastify";
import { NetworkController } from "../controller/network-controller";

export async function networkRoutes(app: FastifyInstance) {
  const networkController = new NetworkController();

  app.post("/generate", networkController.generate.bind(networkController));
}
