import { FastifyReply, FastifyRequest } from "fastify";
import { PointType } from "../entity/Point";
import { PointsService } from "../service/points-service";

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
        try {
            const { type, latitude, longitude } = request.body as CreatePointRequestBody;
            const point = await this.pointsService.createPoint({
                type,
                latitude,
                longitude
            });

            return reply.status(201).send(point);
        } catch (error) {
            return reply.status(400).send({ error: "Failed to create point" });
        }
    }

    async findAll(request: FastifyRequest, reply: FastifyReply) {
        try {
            const points = await this.pointsService.getAllPoints();
            return reply.status(200).send(points);
        } catch (error) {
            return reply.status(400).send({ error: "Failed to fetch points" });
        }
    }

}
