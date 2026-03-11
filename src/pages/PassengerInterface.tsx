import { useState, useEffect } from 'react';
import { QrCode, Clock, Users, Bus, CheckCircle, MapPin, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { api, type Route } from '@/lib/api';

const PASSENGER_ID = `P_${Math.random().toString(36).slice(2, 9)}`;

export default function PassengerInterface() {
  const queryClient = useQueryClient();
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState('R219D');
  const [inQueue, setInQueue] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);

  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ['/api/routes'],
    queryFn: api.getRoutes,
    refetchInterval: 10000,
  });

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const selectedStop = selectedRoute?.stops.find(s => s.id === selectedStopId);

  const { data: crowdInfo, refetch: refetchCrowd } = useQuery({
    queryKey: ['/api/stops', selectedStopId, 'crowd'],
    queryFn: () => api.getStopCrowd(selectedStopId!),
    enabled: !!selectedStopId,
    refetchInterval: 5000,
  });

  const joinMutation = useMutation({
    mutationFn: () => api.joinQueue(selectedStopId!, PASSENGER_ID),
    onSuccess: (data) => {
      setInQueue(true);
      setEtaMinutes(data.etaMinutes);
      queryClient.invalidateQueries({ queryKey: ['/api/stops', selectedStopId, 'crowd'] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => api.leaveQueue(selectedStopId!, PASSENGER_ID),
    onSuccess: () => {
      setInQueue(false);
      setEtaMinutes(null);
      queryClient.invalidateQueries({ queryKey: ['/api/stops', selectedStopId, 'crowd'] });
    },
  });

  function simulateQrScan(stopId: string) {
    setSelectedStopId(stopId);
    setQrScanned(true);
    setInQueue(false);
    setEtaMinutes(null);
  }

  const passengerCount = crowdInfo?.passengerCount ?? selectedStop?.passengerCount ?? 0;
  const crowdLevel = crowdInfo?.crowdLevel ?? selectedStop?.crowdLevel ?? 'low';

  const co2Saved = selectedRoute ? +(selectedRoute.totalDistanceKm * (0.21 - 0.089)).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</Link>
          <div className="w-px h-5 bg-border" />
          <QrCode className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-lg">Passenger</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-md flex flex-col gap-5">

        {/* Route selector */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Route</p>
          <div className="flex flex-wrap gap-2">
            {routes.map(r => (
              <button
                key={r.id}
                data-testid={`passenger-route-${r.id}`}
                onClick={() => { setSelectedRouteId(r.id); setSelectedStopId(null); setQrScanned(false); setInQueue(false); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={selectedRouteId === r.id ? { background: r.color, borderColor: r.color, color: 'white' } : {}}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stop selector — simulate QR scan */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Select Stop (simulates QR scan)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {selectedRoute?.stops.map(stop => (
              <button
                key={stop.id}
                data-testid={`stop-select-${stop.id}`}
                onClick={() => simulateQrScan(stop.id)}
                className={`glass-card rounded-lg px-3 py-2.5 text-left transition-all ${
                  selectedStopId === stop.id ? 'border-primary/60 bg-primary/5' : 'hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium truncate">{stop.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{stop.passengerCount} waiting</span>
                  <StatusBadge status={stop.crowdLevel === 'high' ? 'crowded' : stop.crowdLevel === 'medium' ? 'crowded' : 'stop'} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* QR scan result */}
        {qrScanned && selectedStop && (
          <>
            <div className="glass-card rounded-2xl p-6 w-full text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-xl transit-gradient flex items-center justify-center">
                <QrCode className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">{selectedStop.name}</h2>
                <p className="text-sm text-muted-foreground">QR Code Scanned ✓ · {selectedRoute?.name}</p>
              </div>
            </div>

            {/* Join / Leave Queue */}
            {!inQueue ? (
              <Button
                data-testid="btn-join-queue"
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                size="lg"
                className="w-full h-14 text-lg font-display font-bold transit-gradient hover:opacity-90 transition-opacity text-primary-foreground rounded-xl"
              >
                <Users className="w-5 h-5 mr-2" />
                {joinMutation.isPending ? 'Joining…' : 'I am Waiting at this Stop'}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="w-full glass-card rounded-xl p-5 flex items-center gap-4 border-transit-stop/30 bg-transit-stop/5">
                  <CheckCircle className="w-8 h-8 text-transit-stop shrink-0" />
                  <div>
                    <p className="font-display font-bold text-transit-stop">You're in the queue!</p>
                    <p className="text-sm text-muted-foreground">Driver knows you're waiting</p>
                    {etaMinutes !== null && (
                      <p className="text-sm font-medium mt-0.5">Bus arriving in ~{etaMinutes} min</p>
                    )}
                  </div>
                </div>
                <Button
                  data-testid="btn-leave-queue"
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {leaveMutation.isPending ? 'Leaving…' : 'Leave Queue'}
                </Button>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-4 text-center space-y-1">
                <Clock className="w-5 h-5 mx-auto text-primary" />
                <p className="text-2xl font-display font-bold">{etaMinutes ?? '—'}<span className="text-base"> min</span></p>
                <p className="text-xs text-muted-foreground">Next Bus ETA</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center space-y-1">
                <Users className="w-5 h-5 mx-auto text-transit-crowded" />
                <p className="text-2xl font-display font-bold">{passengerCount}</p>
                <p className="text-xs text-muted-foreground">People Waiting</p>
              </div>
            </div>

            {/* Crowd Level Bar */}
            <div className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Crowd Level</p>
                <StatusBadge status={crowdLevel === 'high' ? 'crowded' : crowdLevel === 'medium' ? 'crowded' : 'low'} />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`h-3 flex-1 rounded-full transition-colors ${
                    i < Math.min(Math.ceil(passengerCount / 3), 10)
                      ? passengerCount > 20 ? 'bg-transit-high' : passengerCount > 10 ? 'bg-transit-medium' : 'bg-transit-low'
                      : 'bg-muted'
                  }`} />
                ))}
              </div>
            </div>

            {/* CO2 Saving */}
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <Leaf className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">You're saving <b>{co2Saved} kg CO₂</b> vs a car</p>
                <p className="text-xs text-muted-foreground">on this {selectedRoute?.totalDistanceKm.toFixed(1)} km route</p>
              </div>
            </div>
          </>
        )}

        {!qrScanned && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl transit-gradient flex items-center justify-center">
              <QrCode className="w-10 h-10 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">Select your route above, then tap a stop to simulate scanning its QR code</p>
          </div>
        )}
      </main>
    </div>
  );
}
