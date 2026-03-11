const BASE = '/api';

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  getRoutes: () => req<Route[]>('GET', '/routes'),
  getRoute: (id: string) => req<Route>('GET', `/routes/${id}`),
  getBuses: () => req<Bus[]>('GET', '/buses'),
  getStops: () => req<StopWithCrowd[]>('GET', '/stops'),
  getStopCrowd: (stopId: string) => req<CrowdInfo>('GET', `/stops/${stopId}/crowd`),
  joinQueue: (stopId: string, passengerId: string) =>
    req<QueueResult>('POST', `/stops/${stopId}/queue`, { passengerId }),
  leaveQueue: (stopId: string, passengerId: string) =>
    req<{ success: boolean; passengerCount: number }>('DELETE', `/stops/${stopId}/queue/${passengerId}`, null),
  findNearest: (lat: number, lng: number) =>
    req<NearestResult>('POST', '/route/nearest', { lat, lng }),
  getCo2: (routeId: string, fromStopIdx: number) =>
    req<Co2Data>('GET', `/co2?routeId=${routeId}&fromStopIdx=${fromStopIdx}`),
};

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface StopWithCrowd extends Stop {
  routeId: string;
  routeName: string;
  passengerCount: number;
  crowdLevel: 'low' | 'medium' | 'high';
}

export interface Route {
  id: string;
  name: string;
  description: string;
  color: string;
  stops: StopWithCrowd[];
  totalDistanceKm: number;
}

export interface Bus {
  id: string;
  number: string;
  routeId: string;
  currentStopIdx: number;
  driver: string;
  capacity: number;
  currentStop: Stop;
  nextStop: Stop;
  lat: number;
  lng: number;
  passengerCount: number;
  occupancyPct: number;
  status: 'on-time' | 'delayed';
  route: { id: string; name: string; color: string };
}

export interface CrowdInfo {
  stopId: string;
  passengerCount: number;
  crowdLevel: 'low' | 'medium' | 'high';
  queue: { id: string; name: string; joinedAt: string }[];
}

export interface QueueResult {
  success: boolean;
  passengerId: string;
  passengerCount: number;
  crowdLevel: 'low' | 'medium' | 'high';
  etaMinutes: number | null;
}

export interface RemainingStop extends StopWithCrowd {
  etaMinutes: number;
}

export interface NearestResult {
  nearestStop: StopWithCrowd;
  route: { id: string; name: string; color: string };
  distanceToStopKm: number;
  remainingStops: RemainingStop[];
  co2: Co2Data;
}

export interface Co2Data {
  bus: number;
  car: number;
  auto: number;
  walk: number;
  savedVsCar: number;
  savedVsAuto: number;
  distanceKm: number;
}
