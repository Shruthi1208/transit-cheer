import { useState } from 'react';
import { Navigation, Bus, MapPin, Clock, Users, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import InteractiveMap from '@/components/InteractiveMap';
import CitySelector from '@/components/CitySelector';
import StatusBadge from '@/components/StatusBadge';
import { api, type Bus as BusType, type Route } from '@/lib/api';
import { useCity } from '@/context/CityContext';

export default function BusTracker() {
  const { selectedCity } = useCity();
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const { data: buses = [], dataUpdatedAt } = useQuery<BusType[]>({
    queryKey: ['/api/buses', selectedCity?.id ?? 'all'],
    queryFn: () => api.getBuses(selectedCity?.id),
    refetchInterval: 6000,
  });

  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ['/api/routes', selectedCity?.id ?? 'all'],
    queryFn: () => api.getRoutes(selectedCity?.id),
    refetchInterval: 30000,
  });

  const selectedBus = buses.find(b => b.id === selectedBusId) ?? null;
  const displayRoutes = selectedRouteId
    ? routes.filter(r => r.id === selectedRouteId)
    : selectedBus ? routes.filter(r => r.id === selectedBus.routeId) : routes;
  const displayBuses = selectedRouteId
    ? buses.filter(b => b.routeId === selectedRouteId)
    : buses;

  const mapCenter: [number, number] = selectedBus?.currentStop
    ? [selectedBus.currentStop.lat, selectedBus.currentStop.lng]
    : selectedCity?.center ?? [20.5937, 78.9629];
  const mapZoom = selectedBus ? 14 : selectedCity ? 12 : 5;

  const onTimeBuses = buses.filter(b => b.status === 'on-time').length;
  const updatedSec = Math.round((Date.now() - dataUpdatedAt) / 1000);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">← Back</Link>
            <div className="w-px h-5 bg-border shrink-0" />
            <Navigation className="w-5 h-5 text-primary shrink-0" />
            <h1 className="font-display font-bold text-lg truncate">Live Bus Tracker</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <CitySelector compact />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Radio className="w-3.5 h-3.5 text-green-500 animate-pulse" />
              <span className="hidden sm:block">Updated {updatedSec}s ago</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="font-display font-bold text-xl">{buses.length}</p>
            <p className="text-xs text-muted-foreground">Active Buses</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="font-display font-bold text-xl text-green-600">{onTimeBuses}</p>
            <p className="text-xs text-muted-foreground">On Time</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="font-display font-bold text-xl text-transit-crowded">{buses.length - onTimeBuses}</p>
            <p className="text-xs text-muted-foreground">Delayed</p>
          </div>
        </div>

        {/* Route filter */}
        <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
          <button data-testid="tracker-all-routes"
            onClick={() => { setSelectedRouteId(null); setSelectedBusId(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!selectedRouteId ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card'}`}>
            All Routes
          </button>
          {routes.map(r => (
            <button key={r.id} data-testid={`tracker-route-${r.id}`}
              onClick={() => { setSelectedRouteId(r.id); setSelectedBusId(null); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap"
              style={selectedRouteId === r.id ? { background: r.color, borderColor: r.color, color: 'white' } : {}}>
              {r.name}
            </button>
          ))}
        </div>

        <div className="flex-1 grid lg:grid-cols-5 gap-4">
          {/* Map */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Live Positions — {displayBuses.length} bus{displayBuses.length !== 1 ? 'es' : ''} shown
              </h2>
            </div>
            <InteractiveMap
              routes={displayRoutes}
              buses={displayBuses}
              currentStopId={selectedBus?.currentStop?.id}
              className="h-[460px]"
              center={mapCenter}
              zoom={mapZoom}
            />
            <p className="text-xs text-muted-foreground">Bus tags update every 6 seconds · Click a bus tag or stop marker for details</p>
          </div>

          {/* Bus list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Bus Fleet {selectedCity ? `— ${selectedCity.name}` : '(All Cities)'}
            </h2>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {displayBuses.map(bus => (
                <div key={bus.id} data-testid={`tracker-bus-${bus.id}`}
                  onClick={() => setSelectedBusId(bus.id === selectedBusId ? null : bus.id)}
                  className={`glass-card rounded-xl p-3.5 cursor-pointer transition-all hover:border-primary/30 ${selectedBusId === bus.id ? 'border-primary/60 bg-primary/5' : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white font-display font-bold text-xs" style={{ background: bus.route?.color ?? '#3B82F6' }}>
                        {bus.number}
                      </div>
                      <div>
                        <p className="font-medium text-sm leading-tight">{bus.route?.name}</p>
                        <p className="text-xs text-muted-foreground">{bus.cityName} · {bus.driver}</p>
                      </div>
                    </div>
                    <StatusBadge status={bus.status === 'on-time' ? 'stop' : 'skip'} label={bus.status === 'on-time' ? 'On Time' : 'Delayed'} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-muted/40 rounded-lg px-2 py-1.5">
                      <p className="text-xs text-muted-foreground">Current Stop</p>
                      <p className="text-xs font-medium truncate">{bus.currentStop?.name ?? '—'}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg px-2 py-1.5">
                      <p className="text-xs text-muted-foreground">Next Stop</p>
                      <p className="text-xs font-medium truncate">{bus.nextStop?.name ?? 'End'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{bus.passengerCount} on board</span>
                    <span className="flex items-center gap-1"><Bus className="w-3 h-3" />Cap: {bus.capacity}</span>
                    <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${bus.occupancyPct}%`, background: bus.occupancyPct > 80 ? '#EF4444' : bus.occupancyPct > 50 ? '#F59E0B' : '#10B981' }} />
                    </div>
                    <span>{bus.occupancyPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
