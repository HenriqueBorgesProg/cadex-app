import { calculateDistanceInMeters } from "../../../shared/utils/calculate-distance";

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface RoadRoute {
  distance: number;
  geometry: RouteCoordinate[];
  duration?: number;
  routeOrigin: RouteCoordinate;
  routeDestination: RouteCoordinate;
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

interface OsrmNearestResponse {
  code: string;
  waypoints?: Array<{
    distance?: number;
    location: [number, number];
  }>;
}

export class RoadRouteService {
  private readonly maxRoadRouteAttempts = 5;
  private readonly osrmProfile = "walking";

  async calculateRoadRoute(
    from: RouteCoordinate,
    to: RouteCoordinate
  ): Promise<RoadRoute | null> {
    for (let attempt = 1; attempt <= this.maxRoadRouteAttempts; attempt += 1) {
      const roadRoute = await this.tryCalculateRoadRoute(from, to);

      if (roadRoute) {
        return roadRoute;
      }

      if (attempt < this.maxRoadRouteAttempts) {
        await this.wait(400 * attempt);
      }
    }

    return null;
  }

  async calculateRoute(
    from: RouteCoordinate,
    to: RouteCoordinate
  ): Promise<RoadRoute> {
    const roadRoute = await this.calculateRoadRoute(from, to);

    if (roadRoute) {
      return roadRoute;
    }

    return {
      distance: calculateDistanceInMeters(from, to),
      geometry: [from, to],
      routeOrigin: from,
      routeDestination: to,
    };
  }

  private async tryCalculateRoadRoute(
    from: RouteCoordinate,
    to: RouteCoordinate
  ): Promise<RoadRoute | null> {
    const routeOrigin = await this.findNearestRoadCoordinate(from);
    const routeDestination = await this.findNearestRoadCoordinate(to);

    if (!routeOrigin || !routeDestination) {
      return null;
    }

    const url = new URL(
      `https://router.project-osrm.org/route/v1/${this.osrmProfile}/${routeOrigin.longitude},${routeOrigin.latitude};${routeDestination.longitude},${routeDestination.latitude}`
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
        routeOrigin,
        routeDestination,
        geometry: route.geometry.coordinates.map(([longitude, latitude]) => ({
          latitude,
          longitude,
        })),
      };
    } catch {
      return null;
    }
  }

  private async findNearestRoadCoordinate(
    coordinate: RouteCoordinate
  ): Promise<RouteCoordinate | null> {
    const url = new URL(
      `https://router.project-osrm.org/nearest/v1/${this.osrmProfile}/${coordinate.longitude},${coordinate.latitude}`
    );
    url.searchParams.set("number", "1");

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as OsrmNearestResponse;
      const waypoint = data.waypoints?.[0];

      if (data.code !== "Ok" || !waypoint) {
        return null;
      }

      const [longitude, latitude] = waypoint.location;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return { latitude, longitude };
    } catch {
      return null;
    }
  }

  private async wait(milliseconds: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }
}
