interface Coordinates {
  latitude: number;
  longitude: number;
}

export function calculateDistanceInMeters(
  from: Coordinates,
  to: Coordinates
): number {
  const earthRadiusInMeters = 6371000;

  const fromLatitudeInRadians = toRadians(from.latitude);
  const toLatitudeInRadians = toRadians(to.latitude);

  const latitudeDifferenceInRadians = toRadians(to.latitude - from.latitude);
  const longitudeDifferenceInRadians = toRadians(to.longitude - from.longitude);

  const haversine =
    Math.sin(latitudeDifferenceInRadians / 2) ** 2 +
    Math.cos(fromLatitudeInRadians) *
      Math.cos(toLatitudeInRadians) *
      Math.sin(longitudeDifferenceInRadians / 2) ** 2;

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return angularDistance * earthRadiusInMeters;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
