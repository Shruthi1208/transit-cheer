import { useState } from 'react';
import { Activity, MapPin, TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import CitySelector from '@/components/CitySelector';
import InteractiveMap from '@/components/InteractiveMap';
import StatusBadge from '@/components/StatusBadge';
import { api, type HeatmapData, type Route } from '@/lib/api';
import { useCity } from '@/context/CityContext';

const SLOT_COLORS: Record<string, string> = {
  'morning-peak': '#EF4444', 'evening-peak': '#DC2626',
  'mid-morning': '#F59E0B', 'lunch': '#F59E0B',
  'afternoon': '#10B981', 'evening': '#6B7280', 'night': '#1E293B',
};

const TIME_LABELS = [
  { slot: '05:00–09:00', label: 'Morning Peak', mult: 1.8 },
  { slot: '09:00–12:00', label: 'Mid-Morning', mult: 0.9 },
  { slot: '12:00–14:00', label: 'Lunch',        mult: 1.1 },
  { slot: '14:00–17:00', label: 'Afternoon',     mult: 0.7 },
  { slot: '17:00–20:00', label: 'Evening Peak',  mult: 1.9 },
  { slot: '20:00–22:00', label: 'Evening',       mult: 0.6 },
  { slot: '22:00–05:00', label: 'Night',         mult: 0.05 },
];

export default function CrowdHeatmap() {
  const { selectedCity } = useCity();
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const { data: heatmap } = useQuery<HeatmapData>({
    queryKey: ['/api/heatmap', selectedCity?.id ?? 'all'],
    queryFn: () => api.getHeatmap(selectedCity?.id),
    refetchInterval: 30000,
  });

  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ['/api/routes', selectedCity?.id ?? 'all'],
    queryFn: () => api.getRoutes(selectedCity?.id),
    staleTime: 60000,
  });

  const stops = heatmap?.stops ?? [];
  const sorted = [...stops].sort((a, b) => b.passengerCount - a.passengerCount);
  const topStops = sorted.slice(0, 8);
  const highCrowd = stops.filter(s => s.crowdLevel === 'high');
  const medCrowd = stops.filter(s => s.crowdLevel === 'medium');
  const selectedStop = selectedStopId ? stops.find(s => s.id === selectedStopId) : null;

  const barData = topStops.map(s => ({ name: s.name.slice(0, 12), current: s.passengerCount, forecast: s.forecastedCount }));

  const demandLine = TIME_LABELS.map(t => ({
    slot: t.slot.split('–')[0],
    label: t.label,
    demand: Math.round(t.mult * 100),
    color: SLOT_COLORS[t.slot.includes('09') ? 'mid-morning' : t.slot.includes('05') ? 'morning-peak' : t.slot.includes('17') ? 'evening-peak' : t.slot.includes('12') ? 'lunch' : t.slot.includes('14') ? 'afternoon' : t.slot.includes('20') ? 'evening' : 'night'],
  }));

  const mapCenter: [number, number] = selectedCity?.center ?? [20.5937, 78.9629];
  const mapZoom = selectedCity ? 12 : 5;
  const currentSlotColor = SLOT_COLORS[heatmap?.timeSlot ?? 'afternoon'] ?? '#6B7280';

  const crowdRoutes = routes.map(r => ({
    ...r,
    stops: r.stops.map(stop => {
      const hStop = stops.find(s => s.id === stop.id);
      return hStop ? { ...stop, passengerCount: hStop.forecastedCount, crowdLevel: hStop.forecastedCrowdLevel } : stop;
    }),
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">← Back</Link>
            <div className="w-px h-5 bg-border shrink-0" />
            <Activity className="w-5 h-5 text-primary shrink-0" />
            <h1 className="font-display font-bold text-lg truncate">Demand Heatmap</h1>
          </div>
          <CitySelector compact />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Current time context */}
        <div className="glass-card rounded-xl p-4 flex items-center gap-4" style={{ borderColor: currentSlotColor + '50' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: currentSlotColor + '20' }}>
            <Clock className="w-5 h-5" style={{ color: currentSlotColor }} />
          </div>
          <div>
            <p className="font-display font-bold text-base">Currently: {heatmap?.timeSlot?.replace('-', ' ')} (Hour {heatmap?.currentHour}:00)</p>
            <p className="text-xs text-muted-foreground">Demand multiplier active · Forecasts adjust automatically throughout the day</p>
          </div>
          <div className="ml-auto flex gap-3 text-sm">
            <span className="text-transit-high font-medium">{highCrowd.length} high-crowd stops</span>
            <span className="text-transit-medium">{medCrowd.length} medium</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Stops', value: stops.length, icon: MapPin },
            { label: 'High Crowd', value: highCrowd.length, icon: AlertTriangle, color: 'text-transit-high' },
            { label: 'Medium Crowd', value: medCrowd.length, icon: Users, color: 'text-transit-medium' },
            { label: 'Total Waiting', value: stops.reduce((s, st) => s + st.passengerCount, 0), icon: TrendingUp },
          ].map(c => (
            <div key={c.label} className="glass-card rounded-xl p-4 text-center">
              <c.icon className={`w-5 h-5 mx-auto mb-1.5 ${c.color ?? 'text-primary'}`} />
              <p className="font-display font-bold text-2xl">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 space-y-2">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Live Crowd Map — {selectedCity?.name ?? 'All Cities'} (Forecasted)
            </h2>
            <InteractiveMap routes={crowdRoutes} buses={[]} className="h-[420px]" center={mapCenter} zoom={mapZoom} />
            <p className="text-xs text-muted-foreground">Stop colours show <b>forecasted</b> crowd for current time slot · Click a stop to see full forecast</p>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Demand curve */}
            <div className="glass-card rounded-xl p-4 space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Daily Demand Pattern</h3>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={demandLine} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="slot" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Relative demand']} labelFormatter={(_: string, p: { payload?: { label: string } }[]) => p[0]?.payload?.label ?? ''} />
                  <Line type="monotone" dataKey="demand" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Demand %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top stops bar */}
            <div className="glass-card rounded-xl p-4 space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Busiest Stops (Current vs Forecast)</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 5, left: -5, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={65} />
                  <Tooltip formatter={(v: number, n: string) => [v, n === 'current' ? 'Now' : 'Forecasted']} />
                  <Bar dataKey="current" fill="#3B82F6" radius={[0, 3, 3, 0]} name="Current" />
                  <Bar dataKey="forecast" fill="#F59E0B" radius={[0, 3, 3, 0]} name="Forecast" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Stop table */}
        <div className="space-y-2">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">All Stops — Forecast by Time Slot</h2>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Stop', 'City', 'Route', 'Now', 'Level', ...TIME_LABELS.map(t => t.slot.split('–')[0])].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.slice(0, 20).map((stop, i) => (
                    <tr key={stop.id} data-testid={`heatmap-stop-${stop.id}`}
                      onClick={() => setSelectedStopId(stop.id === selectedStopId ? null : stop.id)}
                      className={`border-b border-border/50 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-muted/20'} ${selectedStopId === stop.id ? 'bg-primary/10' : 'hover:bg-muted/30'}`}>
                      <td className="px-3 py-2 font-medium whitespace-nowrap">{stop.name}</td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{stop.cityName}</td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{stop.routeName}</td>
                      <td className="px-3 py-2 font-bold">{stop.passengerCount}</td>
                      <td className="px-3 py-2"><StatusBadge status={stop.crowdLevel === 'high' ? 'crowded' : stop.crowdLevel === 'medium' ? 'crowded' : 'stop'} label={stop.crowdLevel === 'high' ? 'High' : stop.crowdLevel === 'medium' ? 'Med' : 'Low'} /></td>
                      {TIME_LABELS.map(t => (
                        <td key={t.slot} className="px-3 py-2 text-center">
                          <span className={`font-medium ${stop.forecast[t.slot] > 20 ? 'text-transit-high' : stop.forecast[t.slot] > 10 ? 'text-transit-medium' : 'text-transit-low'}`}>
                            {stop.forecast[t.slot]}
                          </span>
                        </td>
                      ))}
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
