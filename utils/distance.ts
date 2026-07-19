import type { Coordinates } from '@/hooks/useLocationCapture';

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Distância em linha reta entre duas coordenadas (fórmula de haversine),
 * em quilômetros. Função pura, sem efeitos colaterais — a distância nunca é
 * persistida (Fase 4/T022): é sempre recalculada em runtime a partir de
 * `listing.lat/lng` e da localização atual do usuário (`useUserLocation`).
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Conveniência sobre `haversineDistanceKm` para os pontos já no formato
 * `Coordinates` usado pelos hooks de localização (`useLocationCapture`,
 * `useUserLocation`).
 */
export function distanceBetweenKm(from: Coordinates, to: Coordinates): number {
  return haversineDistanceKm(from.lat, from.lng, to.lat, to.lng);
}

/**
 * Formata a distância para exibição no `ListingCard` (T025), ex: "~2.3 km"
 * ou "~850 m" quando abaixo de 1 km.
 */
export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) {
    return `~${Math.round(distanceKm * 1000)} m`;
  }
  return `~${distanceKm.toFixed(1)} km`;
}
