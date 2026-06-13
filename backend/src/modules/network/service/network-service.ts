import { Point, PointType } from "../../points/entity/Point";
import { PointsRepository } from "../../points/repository/points-repository";
import { AppError } from "../../../shared/errors/AppError";
import { RoadRouteService, RouteCoordinate } from "./road-route-service";

interface NetworkConnection {
  clientId: string;
  poleId: string;
  distance: number;
  geometry: RouteCoordinate[];
}

interface GenerateNetworkOutput {
  connections: NetworkConnection[];
  totalDistance: number;
}

export class NetworkService {
  private pointsRepository: PointsRepository;
  private roadRouteService: RoadRouteService;

  constructor() {
    this.pointsRepository = new PointsRepository();
    this.roadRouteService = new RoadRouteService();
  }

  async generateNetwork(): Promise<GenerateNetworkOutput> {
    const points = await this.pointsRepository.findAll();

    const clients = points.filter((point) => point.type === PointType.Client);
    const poles = points.filter((point) => point.type === PointType.Pole);

    if (poles.length === 0) {
      throw new AppError("No poles found in the database", 400, "NO_POLES_FOUND");
    }

    if (clients.length === 0) {
      return {
        connections: [],
        totalDistance: 0,
      };
    }

    const connections: NetworkConnection[] = [];

    for (const client of clients) {
      const nearestPole = await this.findNearestPole(client, poles);

      connections.push({
        clientId: client.id,
        poleId: nearestPole.pole.id,
        distance: nearestPole.distance,
        geometry: nearestPole.geometry,
      });
    }

    const totalDistance = connections.reduce(
      (sum, connection) => sum + connection.distance,
      0
    );

    return { connections, totalDistance };
  }

  private async findNearestPole(
    client: Point,
    poles: Point[]
  ): Promise<{ pole: Point; distance: number; geometry: RouteCoordinate[] }> {
    const clientCoordinate = {
      latitude: client.latitude,
      longitude: client.longitude,
    };
    let nearestPole: Point | null = null;
    let shortestRoute: {
      distance: number;
      geometry: RouteCoordinate[];
    } | null = null;

    for (const pole of poles) {
      const route = await this.roadRouteService.calculateRoadRoute(clientCoordinate, {
        latitude: pole.latitude,
        longitude: pole.longitude,
      });

      if (!route) {
        continue;
      }

      if (!shortestRoute || route.distance < shortestRoute.distance) {
        shortestRoute = {
          distance: route.distance,
          geometry: route.geometry,
        };
        nearestPole = pole;
      }
    }

    if (!nearestPole || !shortestRoute) {
      throw new AppError(
        `Unable to calculate road route for client ${client.id}`,
        502,
        "ROAD_ROUTE_UNAVAILABLE"
      );
    }

    return {
      pole: nearestPole,
      distance: shortestRoute.distance,
      geometry: shortestRoute.geometry,
    };
  }
}
