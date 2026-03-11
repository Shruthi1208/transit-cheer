import { useState } from 'react';
import { Bus, MapPin, Users, Navigation, Clock, Leaf, AlertTriangle, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import InteractiveMap from '@/components/InteractiveMap';
import CitySelector from '@/components/CitySelector';
import { api, type Route, type Bus as BusType, type NearestResult } from '@/lib/api';
import { useCity } from '@/context/CityContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CO2_COLORS: Record<string, string> = { Bus: '#10B981', Car: '#EF4444', Auto: '#F59E0B', Walk: '#6B7280' };

export default function DriverDashboard() {
  const { selectedCity } = useCity();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [inputLat, setInputLat] = useState('');
  const [inputLng, setInputLng] = useState('');
  const [nearest, setNearest] = useState<NearestResult | null>(null);
  const [loadingNearest, setLoadingNearest] = useState(false);
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number; label?: string } | null>(null);

  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ['/api/routes', selectedCity?.id ?? 'all'],
    queryFn: () => api.getRoutes(selectedCity?.id),
    refetchInterval: 15000,
  });

  const { data: buses = [] } = useQuery<BusType[]>({
    queryKey: ['/api/buses', selectedCity?.id ?? 'all'],
    queryFn: () => api.getBuses(selectedCity?.id),
    refetchInterval: 8000,
  });

  // Auto-select first route when routes load/change
  const effectiveRouteId = selectedRouteId && routes.find(r => r.id === selectedRouteId)
    ? selectedRouteId
    : nearest?.route.id ?? routes[0]?.id ?? null;

  const displayRoute = routes.find(r => r.id === effectiveRouteId);
  const activeBus = buses.find(b => b.routeId === effectiveRouteId);
  const currentStop = activeBus?.currentStop;
  const nextStop = activeBus?.nextStop;
  const totalWaiting = displayRoute?.stops.reduce((s, st) => s + st.passengerCount, 0) ?? 0;
  const routeDistKm = displayRoute?.totalDistanceKm ?? 10;

  const co2Data = [
    { name: 'Bus',  value: nearest?.co2.bus  ?? +(routeDistKm * 0.089).toFixed(3) },
    { name: 'Auto', value: nearest?.co2.auto ?? +(routeDistKm * 0.12).toFixed(3)  },
    { name: 'Car',  value: nearest?.co2.car  ?? +(routeDistKm * 0.21).toFixed(3)  },
    { name: 'Walk', value: 0 },
  ];
  const savedVsCar = nearest?.co2.savedVsCar ?? +(routeDistKm * (0.21 - 0.089)).toFixed(3);

  const mapCenter: [number, number] = currentStop
    ? [currentStop.lat, currentStop.lng]
    : selectedCity?.center ?? [20.5937, 78.9629];

  async function handleFindRoute() {
    const parsedLat = parseFloat(inputLat);
    const parsedLng = parseFloat(inputLng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) return;
    setSelectedPin({ lat: parsedLat, lng: parsedLng, label: 'Your Location' });
    setLoadingNearest(true);
    try {
      const result = await api.findNearest(parsedLat, parsedLng, selectedCity?.id);
      setNearest(result);
      setSelectedRouteId(result.route.id);
    } finally {
      setLoadingNearest(false);
    }
  }

  function handleMapClick(lat: number, lng: number) {
    setInputLat(lat.toFixed(6));
    setInputLng(lng.toFixed(6));
    setSelectedPin({ lat, lng, label: 'Selected Location' });
  }

  const displayRouteForMap = nearest ? routes.find(r => r.id === nearest.route.id) || displayRoute : displayRoute;
  const displayBusesForMap = buses.filter(b => b.routeId === (displayRouteForMap?.id ?? effectiveRouteId));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">← Back</Link>
            <div className="w-px h-5 bg-border shrink-0" />
            <Bus className="w-5 h-5 text-primary shrink-0" />
            <h1 className="font-display font-bold text-lg truncate">Driver Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <CitySelector compact />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-transit-stop animate-pulse" />
              <span className="hidden sm:block">{activeBus ? `Bus ${activeBus.number}` : selectedCity?.name ?? 'All Cities'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Route selector */}
        <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
          {routes.map(r => (
            <button key={r.id} data-testid={`route-btn-${r.id}`}
              onClick={() => { setSelectedRouteId(r.id); setNearest(null); setSelectedPin(null); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap"
              style={effectiveRouteId === r.id && !nearest ? { background: r.color, borderColor: r.color, color: 'white' } : {}}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Lat/Lng input */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-sm">Find Optimised Route from Coordinates</span>
            <span className="text-xs text-muted-foreground ml-auto hidden sm:block">or click on map</span>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[110px] space-y-1">
              <Label htmlFor="lat" className="text-xs">Latitude</Label>
              <Input id="lat" data-testid="input-lat" value={inputLat} onChange={e => setInputLat(e.target.value)} placeholder="e.g. 17.4947" className="h-9 text-sm" />
            </div>
            <div className="flex-1 min-w-[110px] space-y-1">
              <Label htmlFor="lng" className="text-xs">Longitude</Label>
              <Input id="lng" data-testid="input-lng" value={inputLng} onChange={e => setInputLng(e.target.value)} placeholder="e.g. 78.3996" className="h-9 text-sm" />
            </div>
            <Button data-testid="btn-find-route" onClick={handleFindRoute} disabled={loadingNearest} size="sm" className="h-9">
              {loadingNearest ? 'Finding…' : 'Find Route'}
            </Button>
          </div>
          {nearest && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-0.5">
              <p className="text-sm font-medium">Nearest stop: <b>{nearest.nearestStop.name}</b> ({nearest.distanceToStopKm} km away) · {nearest.city.name} ({nearest.city.system})</p>
              <p className="text-xs text-muted-foreground">{nearest.route.name} · {nearest.remainingStops.length} stops remaining · {nearest.co2.distanceKm} km</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MapPin} title="Current Stop" value={currentStop?.name ?? '—'} subtitle={displayRoute ? `Stop ${(activeBus?.currentStopIdx ?? 0) + 1} of ${displayRoute.stops.length}` : 'Select a route'} />
          <StatCard icon={Navigation} title="Next Stop" value={nextStop?.name ?? 'End of Route'} subtitle="Next halt" />
          <StatCard icon={Users} title="Total Waiting" value={totalWaiting} subtitle="All stops on route" variant="crowded" />
          <StatCard icon={Clock} title="Route Distance" value={`${routeDistKm.toFixed(1)} km`} subtitle={displayRoute?.description ?? ''} variant="stop" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 space-y-2">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Live Optimised Route Map
            </h2>
            <InteractiveMap
              routes={displayRouteForMap ? [displayRouteForMap] : []}
              buses={displayBusesForMap}
              currentStopId={currentStop?.id}
              selectedPin={selectedPin}
              onMapClick={handleMapClick}
              className="h-[420px]"
              zoom={selectedCity ? 12 : 5}
              center={mapCenter}
            />
            <p className="text-xs text-muted-foreground">🟢 Low · 🟡 Medium · 🔴 High crowd · Blue ring = current stop · Purple = your pin</p>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-5">
            <div className="space-y-2">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Upcoming Stops</h2>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {(nearest ? nearest.remainingStops : displayRoute?.stops ?? []).map((stop, i) => (
                  <div key={stop.id} data-testid={`stop-row-${stop.id}`}
                    className={`glass-card rounded-lg px-3 py-2.5 flex items-center justify-between ${stop.id === currentStop?.id ? 'border-primary/40 bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-muted-foreground font-mono w-4 shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{stop.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {stop.passengerCount} waiting
                          {'etaMinutes' in stop ? ` · ${(stop as { etaMinutes: number }).etaMinutes}min` : ''}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={stop.crowdLevel === 'high' ? 'crowded' : stop.crowdLevel === 'medium' ? 'crowded' : 'stop'} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-500" /> CO₂ Emissions (kg)
              </h2>
              <div className="glass-card rounded-xl p-4 space-y-3">
                <p className="text-xs text-muted-foreground">{routeDistKm.toFixed(1)} km route · per journey</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={co2Data} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v} kg CO₂`, '']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {co2Data.map(e => <Cell key={e.name} fill={CO2_COLORS[e.name] ?? '#94A3B8'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
                  <Leaf className="w-3.5 h-3.5" />
                  Bus saves <b>{savedVsCar} kg CO₂</b> vs car on this route
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">High Crowd Alerts</h2>
              {(nearest ? nearest.remainingStops : displayRoute?.stops ?? []).filter(s => s.crowdLevel === 'high').slice(0, 3).map(stop => (
                <div key={stop.id} className="glass-card rounded-lg p-3 flex items-start gap-3 border-transit-crowded/30">
                  <AlertTriangle className="w-4 h-4 text-transit-crowded mt-0.5 shrink-0" />
                  <p className="text-sm"><b>{stop.name}</b> — {stop.passengerCount} passengers waiting</p>
                </div>
              ))}
              {(nearest ? nearest.remainingStops : displayRoute?.stops ?? []).filter(s => s.crowdLevel === 'high').length === 0 && (
                <p className="text-sm text-muted-foreground italic px-1">No high-crowd alerts ✓</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
