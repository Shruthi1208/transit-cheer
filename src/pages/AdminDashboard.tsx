import { useState } from 'react';
import { Shield, Bus, MapPin, AlertTriangle, Users, Activity, Leaf, RefreshCw, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import InteractiveMap from '@/components/InteractiveMap';
import CitySelector from '@/components/CitySelector';
import { api, type Route, type Bus as BusType, type SystemStats } from '@/lib/api';
import { useCity } from '@/context/CityContext';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const CO2_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { selectedCity } = useCity();
  const [mapRouteFilter, setMapRouteFilter] = useState<string>('all');

  const { data: routes = [], isFetching: loadingRoutes } = useQuery<Route[]>({
    queryKey: ['/api/routes', selectedCity?.id ?? 'all'],
    queryFn: () => api.getRoutes(selectedCity?.id),
    refetchInterval: 12000,
  });

  const { data: buses = [], isFetching: loadingBuses } = useQuery<BusType[]>({
    queryKey: ['/api/buses', selectedCity?.id ?? 'all'],
    queryFn: () => api.getBuses(selectedCity?.id),
    refetchInterval: 8000,
  });

  const { data: stats } = useQuery<SystemStats>({
    queryKey: ['/api/stats'],
    queryFn: api.getStats,
    refetchInterval: 15000,
  });

  const allStops = routes.flatMap(r => r.stops);
  const crowdedStops = allStops.filter(s => s.crowdLevel === 'high');
  const mediumStops = allStops.filter(s => s.crowdLevel === 'medium');
  const totalWaiting = allStops.reduce((sum, s) => sum + s.passengerCount, 0);
  const onTimeBuses = buses.filter(b => b.status === 'on-time').length;

  const displayRoutes = mapRouteFilter === 'all' ? routes : routes.filter(r => r.id === mapRouteFilter);
  const displayBuses = mapRouteFilter === 'all' ? buses : buses.filter(b => b.routeId === mapRouteFilter);

  const co2Data = routes.slice(0, 8).map(r => ({
    name: r.name.replace('Route ', '').replace('BRTS ', ''),
    bus: +(r.totalDistanceKm * 0.089).toFixed(2),
    car: +(r.totalDistanceKm * 0.21).toFixed(2),
  }));

  const crowdPie = [
    { name: 'Low',    value: allStops.filter(s => s.crowdLevel === 'low').length },
    { name: 'Medium', value: mediumStops.length },
    { name: 'High',   value: crowdedStops.length },
  ].filter(p => p.value > 0);

  const mapCenter: [number, number] = selectedCity?.center ?? [20.5937, 78.9629];
  const mapZoom = selectedCity ? 12 : 5;

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
    queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
    queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">← Back</Link>
            <div className="w-px h-5 bg-border shrink-0" />
            <Shield className="w-5 h-5 text-primary shrink-0" />
            <h1 className="font-display font-bold text-lg truncate">RTC Admin</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <CitySelector compact />
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loadingRoutes || loadingBuses} className="h-8 px-2">
              <RefreshCw className={`w-4 h-4 ${loadingRoutes || loadingBuses ? 'animate-spin' : ''}`} />
            </Button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Activity className="w-4 h-4" /><span className="hidden sm:block">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* System overview banner when no city selected */}
        {!selectedCity && stats && (
          <div className="glass-card rounded-xl p-4 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold text-sm">India-wide Overview</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {stats.cityStats.map(city => (
                <div key={city.id} className="text-center">
                  <p className="font-display font-bold text-sm">{city.name}</p>
                  <p className="text-xs text-muted-foreground">{city.activeBuses} buses</p>
                  <p className="text-xs font-medium text-transit-crowded">{city.totalWaiting} waiting</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Bus} title="Active Buses" value={buses.length} subtitle={`${onTimeBuses} on time`} variant="stop" />
          <StatCard icon={MapPin} title="Stops Monitored" value={new Set(allStops.map(s => s.id)).size} subtitle={`${routes.length} routes`} />
          <StatCard icon={AlertTriangle} title="High Crowd" value={crowdedStops.length} subtitle="Stops needing attention" variant="crowded" />
          <StatCard icon={Users} title="Total Waiting" value={totalWaiting} subtitle={selectedCity ? selectedCity.name : 'All cities'} />
        </div>

        {/* Map filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mr-1">Route Filter:</span>
          <button data-testid="map-filter-all" onClick={() => setMapRouteFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${mapRouteFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card'}`}>
            All Routes
          </button>
          {routes.map(r => (
            <button key={r.id} data-testid={`map-filter-${r.id}`} onClick={() => setMapRouteFilter(r.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap"
              style={mapRouteFilter === r.id ? { background: r.color, borderColor: r.color, color: 'white' } : {}}>
              {r.name}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 space-y-2">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              System Map — {selectedCity ? selectedCity.name : 'All India'} {displayBuses.length > 0 ? `· ${displayBuses.length} buses` : ''}
            </h2>
            <InteractiveMap routes={displayRoutes} buses={displayBuses} className="h-[440px]" zoom={mapZoom} center={mapCenter} />
            <p className="text-xs text-muted-foreground">🟢 Low · 🟡 Medium · 🔴 High crowd · Coloured tags = active buses</p>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-5">
            <div className="space-y-2">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">High Crowd Stops</h2>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {crowdedStops.length === 0 && <p className="text-sm text-muted-foreground italic px-1">No high-crowd stops ✓</p>}
                {[...crowdedStops.slice(0, 5), ...mediumStops.slice(0, 3)].map(stop => (
                  <div key={stop.id} className={`glass-card rounded-lg px-3 py-2 flex items-center justify-between ${stop.crowdLevel === 'high' ? 'border-transit-crowded/30' : ''}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${stop.crowdLevel === 'high' ? 'text-transit-high' : 'text-transit-medium'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{stop.name}</p>
                        <p className="text-xs text-muted-foreground">{stop.passengerCount} waiting · {stop.cityId}</p>
                      </div>
                    </div>
                    <StatusBadge status={stop.crowdLevel === 'high' ? 'crowded' : 'crowded'} label={stop.crowdLevel === 'high' ? 'High' : 'Med'} />
                  </div>
                ))}
              </div>
            </div>

            {crowdPie.length > 0 && (
              <div className="glass-card rounded-xl p-4 space-y-1">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Crowd Distribution</h3>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={crowdPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40}
                      label={({ name, value }) => `${name}:${value}`} labelLine={false}>
                      {crowdPie.map((_, i) => <Cell key={i} fill={CO2_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {co2Data.length > 0 && (
              <div className="glass-card rounded-xl p-4 space-y-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-green-500" /> CO₂ Bus vs Car (kg/route)
                </h3>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={co2Data} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(v: number, n: string) => [`${v} kg`, n === 'bus' ? 'Bus' : 'Car']} />
                    <Bar dataKey="bus" fill="#10B981" radius={[3, 3, 0, 0]} name="Bus" />
                    <Bar dataKey="car" fill="#EF4444" radius={[3, 3, 0, 0]} name="Car" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Fleet table */}
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Active Fleet ({buses.length} buses)
          </h2>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Bus', 'City', 'Route', 'Driver', 'Current Stop', 'Next Stop', 'Passengers', 'Status'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus, i) => (
                    <tr key={bus.id} data-testid={`bus-row-${bus.id}`} className={`border-b border-border/50 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                      <td className="px-3 py-2 font-bold whitespace-nowrap" style={{ color: bus.route?.color ?? '#3B82F6' }}>{bus.number}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">{bus.cityName}<br /><span className="text-muted-foreground">{bus.system}</span></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{bus.route?.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{bus.driver}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">{bus.currentStop?.name ?? '—'}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{bus.nextStop?.name ?? 'End'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-medium">{bus.passengerCount}</span>
                        <span className="text-muted-foreground text-xs">/{bus.capacity}</span>
                      </td>
                      <td className="px-3 py-2">
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
