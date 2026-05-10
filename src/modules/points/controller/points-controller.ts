import { FastifyReply, FastifyRequest } from "fastify";
import { PointType } from "../entity/Point";
import { PointsService } from "../service/points-service";
import { AppError } from "../../../shared/errors/AppError";

interface CreatePointRequestBody {
    type: PointType;
    latitude: number;
    longitude: number;
}


export class PointsController {
    private pointsService: PointsService;

    constructor() {
        this.pointsService = new PointsService();
    }

    async create(request: FastifyRequest, reply: FastifyReply) {
        if (!request.body) {
        throw new AppError("Request body is required", 400, "REQUEST_BODY_REQUIRED");
    }

            const { type, latitude, longitude } = request.body as CreatePointRequestBody;
            const point = await this.pointsService.createPoint({
                type,
                latitude,
                longitude
            });

            return reply.status(201).send(point);


    }

    async findAll(request: FastifyRequest, reply: FastifyReply) {

            const points = await this.pointsService.getAllPoints();
            return reply.status(200).send(points);


    }

}
