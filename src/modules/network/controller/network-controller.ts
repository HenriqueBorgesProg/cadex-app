import { FastifyReply, FastifyRequest } from "fastify";
import { NetworkService } from "../service/network-service";
import { AppError } from "../../../shared/errors/AppError";

export class NetworkController {
  private networkService: NetworkService;

  constructor() {
    this.networkService = new NetworkService();
  }

  async generate(request: FastifyRequest, reply: FastifyReply) {
    const network = await this.networkService.generateNetwork();

    return reply.status(200).send(network);
  }
}

