import { AppError } from "../../../shared/errors/AppError";
import { Point, PointType } from "../entity/Point";
import { PointsRepository } from "../repository/points-repository";

interface CreatePointInput {
  type: PointType;
  latitude: number;
  longitude: number;
}

export class PointsService {
  private pointsRepository: PointsRepository;

  constructor() {
    this.pointsRepository = new PointsRepository();
  }

  async createPoint(data: CreatePointInput): Promise<Point> {
    const { type, latitude, longitude } = data;

    if (type !== PointType.Client && type !== PointType.Pole) {
      throw new AppError("Invalid point type", 400, "INVALID_POINT_TYPE");
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new AppError("Invalid latitude value", 400, "INVALID_LATITUDE");
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new AppError("Invalid longitude value", 400, "INVALID_LONGITUDE");
    }

    return this.pointsRepository.create({ type, latitude, longitude });
  }

  async getAllPoints(): Promise<Point[]> {
    return this.pointsRepository.findAll();
  }
}
