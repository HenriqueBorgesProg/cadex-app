import { AppError } from "../../../shared/errors/AppError";
import { calculateDistanceInMeters } from "../../../shared/utils/calculate-distance";
import { Point } from "../../points/entity/Point";
import { PointsRepository } from "../../points/repository/points-repository";
import { RoadRouteService, RouteCoordinate } from "../../network/service/road-route-service";

interface GenerateRoutePreviewInput {
  originPointId: string;
  destinationPointId: string;
  poleSpacingMeters: number;
  cableCostPerMeter: number;
  poleUnitCost: number;
}

interface SuggestedPole {
  sequence: number;
  latitude: number;
  longitude: number;
  distanceFromOriginMeters: number;
}

interface RoutePreviewOutput {
  origin: Point;
  destination: Point;
  routeGeometry: RouteCoordinate[];
  distanceMeters: number;
  durationSeconds?: number;
  suggestedPoles: SuggestedPole[];
  poleCount: number;
  cableCost: number;
  polesCost: number;
  totalEstimatedCost: number;
}

export class RoutePreviewService {
  private pointsRepository: PointsRepository;
  private roadRouteService: RoadRouteService;

  constructor() {
    this.pointsRepository = new PointsRepository();
    this.roadRouteService = new RoadRouteService();
  }

  async generatePreview(
    input: GenerateRoutePreviewInput
  ): Promise<RoutePreviewOutput> {
    this.validateInput(input);

    const [origin, destination] = await Promise.all([
      this.pointsRepository.findById(input.originPointId),
      this.pointsRepository.findById(input.destinationPointId),
    ]);

    if (!origin) {
      throw new AppError("Origin point not found", 404, "ORIGIN_POINT_NOT_FOUND");
    }

    if (!destination) {
      throw new AppError(
        "Destination point not found",
        404,
        "DESTINATION_POINT_NOT_FOUND"
      );
    }

    const route = await this.roadRouteService.calculateRoute(
      this.toCoordinate(origin),
      this.toCoordinate(destination)
    );
    const suggestedPoles = this.generateSuggestedPoles(
      route.geometry,
      input.poleSpacingMeters
    );
    const cableCost = route.distance * input.cableCostPerMeter;
    const polesCost = suggestedPoles.length * input.poleUnitCost;

    return {
      origin,
      destination,
      routeGeometry: route.geometry,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      suggestedPoles,
      poleCount: suggestedPoles.length,
      cableCost,
      polesCost,
      totalEstimatedCost: cableCost + polesCost,
    };
  }

  private validateInput(input: GenerateRoutePreviewInput) {
    if (!input.originPointId || typeof input.originPointId !== "string") {
      throw new AppError("Origin point id is required", 400, "ORIGIN_POINT_ID_REQUIRED");
    }

    if (
      !input.destinationPointId ||
      typeof input.destinationPointId !== "string"
    ) {
      throw new AppError(
        "Destination point id is required",
        400,
        "DESTINATION_POINT_ID_REQUIRED"
      );
    }

    if (input.originPointId === input.destinationPointId) {
      throw new AppError(
        "Origin and destination must be different points",
        400,
        "SAME_ORIGIN_AND_DESTINATION"
      );
    }

    this.validatePositiveNumber(
      input.poleSpacingMeters,
      "Pole spacing must be greater than zero",
      "INVALID_POLE_SPACING"
    );
    this.validatePositiveNumber(
      input.cableCostPerMeter,
      "Cable cost per meter must be greater than zero",
      "INVALID_CABLE_COST_PER_METER"
    );
    this.validatePositiveNumber(
      input.poleUnitCost,
      "Pole unit cost must be greater than zero",
      "INVALID_POLE_UNIT_COST"
    );
  }

  private validatePositiveNumber(value: number, message: string, code: string) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new AppError(message, 400, code);
    }
  }

  private toCoordinate(point: Point): RouteCoordinate {
    return {
      latitude: point.latitude,
      longitude: point.longitude,
    };
  }

  private generateSuggestedPoles(
    geometry: RouteCoordinate[],
    spacingMeters: number
  ): SuggestedPole[] {
    const suggestedPoles: SuggestedPole[] = [];

    if (geometry.length < 2) {
      return suggestedPoles;
    }

    let nextPoleDistance = spacingMeters;
    let traveledDistance = 0;

    for (let index = 1; index < geometry.length; index += 1) {
      const segmentStart = geometry[index - 1];
      const segmentEnd = geometry[index];
      const segmentDistance = calculateDistanceInMeters(segmentStart, segmentEnd);

      if (segmentDistance <= 0) {
        continue;
      }

      while (traveledDistance + segmentDistance >= nextPoleDistance) {
        const distanceInsideSegment = nextPoleDistance - traveledDistance;
        const ratio = distanceInsideSegment / segmentDistance;
        const coordinate = this.interpolateCoordinate(
          segmentStart,
          segmentEnd,
          ratio
        );

        suggestedPoles.push({
          sequence: suggestedPoles.length + 1,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          distanceFromOriginMeters: nextPoleDistance,
        });

        nextPoleDistance += spacingMeters;
      }

      traveledDistance += segmentDistance;
    }

    return suggestedPoles;
  }

  private interpolateCoordinate(
    from: RouteCoordinate,
    to: RouteCoordinate,
    ratio: number
  ): RouteCoordinate {
    return {
      latitude: from.latitude + (to.latitude - from.latitude) * ratio,
      longitude: from.longitude + (to.longitude - from.longitude) * ratio,
    };
  }
}
