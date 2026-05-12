import { Repository } from "typeorm";
import { AppDataSource } from "../../../shared/database/data-source";
import { Point, PointType } from "../entity/Point";

interface CreatePointData {
  type: PointType;
  latitude: number;
  longitude: number;
}

export class PointsRepository {
  private repository: Repository<Point>;

  constructor() {
    this.repository = AppDataSource.getRepository(Point);
  }

  async create(data: CreatePointData): Promise<Point> {
    const point = this.repository.create(data);
    return this.repository.save(point);
  }

  async findAll(): Promise<Point[]> {
    return this.repository.find();
  }
}
