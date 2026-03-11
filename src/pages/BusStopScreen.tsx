import { useState } from 'react';
import { MapPin, Users, Clock, Bus, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StatusBadge from '@/components/StatusBadge';
import { api, type Route, type Bus as BusType } from '@/lib/api';

export default function BusStopScreen() {
  const [selectedStopId, setSelectedStopId] = useState('S3'); // JNTU default
  const [selectedRouteId, setSelectedRouteId] = useState('R219D');

  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ['/api/routes'],
    queryFn: api.getRoutes,
    refetchInterval: 8000,
  });

  const { data: buses = [] } = useQuery<BusType[]>({
    queryKey: ['/api/buses'],
    queryFn: api.getBuses,
    refetchInterval: 8000,
  });

  const { data: crowdInfo } = useQuery({
    queryKey: ['/api/stops', selectedStopId, 'crowd'],
    queryFn: () => api.getStopCrowd(selectedStopId),
    enabled: !!selectedStopId,
    refetchInterval: 5000,
  });

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const selectedStop = selectedRoute?.stops.find(s => s.id === selectedStopId);
  const passengerCount = crowdInfo?.passengerCount ?? selectedStop?.passengerCount ?? 0;
  const crowdLevel = crowdInfo?.crowdLevel ?? selectedStop?.crowdLevel ?? 'low';

  // Find approaching bus
  const approachingBus = buses.find(b => b.routeId === selectedRouteId);
  const stopIdx = selectedRoute?.stops.findIndex(s => s.id === selectedStopId) ?? -1;
  const busStopIdx = approachingBus?.currentStopIdx ?? -1;
  const stopsAway = Math.max(0, stopIdx - busStopIdx);
  const etaMinutes = Math.round(stopsAway * 1.5 * 60 / 35);

  const crowdPct = Math.min(Math.ceil(passengerCount / 30 * 10), 10);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</Link>
          <div className="w-px h-5 bg-border" />
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-lg">Bus Stop Display</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-lg flex flex-col gap-5">

        {/* Route + Stop selectors */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Route</p>
            <div className="flex flex-wrap gap-2">
              {routes.map(r => (
                <button
                  key={r.id}
                  data-testid={`busstop-route-${r.id}`}
                  onClick={() => { setSelectedRouteId(r.id); setSelectedStopId(r.stops[0]?.id ?? ''); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={selectedRouteId === r.id ? { background: r.color, borderColor: r.color, color: 'white' } : {}}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stop</p>
            <div className="flex flex-wrap gap-2">
              {selectedRoute?.stops.map(stop => (
                <button
                  key={stop.id}
                  data-testid={`busstop-stop-${stop.id}`}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedStopId === stop.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  {stop.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stop Name */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full transit-gradient flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display font-bold text-3xl">{selectedStop?.name ?? 'Select a stop'}</h2>
          <p className="text-muted-foreground text-sm">{selectedRoute?.name} · Bus Stop</p>
        </div>

        {/* QR Code display */}
        <div className="glass-card rounded-xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Passenger QR Code</p>
            <p className="text-xs text-muted-foreground">Scan to join queue at {selectedStop?.name}</p>
            <p className="text-xs text-primary font-mono mt-0.5">STOP:{selectedStopId}</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5 text-center space-y-2">
            <Users className="w-6 h-6 mx-auto text-transit-crowded" />
            <p className="text-4xl font-display font-bold">{passengerCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Passengers Waiting</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center space-y-2">
            <Clock className="w-6 h-6 mx-auto text-primary" />
            <p className="text-4xl font-display font-bold">{etaMinutes}<span className="text-2xl">m</span></p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Next Bus ETA</p>
          </div>
        </div>

        {/* Bus Info */}
        {approachingBus && (
          <div className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bus className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Bus {approachingBus.number}</p>
                <p className="text-xs text-muted-foreground">
                  {approachingBus.route?.name} · Driver: {approachingBus.driver}
                </p>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge status={approachingBus.status === 'on-time' ? 'stop' : 'skip'} label={approachingBus.status === 'on-time' ? 'On Time' : 'Delayed'} />
              <p className="text-xs text-muted-foreground mt-1">{stopsAway} stops away</p>
            </div>
          </div>
        )}

        {/* Crowd Bar */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Crowd Level</p>
            <StatusBadge status={crowdLevel === 'high' ? 'crowded' : crowdLevel === 'medium' ? 'crowded' : 'low'} />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`h-3 flex-1 rounded-full transition-colors ${
                i < crowdPct
                  ? passengerCount > 20 ? 'bg-transit-high' : passengerCount > 10 ? 'bg-transit-medium' : 'bg-transit-low'
                  : 'bg-muted'
              }`} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low (0–5)</span><span>Medium (6–15)</span><span>High (16+)</span>
          </div>
        </div>

        {/* Live queue */}
        {crowdInfo && crowdInfo.queue.length > 0 && (
          <div className="glass-card rounded-xl p-4 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Live Queue ({crowdInfo.queue.length})</p>
            <div className="flex flex-wrap gap-2">
              {crowdInfo.queue.slice(0, 8).map((p, i) => (
                <span key={p.id} className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  #{i + 1} Passenger
                </span>
              ))}
              {crowdInfo.queue.length > 8 && (
                <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  +{crowdInfo.queue.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
