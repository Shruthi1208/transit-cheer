import { useState } from 'react';
import { Bus, MapPin, Users, Navigation, Clock, Leaf, AlertTriangle, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import InteractiveMap from '@/components/InteractiveMap';
import { api, type Route, type NearestResult, type Bus as BusType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CO2_COLORS: Record<string, string> = { Bus: '#10B981', Car: '#EF4444', Auto: '#F59E0B', Walk: '#6B7280' };

export default function DriverDashboard() {
  const [selectedRouteId, setSelectedRouteId] = useState('R219D');
  const [inputLat, setInputLat] = useState('17.4947');
  const [inputLng, setInputLng] = useState('78.3996');
  const [nearest, setNearest] = useState<NearestResult | null>(null);
  const [loadingNearest, setLoadingNearest] = useState(false);
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number; label?: string } | null>(null);

  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ['/api/routes'],
    queryFn: api.getRoutes,
    refetchInterval: 15000,
  });

  const { data: buses = [] } = useQuery<BusType[]>({
    queryKey: ['/api/buses'],
    queryFn: api.getBuses,
    refetchInterval: 8000,
  });

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const activeBus = buses.find((b) => b.routeId === selectedRouteId);
  const currentStop = activeBus?.currentStop;
  const nextStop = activeBus?.nextStop;
  const displayRoute = nearest ? routes.find(r => r.id === nearest.route.id) || selectedRoute : selectedRoute;

  async function handleFindRoute() {
    const parsedLat = parseFloat(inputLat);
    const parsedLng = parseFloat(inputLng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) return;
    setSelectedPin({ lat: parsedLat, lng: parsedLng, label: 'Your Location' });
    setLoadingNearest(true);
    try {
      const result = await api.findNearest(parsedLat, parsedLng);
      setNearest(result);
      setSelectedRouteId(result.route.id);
    } finally {
      setLoadingNearest(false);
    }
  }

  function handleMapClick(clickLat: number, clickLng: number) {
    setInputLat(clickLat.toFixed(6));
    setInputLng(clickLng.toFixed(6));
    setSelectedPin({ lat: clickLat, lng: clickLng, label: 'Selected Location' });
  }

  const routeDistKm = displayRoute?.totalDistanceKm ?? 10;
  const co2Data = [
    { name: 'Bus',  value: nearest?.co2.bus  ?? +(routeDistKm * 0.089).toFixed(3) },
    { name: 'Auto', value: nearest?.co2.auto ?? +(routeDistKm * 0.12).toFixed(3)  },
    { name: 'Car',  value: nearest?.co2.car  ?? +(routeDistKm * 0.21).toFixed(3)  },
    { name: 'Walk', value: 0 },
  ];

  const totalWaiting = selectedRoute?.stops.reduce((s, stop) => s + stop.passengerCount, 0) ?? 0;
  const savedVsCar = nearest?.co2.savedVsCar ?? +(routeDistKm * (0.21 - 0.089)).toFixed(3);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</Link>
            <div className="w-px h-5 bg-border" />
            <Bus className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-lg">Driver Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-transit-stop animate-pulse" />
            <span>{activeBus ? `Bus ${activeBus.number} — ${activeBus.route?.name}` : 'Loading…'}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Route Selector */}
        <div className="flex flex-wrap gap-2">
          {routes.map(r => (
            <button
              key={r.id}
              data-testid={`route-btn-${r.id}`}
              onClick={() => { setSelectedRouteId(r.id); setNearest(null); setSelectedPin(null); }}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
              style={
                selectedRouteId === r.id && !nearest
                  ? { background: r.color, borderColor: r.color, color: 'white' }
                  : {}
              }
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Lat / Lng Input */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-sm">Find Optimised Route from Coordinates</span>
            <span className="text-xs text-muted-foreground ml-auto hidden sm:block">or click on map</span>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[120px] space-y-1">
              <Label htmlFor="lat" className="text-xs">Latitude</Label>
              <Input id="lat" data-testid="input-lat" value={inputLat} onChange={e => setInputLat(e.target.value)} placeholder="17.4947" className="h-9 text-sm" />
            </div>
            <div className="flex-1 min-w-[120px] space-y-1">
              <Label htmlFor="lng" className="text-xs">Longitude</Label>
              <Input id="lng" data-testid="input-lng" value={inputLng} onChange={e => setInputLng(e.target.value)} placeholder="78.3996" className="h-9 text-sm" />
            </div>
            <Button data-testid="btn-find-route" onClick={handleFindRoute} disabled={loadingNearest} size="sm" className="h-9">
              {loadingNearest ? 'Finding…' : 'Find Route'}
            </Button>
          </div>
          {nearest && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-0.5">
              <p className="text-sm font-medium">Nearest stop: <b>{nearest.nearestStop.name}</b> ({nearest.distanceToStopKm} km away)</p>
              <p className="text-xs text-muted-foreground">{nearest.route.name} · {nearest.remainingStops.length} stops remaining · {nearest.co2.distanceKm} km</p>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MapPin} title="Current Stop" value={currentStop?.name ?? '—'} subtitle={`Stop ${(activeBus?.currentStopIdx ?? 0) + 1} of ${displayRoute?.stops.length ?? '—'}`} />
          <StatCard icon={Navigation} title="Next Stop" value={nextStop?.name ?? 'End'} subtitle="Next major halt" />
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
              routes={displayRoute ? [displayRoute] : []}
              buses={buses.filter(b => b.routeId === (displayRoute?.id ?? selectedRouteId))}
              currentStopId={currentStop?.id}
              selectedPin={selectedPin}
              onMapClick={handleMapClick}
              className="h-[420px]"
              zoom={13}
              center={currentStop ? [currentStop.lat, currentStop.lng] : [17.4401, 78.4989]}
            />
            <p className="text-xs text-muted-foreground">🟢 Low crowd · 🟡 Medium · 🔴 High crowd · Blue ring = current stop · Purple = your pin</p>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Upcoming Stops */}
            <div className="space-y-2">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Upcoming Stops</h2>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {(nearest ? nearest.remainingStops : displayRoute?.stops ?? []).map((stop, i) => (
                  <div key={stop.id} data-testid={`stop-row-${stop.id}`}
                    className={`glass-card rounded-lg px-3 py-2.5 flex items-center justify-between ${stop.id === currentStop?.id ? 'border-primary/40 bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono w-4">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium leading-tight">{stop.name}</p>
                        <p className="text-xs text-muted-foreground">{stop.passengerCount} waiting
                          {'etaMinutes' in stop ? ` · ${(stop as {etaMinutes:number}).etaMinutes}min` : ''}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={stop.crowdLevel === 'high' ? 'crowded' : stop.crowdLevel === 'medium' ? 'crowded' : 'stop'} />
                  </div>
                ))}
              </div>
            </div>

            {/* CO2 Comparison */}
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
                      {co2Data.map(entry => <Cell key={entry.name} fill={CO2_COLORS[entry.name] ?? '#94A3B8'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
                  <Leaf className="w-3.5 h-3.5" />
                  Bus saves <b>{savedVsCar} kg CO₂</b> vs car on this route
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-2">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">High Crowd Alerts</h2>
              {(nearest ? nearest.remainingStops : displayRoute?.stops ?? [])
                .filter(s => s.crowdLevel === 'high').slice(0, 3)
                .map(stop => (
                  <div key={stop.id} className="glass-card rounded-lg p-3 flex items-start gap-3 border-transit-crowded/30">
                    <AlertTriangle className="w-4 h-4 text-transit-crowded mt-0.5 shrink-0" />
                    <p className="text-sm"><b>{stop.name}</b> — {stop.passengerCount} passengers (high crowd)</p>
                  </div>
                ))}
              {(nearest ? nearest.remainingStops : displayRoute?.stops ?? []).filter(s => s.crowdLevel === 'high').length === 0 && (
                <p className="text-sm text-muted-foreground italic px-1">No high-crowd stops on this route ✓</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
