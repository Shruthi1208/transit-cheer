import { useState, useRef } from 'react';
import { Map, Navigation, Clock, Leaf, Users, MapPin, ArrowRight, Footprints, Bus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CitySelector from '@/components/CitySelector';
import InteractiveMap from '@/components/InteractiveMap';
import { api, type TripPlan, type Route, type StopWithCrowd } from '@/lib/api';
import { useCity } from '@/context/CityContext';
import { useQuery } from '@tanstack/react-query';

type PinMode = 'origin' | 'dest' | null;
type PinState = { lat: number; lng: number; label: string };

const CITY_SAMPLE: Record<string, { origin: [number, number]; dest: [number, number] }> = {
  HYD: { origin: [17.4947, 78.3996], dest: [17.3850, 78.4858] },
  BLR: { origin: [12.9766, 77.5713], dest: [12.8399, 77.6770] },
  CHN: { origin: [13.0839, 80.2758], dest: [12.9249, 80.1000] },
  MUM: { origin: [18.9398, 72.8355], dest: [19.2294, 72.8567] },
  DEL: { origin: [28.6675, 77.2281], dest: [28.5685, 77.2100] },
  KOL: { origin: [22.5839, 88.3425], dest: [22.5211, 88.3669] },
  PUN: { origin: [18.5308, 73.8475], dest: [18.5019, 73.9260] },
  AHM: { origin: [23.0781, 72.6528], dest: [23.0297, 72.5869] },
  JAI: { origin: [26.9855, 75.8513], dest: [26.8186, 75.7981] },
  LKO: { origin: [26.8044, 80.9139], dest: [26.8631, 80.9939] },
};

export default function TripPlanner() {
  const { selectedCity } = useCity();
  const [oLat, setOLat] = useState('');
  const [oLng, setOLng] = useState('');
  const [dLat, setDLat] = useState('');
  const [dLng, setDLng] = useState('');
  const [pinMode, setPinMode] = useState<PinMode>(null);
  const [originPin, setOriginPin] = useState<PinState | null>(null);
  const [destPin, setDestPin] = useState<PinState | null>(null);
  const [result, setResult] = useState<TripPlan | null>(null);

  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ['/api/routes', selectedCity?.id ?? 'all'],
    queryFn: () => api.getRoutes(selectedCity?.id),
    staleTime: 30000,
  });

  const planMutation = useMutation({
    mutationFn: () => api.planTrip(parseFloat(oLat), parseFloat(oLng), parseFloat(dLat), parseFloat(dLng), selectedCity?.id),
    onSuccess: (data) => {
      setResult(data);
      if (data.boardStop) setOriginPin({ lat: parseFloat(oLat), lng: parseFloat(oLng), label: 'Origin' });
      if (data.alightStop) setDestPin({ lat: parseFloat(dLat), lng: parseFloat(dLng), label: 'Destination' });
    },
  });

  function handleMapClick(lat: number, lng: number) {
    if (pinMode === 'origin') {
      setOLat(lat.toFixed(6)); setOLng(lng.toFixed(6));
      setOriginPin({ lat, lng, label: 'Origin' });
      setPinMode('dest');
    } else if (pinMode === 'dest') {
      setDLat(lat.toFixed(6)); setDLng(lng.toFixed(6));
      setDestPin({ lat, lng, label: 'Destination' });
      setPinMode(null);
    }
  }

  function loadSample() {
    const cityId = selectedCity?.id ?? 'HYD';
    const sample = CITY_SAMPLE[cityId] ?? CITY_SAMPLE.HYD;
    setOLat(sample.origin[0].toFixed(4)); setOLng(sample.origin[1].toFixed(4));
    setDLat(sample.dest[0].toFixed(4)); setDLng(sample.dest[1].toFixed(4));
    setOriginPin({ lat: sample.origin[0], lng: sample.origin[1], label: 'Origin' });
    setDestPin({ lat: sample.dest[0], lng: sample.dest[1], label: 'Destination' });
  }

  const canPlan = oLat && oLng && dLat && dLng && !isNaN(parseFloat(oLat)) && !isNaN(parseFloat(dLat));
  const resultRoute = result?.route ? routes.find(r => r.id === result.route!.id) : undefined;
  const mapCenter: [number, number] = selectedCity?.center ?? [20.5937, 78.9629];
  const mapZoom = selectedCity ? 12 : 5;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">← Back</Link>
            <div className="w-px h-5 bg-border shrink-0" />
            <Map className="w-5 h-5 text-primary shrink-0" />
            <h1 className="font-display font-bold text-lg truncate">Trip Planner</h1>
          </div>
          <CitySelector compact />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-5 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: inputs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Journey Details</h2>
                <button onClick={loadSample} className="text-xs text-primary hover:underline">Load Sample</button>
              </div>

              {/* Pin mode toggle */}
              <div className="flex gap-2">
                <button data-testid="pin-mode-origin"
                  onClick={() => setPinMode(pinMode === 'origin' ? null : 'origin')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${pinMode === 'origin' ? 'bg-green-500 text-white border-green-500' : 'border-border bg-card hover:border-green-400'}`}>
                  📍 Click map for Origin
                </button>
                <button data-testid="pin-mode-dest"
                  onClick={() => setPinMode(pinMode === 'dest' ? null : 'dest')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${pinMode === 'dest' ? 'bg-red-500 text-white border-red-500' : 'border-border bg-card hover:border-red-400'}`}>
                  🏁 Click map for Dest
                </button>
              </div>
              {pinMode && <p className="text-xs text-primary animate-pulse">Click on the map to set {pinMode}…</p>}

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Origin Latitude</Label>
                  <Input data-testid="trip-origin-lat" value={oLat} onChange={e => setOLat(e.target.value)} placeholder="e.g. 17.4947" className="h-9 text-sm font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Origin Longitude</Label>
                  <Input data-testid="trip-origin-lng" value={oLng} onChange={e => setOLng(e.target.value)} placeholder="e.g. 78.3996" className="h-9 text-sm font-mono" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex-1 h-px bg-border" />
                  <ArrowRight className="w-3 h-3" />
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Destination Latitude</Label>
                  <Input data-testid="trip-dest-lat" value={dLat} onChange={e => setDLat(e.target.value)} placeholder="e.g. 17.3850" className="h-9 text-sm font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Destination Longitude</Label>
                  <Input data-testid="trip-dest-lng" value={dLng} onChange={e => setDLng(e.target.value)} placeholder="e.g. 78.4858" className="h-9 text-sm font-mono" />
                </div>
              </div>

              <Button data-testid="btn-plan-trip" onClick={() => planMutation.mutate()} disabled={!canPlan || planMutation.isPending}
                className="w-full transit-gradient text-primary-foreground font-display font-bold">
                {planMutation.isPending ? 'Planning…' : 'Plan My Trip'}
              </Button>
            </div>

            {/* Result */}
            {result && result.type === 'direct' && (
              <div className="space-y-3">
                <div className="glass-card rounded-xl p-4 border-primary/20 bg-primary/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-primary" />
                    <span className="font-display font-bold text-sm" style={{ color: result.route?.color }}>{result.route?.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{result.city?.name} · {result.city?.system}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-card rounded-lg p-2.5">
                      <Clock className="w-4 h-4 mx-auto text-primary mb-0.5" />
                      <p className="font-display font-bold text-base">{result.estimatedMinutes}m</p>
                      <p className="text-xs text-muted-foreground">Total time</p>
                    </div>
                    <div className="bg-card rounded-lg p-2.5">
                      <Navigation className="w-4 h-4 mx-auto text-blue-500 mb-0.5" />
                      <p className="font-display font-bold text-base">{result.routeDistanceKm} km</p>
                      <p className="text-xs text-muted-foreground">By bus</p>
                    </div>
                    <div className="bg-card rounded-lg p-2.5">
                      <Leaf className="w-4 h-4 mx-auto text-green-500 mb-0.5" />
                      <p className="font-display font-bold text-base">{result.co2?.savedVsCar} kg</p>
                      <p className="text-xs text-muted-foreground">CO₂ saved</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <Footprints className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <p className="text-xs">Walk <b>{result.walkToStop?.distanceKm} km</b> ({result.walkToStop?.minutes} min) to <b>{result.boardStop?.name}</b></p>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg">
                      <Bus className="w-3.5 h-3.5 text-primary shrink-0" />
                      <p className="text-xs">Board at <b>{result.boardStop?.name}</b> · {result.boardStop?.passengerCount} waiting</p>
                    </div>
                    <div className="flex items-start gap-1.5 pl-6">
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        {result.intermediateStops?.slice(1, -1).map(s => (
                          <p key={s.id} className="text-xs text-muted-foreground">↓ {s.name} ({s.etaMinutes}min)</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <p className="text-xs">Alight at <b>{result.alightStop?.name}</b></p>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
                      <Footprints className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <p className="text-xs">Walk <b>{result.walkFromStop?.distanceKm} km</b> ({result.walkFromStop?.minutes} min) to destination</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                    {[{ label: 'Bus', value: result.co2?.bus, color: 'text-green-600' }, { label: 'Auto', value: result.co2?.auto, color: 'text-amber-600' }, { label: 'Car', value: result.co2?.car, color: 'text-red-600' }, { label: 'Walk', value: '0', color: 'text-gray-500' }].map(c => (
                      <div key={c.label} className="bg-card rounded-lg p-2">
                        <p className={`font-bold text-xs ${c.color}`}>{c.value} kg</p>
                        <p className="text-xs text-muted-foreground">{c.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {result && result.type === 'no-direct-route' && (
              <div className="glass-card rounded-xl p-4 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                <p className="font-medium text-sm text-amber-700 dark:text-amber-400">No direct route found</p>
                <p className="text-xs text-muted-foreground">Consider a transfer between routes</p>
                {result.nearestToOrigin && <p className="text-xs">Nearest to origin: <b>{result.nearestToOrigin.stop.name}</b> ({result.nearestToOrigin.route.name})</p>}
                {result.nearestToDest && <p className="text-xs">Nearest to destination: <b>{result.nearestToDest.stop.name}</b> ({result.nearestToDest.route.name})</p>}
              </div>
            )}
          </div>

          {/* Right: map */}
          <div className="lg:col-span-3 space-y-2">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Map className="w-4 h-4" /> Route Map
              {pinMode && <span className="text-xs text-primary font-normal animate-pulse">— Click to set {pinMode}</span>}
            </h2>
            <InteractiveMap
              routes={resultRoute ? [resultRoute] : routes.slice(0, selectedCity ? 10 : 2)}
              buses={[]}
              selectedPin={originPin}
              destPin={destPin}
              onMapClick={handleMapClick}
              highlightStopIds={result?.type === 'direct' ? [result.boardStop?.id ?? '', result.alightStop?.id ?? ''] : []}
              className="h-[560px]"
              center={mapCenter}
              zoom={mapZoom}
            />
            <p className="text-xs text-muted-foreground">🟢 Board stop · 🔴 Alight stop · Purple = origin · Orange = destination</p>
          </div>
        </div>
      </main>
    </div>
  );
}
