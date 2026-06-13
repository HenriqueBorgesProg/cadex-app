export const POINT_TYPES = {
  Client: "client",
  Pole: "pole",
} as const;

export type PointType = (typeof POINT_TYPES)[keyof typeof POINT_TYPES];

export interface Point {
  id: string;
  type: PointType;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePointInput {
  type: PointType;
  latitude: number;
  longitude: number;
}

export interface NetworkConnection {
  clientId: string;
  poleId: string;
  distance: number;
  geometry?: RouteCoordinate[];
}

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface NetworkResult {
  connections: NetworkConnection[];
  totalDistance: number;
}

export interface RoutePreviewInput {
  originPointId: string;
  destinationPointId: string;
  poleSpacingMeters: number;
  cableCostPerMeter: number;
  poleUnitCost: number;
}

export interface SuggestedPole {
  sequence: number;
  latitude: number;
  longitude: number;
  distanceFromOriginMeters: number;
}

export interface RoutePreviewResult {
  origin: Point;
  destination: Point;
  routeOrigin: RouteCoordinate;
  routeDestination: RouteCoordinate;
  routeGeometry: RouteCoordinate[];
  distanceMeters: number;
  durationSeconds?: number;
  suggestedPoles: SuggestedPole[];
  poleCount: number;
  cableCost: number;
  polesCost: number;
  totalEstimatedCost: number;
}

export interface ConnectionSegment extends NetworkConnection {
  client: Point;
  pole: Point;
}

export interface ApiErrorResponse {
  error?: {
    message: string;
    code: string;
    statusCode: number;
  };
}

export interface PendingPoint {
  latitude: number;
  longitude: number;
}
