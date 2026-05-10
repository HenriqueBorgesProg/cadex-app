import { Point, PointType } from "../../points/entity/Point";
import { PointsRepository } from "../../points/repository/points-repository";
import { calculateDistanceInMeters } from "../../../shared/utils/calculate-distance";
import { AppError } from "../../../shared/errors/AppError";

interface NetworkConnection {
  clientId: string;
  poleId: string;
  distance: number;
}

interface GenerateNetworkOutput {
  connections: NetworkConnection[];
}

export class NetworkService {
  private pointsRepository: PointsRepository;

  constructor() {
    this.pointsRepository = new PointsRepository();

  }

  async generateNetwork(): Promise<GenerateNetworkOutput> {
    const points = await this.pointsRepository.findAll();

    const clients = points.filter((point) => point.type === PointType.Client);
    const poles = points.filter((point) => point.type === PointType.Pole);

    if (poles.length === 0) {
      throw new AppError("No poles found in the database", 400, "NO_POLES_FOUND");
    }

    if (clients.length === 0) {
      return { connections: [] };
    }

    const connections = clients.map((client) => {
      const nearestPole = this.findNearestPole(client, poles);

      return {
        clientId: client.id,
        poleId: nearestPole.pole.id,
        distance: nearestPole.distance,
      };
    });

    return { connections };
  }

  private findNearestPole(
    client: Point,
    poles: Point[]
  ): { pole: Point; distance: number } {
    let nearestPole = poles[0];
    let shortestDistance = calculateDistanceInMeters(
      {
        latitude: client.latitude,
        longitude: client.longitude,
      },
      {
        latitude: nearestPole.latitude,
        longitude: nearestPole.longitude,
      }
    );

    for (const pole of poles.slice(1)) {
      const distance = calculateDistanceInMeters(
        {
          latitude: client.latitude,
          longitude: client.longitude,
        },
        {
          latitude: pole.latitude,
          longitude: pole.longitude,
        }
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestPole = pole;
      }
    }

    return {
      pole: nearestPole,
      distance: shortestDistance,
    };
  }
}
