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
  getCities: () => req<City[]>('GET', '/cities'),
  getStats: () => req<SystemStats>('GET', '/stats'),
  getRoutes: (cityId?: string) => req<Route[]>('GET', cityId ? `/routes?cityId=${cityId}` : '/routes'),
  getRoute: (id: string) => req<Route>('GET', `/routes/${id}`),
  getBuses: (cityId?: string) => req<Bus[]>('GET', cityId ? `/buses?cityId=${cityId}` : '/buses'),
  getStops: (cityId?: string) => req<StopWithCrowd[]>('GET', cityId ? `/stops?cityId=${cityId}` : '/stops'),
  getStopCrowd: (stopId: string) => req<CrowdInfo>('GET', `/stops/${stopId}/crowd`),
  joinQueue: (stopId: string, passengerId: string) =>
    req<QueueResult>('POST', `/stops/${stopId}/queue`, { passengerId }),
  leaveQueue: (stopId: string, passengerId: string) =>
    req<{ success: boolean; passengerCount: number }>('DELETE', `/stops/${stopId}/queue/${passengerId}`, null),
  findNearest: (lat: number, lng: number, cityId?: string) =>
    req<NearestResult>('POST', '/route/nearest', { lat, lng, cityId }),
  planTrip: (originLat: number, originLng: number, destLat: number, destLng: number, cityId?: string) =>
    req<TripPlan>('POST', '/trip', { originLat, originLng, destLat, destLng, cityId }),
  getHeatmap: (cityId?: string) =>
    req<HeatmapData>('GET', cityId ? `/heatmap?cityId=${cityId}` : '/heatmap'),
  getSkipSuggestions: (busId: string) =>
    req<SkipSuggestions>('GET', `/buses/${busId}/skip-suggestions`),
};

export interface City {
  id: string;
  name: string;
  center: [number, number];
  system: string;
}

export interface CityStat extends City {
  routes: number;
  stops: number;
  totalWaiting: number;
  activeBuses: number;
}

export interface SystemStats {
  totalCities: number;
  totalRoutes: number;
  totalStops: number;
  totalBuses: number;
  totalWaiting: number;
  highCrowdStops: number;
  cityStats: CityStat[];
}

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
  cityId: string;
  passengerCount: number;
  crowdLevel: 'low' | 'medium' | 'high';
  etaMinutes?: number;
}

export interface Route {
  id: string;
  cityId: string;
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
  cityId: string;
  cityName: string;
  system: string;
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
  queue: { id: string; joinedAt: string }[];
}

export interface QueueResult {
  success: boolean;
  passengerId: string;
  passengerCount: number;
  crowdLevel: 'low' | 'medium' | 'high';
  etaMinutes: number | null;
}

export interface NearestResult {
  nearestStop: StopWithCrowd;
  route: { id: string; name: string; color: string; cityId: string };
  city: City;
  distanceToStopKm: number;
  remainingStops: StopWithCrowd[];
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

export interface TripPlan {
  type: 'direct' | 'no-direct-route';
  message?: string;
  route?: { id: string; name: string; color: string; cityId: string; description: string };
  city?: City;
  boardStop?: StopWithCrowd;
  alightStop?: StopWithCrowd;
  intermediateStops?: (StopWithCrowd & { etaMinutes: number })[];
  walkToStop?: { distanceKm: number; minutes: number };
  walkFromStop?: { distanceKm: number; minutes: number };
  routeDistanceKm?: number;
  totalDistanceKm?: number;
  estimatedMinutes?: number;
  co2?: Co2Data;
  nearestToOrigin?: { stop: StopWithCrowd; route: { id: string; name: string; color: string } } | null;
  nearestToDest?: { stop: StopWithCrowd; route: { id: string; name: string; color: string } } | null;
}

export interface HeatmapStop extends Stop {
  passengerCount: number;
  forecastedCount: number;
  crowdLevel: 'low' | 'medium' | 'high';
  forecastedCrowdLevel: 'low' | 'medium' | 'high';
  timeSlot: string;
  forecast: Record<string, number>;
  routeId: string;
  routeName: string;
  cityId: string;
  cityName: string;
  intensity: number;
}

export interface HeatmapData {
  stops: HeatmapStop[];
  timeSlot: string;
  currentHour: number;
  hourlyDemand: { slot: string; multiplier: number; label: string }[];
}

export interface SkipSuggestion {
  stop: StopWithCrowd;
  stopsAway: number;
  etaMinutes: number;
  action: 'STOP' | 'SKIP' | 'PRIORITY STOP';
  reason: string;
  priority: 'low' | 'normal' | 'medium' | 'high';
}

export interface SkipSuggestions {
  busId: string;
  busNumber: string;
  routeName: string;
  suggestions: SkipSuggestion[];
  skipCount: number;
  estimatedTimeSavedMin: number;
}
