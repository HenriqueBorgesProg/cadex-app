import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../../shared/errors/AppError";
import { RoutePreviewService } from "../service/route-preview-service";

interface RoutePreviewRequestBody {
  originPointId: string;
  destinationPointId: string;
  poleSpacingMeters: number;
  cableCostPerMeter: number;
  poleUnitCost: number;
}

export class RoutesController {
  private routePreviewService: RoutePreviewService;

  constructor() {
    this.routePreviewService = new RoutePreviewService();
  }

  async preview(request: FastifyRequest, reply: FastifyReply) {
    if (!request.body) {
      throw new AppError(
        "Request body is required",
        400,
        "REQUEST_BODY_REQUIRED"
      );
    }

    const preview = await this.routePreviewService.generatePreview(
      request.body as RoutePreviewRequestBody
    );

    return reply.status(200).send(preview);
  }
}
