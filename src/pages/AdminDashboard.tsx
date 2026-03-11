import { useState } from 'react';
import { Shield, Bus, MapPin, AlertTriangle, Users, Activity, Leaf, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import InteractiveMap from '@/components/InteractiveMap';
import { api, type Route, type Bus as BusType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const CO2_COLORS = ['#10B981', '#EF4444', '#F59E0B'];

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [mapView, setMapView] = useState<'all' | string>('all');

  const { data: routes = [], isFetching: loadingRoutes } = useQuery<Route[]>({
    queryKey: ['/api/routes'],
    queryFn: api.getRoutes,
    refetchInterval: 12000,
  });

  const { data: buses = [], isFetching: loadingBuses } = useQuery<BusType[]>({
    queryKey: ['/api/buses'],
    queryFn: api.getBuses,
    refetchInterval: 8000,
  });

  const allStops = routes.flatMap(r => r.stops);
  const crowdedStops = allStops.filter(s => s.crowdLevel === 'high');
  const mediumStops = allStops.filter(s => s.crowdLevel === 'medium');
  const totalWaiting = allStops.reduce((sum, s) => sum + s.passengerCount, 0);
  const onTimeBuses = buses.filter(b => b.status === 'on-time').length;

  const displayRoutes = mapView === 'all' ? routes : routes.filter(r => r.id === mapView);
  const displayBuses = mapView === 'all' ? buses : buses.filter(b => b.routeId === mapView);

  // CO2 per route
  const co2Data = routes.map(r => ({
    name: r.name.replace('Route ', ''),
    bus: +(r.totalDistanceKm * 0.089).toFixed(2),
    car: +(r.totalDistanceKm * 0.21).toFixed(2),
  }));

  // Crowd distribution
  const crowdPie = [
    { name: 'Low', value: allStops.filter(s => s.crowdLevel === 'low').length },
    { name: 'Medium', value: mediumStops.length },
    { name: 'High', value: crowdedStops.length },
  ].filter(p => p.value > 0);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
    queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</Link>
            <div className="w-px h-5 bg-border" />
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-lg">RTC Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loadingRoutes || loadingBuses}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loadingRoutes || loadingBuses ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Activity className="w-4 h-4" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Bus} title="Active Buses" value={buses.length} subtitle={`${onTimeBuses} on time`} variant="stop" />
          <StatCard icon={MapPin} title="Total Stops" value={allStops.length} subtitle={`${routes.length} routes`} />
          <StatCard icon={AlertTriangle} title="High Crowd Stops" value={crowdedStops.length} subtitle="Needs attention" variant="crowded" />
          <StatCard icon={Users} title="Total Waiting" value={totalWaiting} subtitle="Across all stops" />
        </div>

        {/* Map view toggle */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mr-1">Map Filter:</span>
          <button
            data-testid="map-filter-all"
            onClick={() => setMapView('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${mapView === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:border-primary/40'}`}
          >All Routes</button>
          {routes.map(r => (
            <button
              key={r.id}
              data-testid={`map-filter-${r.id}`}
              onClick={() => setMapView(r.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={mapView === r.id ? { background: r.color, borderColor: r.color, color: 'white' } : {}}
            >{r.name}</button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 space-y-2">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              System Map — All Buses & Routes
            </h2>
            <InteractiveMap
              routes={displayRoutes}
              buses={displayBuses}
              className="h-[440px]"
              zoom={12}
              center={[17.42, 78.47]}
            />
            <p className="text-xs text-muted-foreground">🟢 Low · 🟡 Medium · 🔴 High crowd · Bus tags = active vehicles</p>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Crowded stops */}
            <div className="space-y-2">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">High Crowd Stops</h2>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {crowdedStops.length === 0 && (
                  <p className="text-sm text-muted-foreground italic px-1">No high-crowd stops right now ✓</p>
                )}
                {crowdedStops.map(stop => (
                  <div key={stop.id} className="glass-card rounded-lg px-3 py-2.5 flex items-center justify-between border-transit-crowded/30">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-transit-high" />
                      <div>
                        <p className="text-sm font-medium leading-tight">{stop.name}</p>
                        <p className="text-xs text-muted-foreground">{stop.passengerCount} waiting</p>
                      </div>
                    </div>
                    <StatusBadge status="crowded" />
                  </div>
                ))}
                {mediumStops.map(stop => (
                  <div key={stop.id} className="glass-card rounded-lg px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-transit-medium" />
                      <div>
                        <p className="text-sm font-medium leading-tight">{stop.name}</p>
                        <p className="text-xs text-muted-foreground">{stop.passengerCount} waiting</p>
                      </div>
                    </div>
                    <StatusBadge status="crowded" label="Medium" />
                  </div>
                ))}
              </div>
            </div>

            {/* Crowd distribution pie */}
            {crowdPie.length > 0 && (
              <div className="glass-card rounded-xl p-4 space-y-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Crowd Distribution</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={crowdPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {crowdPie.map((_, i) => <Cell key={i} fill={CO2_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* CO2 comparison */}
            <div className="glass-card rounded-xl p-4 space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-green-500" /> CO₂ Bus vs Car (kg/route)
              </h3>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={co2Data} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number, name: string) => [`${v} kg`, name === 'bus' ? 'Bus' : 'Car']} />
                  <Bar dataKey="bus" fill="#10B981" radius={[3, 3, 0, 0]} name="Bus" />
                  <Bar dataKey="car" fill="#EF4444" radius={[3, 3, 0, 0]} name="Car" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Buses Table */}
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Active Fleet</h2>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Bus</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Route</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Driver</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Current Stop</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Next Stop</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Passengers</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus, i) => (
                    <tr key={bus.id} data-testid={`bus-row-${bus.id}`} className={`border-b border-border/50 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                      <td className="px-4 py-3 font-bold" style={{ color: bus.route?.color ?? '#3B82F6' }}>{bus.number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{bus.route?.name}</td>
                      <td className="px-4 py-3">{bus.driver}</td>
                      <td className="px-4 py-3">{bus.currentStop?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{bus.nextStop?.name ?? 'End'}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{bus.passengerCount}</span>
                        <span className="text-muted-foreground text-xs"> /{bus.capacity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={bus.status === 'on-time' ? 'stop' : 'skip'} label={bus.status === 'on-time' ? 'On Time' : 'Delayed'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
