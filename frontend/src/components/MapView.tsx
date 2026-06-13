import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import { POINT_TYPES } from "../types/domain";
import type {
  ConnectionSegment,
  PendingPoint,
  Point,
  RoutePreviewResult,
} from "../types/domain";

interface SelectedRoutePointIds {
  originPointId: string | null;
  destinationPointId: string | null;
}

interface MapViewProps {
  points: Point[];
  pendingPoint: PendingPoint | null;
  connections: ConnectionSegment[];
  routePreview: RoutePreviewResult | null;
  selectedRoutePointIds: SelectedRoutePointIds;
  onMapClick: (point: PendingPoint) => void;
  onPointClick: (point: Point) => void;
}

const defaultCenter: [number, number] = [-23.25, -44.9];

export function MapView({
  points,
  pendingPoint,
  connections,
  routePreview,
  selectedRoutePointIds,
  onMapClick,
  onPointClick,
}: MapViewProps) {
  return (
    <div className="map-shell">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />
        <MapBounds
          points={points}
          pendingPoint={pendingPoint}
          routePreview={routePreview}
        />

        {connections.map((connection) => (
          <Polyline
            key={`${connection.clientId}-${connection.poleId}`}
            pathOptions={{
              color: "#2f6f4e",
              opacity: 0.82,
              weight: 4,
            }}
            positions={getConnectionPositions(connection)}
          >
            <Popup>
              <strong>Connection</strong>
              <span>{formatMeters(connection.distance)}</span>
            </Popup>
          </Polyline>
        ))}

        {routePreview ? (
          <Polyline
            pathOptions={{
              color: "#7c5cff",
              opacity: 0.92,
              weight: 5,
            }}
            positions={getRoutePreviewPositions(routePreview)}
          >
            <Popup>
              <strong>Route simulation</strong>
              <span>{formatMeters(routePreview.distanceMeters)}</span>
            </Popup>
          </Polyline>
        ) : null}

        {points.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.latitude, point.longitude]}
            radius={getPointRadius(point, selectedRoutePointIds)}
            pathOptions={getPointPathOptions(point, selectedRoutePointIds)}
            eventHandlers={{
              click(event) {
                event.originalEvent.stopPropagation();
                onPointClick(point);
              },
            }}
          >
            <Popup>
              <strong>{point.type === POINT_TYPES.Client ? "Client" : "Pole"}</strong>
              <span>{point.id}</span>
              {point.id === selectedRoutePointIds.originPointId ? (
                <span>Route origin</span>
              ) : null}
              {point.id === selectedRoutePointIds.destinationPointId ? (
                <span>Route destination</span>
              ) : null}
              <span>
                {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
              </span>
            </Popup>
          </CircleMarker>
        ))}

        {pendingPoint && (
          <CircleMarker
            center={[pendingPoint.latitude, pendingPoint.longitude]}
            radius={11}
            pathOptions={{
              color: "#17211b",
              dashArray: "4 4",
              fillColor: "#f8d463",
              fillOpacity: 0.72,
              weight: 2,
            }}
          >
            <Popup>
              <strong>Pending point</strong>
              <span>
                {pendingPoint.latitude.toFixed(5)},{" "}
                {pendingPoint.longitude.toFixed(5)}
              </span>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (point: PendingPoint) => void;
}) {
  useMapEvents({
    click(event) {
      onMapClick({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapBounds({
  points,
  pendingPoint,
  routePreview,
}: {
  points: Point[];
  pendingPoint: PendingPoint | null;
  routePreview: RoutePreviewResult | null;
}) {
  const map = useMap();

  useEffect(() => {
    const coordinates = points.map<[number, number]>((point) => [
      point.latitude,
      point.longitude,
    ]);

    if (pendingPoint) {
      coordinates.push([pendingPoint.latitude, pendingPoint.longitude]);
    }

    if (routePreview) {
      coordinates.push(
        ...routePreview.routeGeometry.map<[number, number]>((coordinate) => [
          coordinate.latitude,
          coordinate.longitude,
        ])
      );
    }

    if (coordinates.length === 0) {
      return;
    }

    const bounds = coordinates as LatLngBoundsExpression;
    map.fitBounds(bounds, { padding: [42, 42], maxZoom: 13 });
  }, [map, pendingPoint, points, routePreview]);

  return null;
}

function formatMeters(distance: number): string {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(2)} km`;
  }

  return `${distance.toFixed(0)} m`;
}

function getPointRadius(
  point: Point,
  selectedRoutePointIds: SelectedRoutePointIds
): number {
  if (
    point.id === selectedRoutePointIds.originPointId ||
    point.id === selectedRoutePointIds.destinationPointId
  ) {
    return 12;
  }

  return point.type === POINT_TYPES.Client ? 8 : 9;
}

function getPointPathOptions(
  point: Point,
  selectedRoutePointIds: SelectedRoutePointIds
) {
  if (point.id === selectedRoutePointIds.originPointId) {
    return {
      color: "#17211b",
      fillColor: "#5fc878",
      fillOpacity: 0.95,
      weight: 3,
    };
  }

  if (point.id === selectedRoutePointIds.destinationPointId) {
    return {
      color: "#17211b",
      fillColor: "#7c5cff",
      fillOpacity: 0.95,
      weight: 3,
    };
  }

  return {
    color: point.type === POINT_TYPES.Client ? "#1b5f9e" : "#8a4b14",
    fillColor: point.type === POINT_TYPES.Client ? "#2d8ad8" : "#d9842b",
    fillOpacity: 0.92,
    weight: 2,
  };
}

function getConnectionPositions(
  connection: ConnectionSegment
): [number, number][] {
  if (connection.geometry?.length) {
    return connection.geometry.map((coordinate) => [
      coordinate.latitude,
      coordinate.longitude,
    ]);
  }

  return [
    [connection.client.latitude, connection.client.longitude],
    [connection.pole.latitude, connection.pole.longitude],
  ];
}

function getRoutePreviewPositions(
  routePreview: RoutePreviewResult
): [number, number][] {
  return routePreview.routeGeometry.map((coordinate) => [
    coordinate.latitude,
    coordinate.longitude,
  ]);
}
