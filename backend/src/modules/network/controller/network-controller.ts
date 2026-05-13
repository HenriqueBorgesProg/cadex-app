import { FastifyReply, FastifyRequest } from "fastify";
import { NetworkService } from "../service/network-service";

export class NetworkController {
  private networkService: NetworkService;

  constructor() {
    this.networkService = new NetworkService();
  }

  async generate(_request: FastifyRequest, reply: FastifyReply) {
    const network = await this.networkService.generateNetwork();

    return reply.status(200).send(network);
  }
}
