import { calculateDistanceInMeters } from "../../../shared/utils/calculate-distance";

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface RoadRoute {
  distance: number;
  geometry: RouteCoordinate[];
  duration?: number;
}

interface OsrmRouteResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration?: number;
    geometry?: {
      coordinates: Array<[number, number]>;
    };
  }>;
}

export class RoadRouteService {
  async calculateRoute(
    from: RouteCoordinate,
    to: RouteCoordinate
  ): Promise<RoadRoute> {
    const roadRoute = await this.tryCalculateRoadRoute(from, to);

    if (roadRoute) {
      return roadRoute;
    }

    return {
      distance: calculateDistanceInMeters(from, to),
      geometry: [from, to],
    };
  }

  private async tryCalculateRoadRoute(
    from: RouteCoordinate,
    to: RouteCoordinate
  ): Promise<RoadRoute | null> {
    const url = new URL(
      `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}`
    );
    url.searchParams.set("overview", "full");
    url.searchParams.set("geometries", "geojson");

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as OsrmRouteResponse;
      const route = data.routes?.[0];

      if (
        data.code !== "Ok" ||
        !route ||
        !Number.isFinite(route.distance) ||
        !route.geometry?.coordinates.length
      ) {
        return null;
      }

      return {
        distance: route.distance,
        duration: Number.isFinite(route.duration) ? route.duration : undefined,
        geometry: route.geometry.coordinates.map(([longitude, latitude]) => ({
          latitude,
          longitude,
        })),
      };
    } catch {
      return null;
    }
  }
}
